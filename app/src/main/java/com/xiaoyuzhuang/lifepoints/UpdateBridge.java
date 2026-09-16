package com.xiaoyuzhuang.lifepoints;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UpdateBridge {
    private static final String REPO_BASE =
            "https://github.com/XiaoyuZhuang/LifePoints";
    private static final String LATEST_RELEASE_API =
            "https://api.github.com/repos/XiaoyuZhuang/LifePoints/releases/latest";
    private static final String LATEST_RELEASE_PAGE =
            REPO_BASE + "/releases/latest";
    private static final String LATEST_APK_URL =
            REPO_BASE + "/releases/latest/download/LifePoints.apk";
    private static final String RELEASE_DOWNLOAD_PREFIX =
            REPO_BASE + "/releases/download/";

    private static final Pattern RELEASE_TAG_PAGE_PATTERN =
            Pattern.compile("/releases/tag/([^/?#]+)");
    private static final Pattern RELEASE_TAG_DOWNLOAD_PATTERN =
            Pattern.compile("/releases/download/([^/?#]+)/");

    private final Activity activity;
    private final WebView webView;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private File pendingUpdateApk;
    private boolean waitingForInstallPermission = false;

    public UpdateBridge(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
    }

    @JavascriptInterface
    public String getVersionName() {
        try {
            PackageInfo info = activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0);
            return info.versionName == null ? "" : info.versionName;
        } catch (Exception ignored) {
            return "";
        }
    }

    @JavascriptInterface
    public void checkForUpdate() {
        executor.execute(this::checkForUpdateInternal);
    }

    @JavascriptInterface
    public void downloadUpdate(String downloadUrl, String version) {
        if (!isTrustedDownloadUrl(downloadUrl)) {
            sendDownloadState(
                    "error",
                    "The update URL was not recognized."
            );
            return;
        }
        sendDownloadState("downloading", "Downloading " + version + "…");
        executor.execute(() -> downloadUpdateInternal(downloadUrl));
    }

    public void onResume() {
        if (!waitingForInstallPermission || pendingUpdateApk == null) {
            return;
        }

        waitingForInstallPermission = false;
        if (canInstallPackages()) {
            File apk = pendingUpdateApk;
            pendingUpdateApk = null;
            launchInstaller(apk);
        } else {
            sendDownloadState(
                    "error",
                    "Installation permission was not enabled."
            );
        }
    }

    public void shutdown() {
        executor.shutdownNow();
    }

    private boolean isTrustedDownloadUrl(String url) {
        if (url == null) return false;
        return url.startsWith(RELEASE_DOWNLOAD_PREFIX)
                || LATEST_APK_URL.equals(url);
    }

    private long currentVersionCode() {
        try {
            PackageInfo info = activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return info.getLongVersionCode();
            }
            return info.versionCode;
        } catch (Exception ignored) {
            return 0;
        }
    }

    private long versionCodeFromTag(String tag) {
        if (tag == null) return -1;
        Matcher matcher = Pattern.compile("(\\d+)$").matcher(tag);
        if (!matcher.find()) return -1;
        try {
            return Long.parseLong(matcher.group(1));
        } catch (Exception ignored) {
            return -1;
        }
    }

    private String readUtf8(InputStream input) throws Exception {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                builder.append(line);
            }
        }
        return builder.toString();
    }

    private HttpURLConnection openConnection(String url) throws Exception {
        HttpURLConnection connection = (HttpURLConnection)
                new URL(url).openConnection();
        connection.setConnectTimeout(12000);
        connection.setReadTimeout(15000);
        connection.setRequestProperty("User-Agent", "LifePoints-Android");
        return connection;
    }

    private void checkForUpdateInternal() {
        List<String> failures = new ArrayList<>();

        try {
            sendUpdateResult(checkViaApi());
            return;
        } catch (Exception e) {
            failures.add("API");
        }

        try {
            sendUpdateResult(checkViaLatestPage());
            return;
        } catch (Exception e) {
            failures.add("release page");
        }

        try {
            sendUpdateResult(checkViaLatestAssetRedirect());
            return;
        } catch (Exception e) {
            failures.add("latest asset");
        }

        try {
            JSONObject error = new JSONObject();
            error.put("status", "error");
            error.put(
                    "message",
                    "Could not reach the GitHub release through the available official paths."
            );
            error.put("releaseUrl", LATEST_RELEASE_PAGE);
            sendUpdateResult(error);
        } catch (Exception ignored) {
        }
    }

    private JSONObject checkViaApi() throws Exception {
        HttpURLConnection connection = null;
        try {
            connection = openConnection(LATEST_RELEASE_API);
            connection.setInstanceFollowRedirects(true);
            connection.setRequestProperty(
                    "Accept",
                    "application/vnd.github+json"
            );
            connection.setRequestProperty(
                    "X-GitHub-Api-Version",
                    "2022-11-28"
            );

            int code = connection.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) {
                throw new Exception("GitHub API HTTP " + code);
            }

            JSONObject release =
                    new JSONObject(readUtf8(connection.getInputStream()));
            String tag = release.optString("tag_name", "");
            String releaseName = release.optString("name", tag);
            long remoteCode = versionCodeFromTag(tag);
            if (remoteCode <= 0) throw new Exception("Invalid release tag");

            JSONArray assets = release.optJSONArray("assets");
            String apkUrl = null;
            if (assets != null) {
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.optJSONObject(i);
                    if (asset == null) continue;
                    String name = asset.optString("name", "");
                    String candidate =
                            asset.optString("browser_download_url", "");
                    if ("LifePoints.apk".equals(name)
                            && isTrustedDownloadUrl(candidate)) {
                        apkUrl = candidate;
                        break;
                    }
                    if (apkUrl == null
                            && name.toLowerCase().endsWith(".apk")
                            && isTrustedDownloadUrl(candidate)) {
                        apkUrl = candidate;
                    }
                }
            }
            if (apkUrl == null) apkUrl = LATEST_APK_URL;

            return buildUpdateResult(
                    remoteCode,
                    releaseName.isBlank() ? tag : releaseName,
                    apkUrl,
                    release.optString("html_url", LATEST_RELEASE_PAGE)
            );
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private JSONObject checkViaLatestPage() throws Exception {
        HttpURLConnection connection = null;
        try {
            connection = openConnection(LATEST_RELEASE_PAGE);
            connection.setInstanceFollowRedirects(true);
            int code = connection.getResponseCode();
            if (code < 200 || code >= 400) {
                throw new Exception("Release page HTTP " + code);
            }

            String finalUrl = connection.getURL().toString();
            Matcher matcher = RELEASE_TAG_PAGE_PATTERN.matcher(finalUrl);
            if (!matcher.find()) {
                throw new Exception("Could not resolve latest release tag");
            }
            String tag = matcher.group(1);
            long remoteCode = versionCodeFromTag(tag);
            if (remoteCode <= 0) throw new Exception("Invalid release tag");

            return buildUpdateResult(
                    remoteCode,
                    tag,
                    LATEST_APK_URL,
                    finalUrl
            );
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private JSONObject checkViaLatestAssetRedirect() throws Exception {
        HttpURLConnection connection = null;
        try {
            connection = openConnection(LATEST_APK_URL);
            connection.setInstanceFollowRedirects(false);
            int code = connection.getResponseCode();
            if (code < 300 || code >= 400) {
                throw new Exception("Latest asset did not redirect");
            }

            String location = connection.getHeaderField("Location");
            if (location == null || location.isBlank()) {
                throw new Exception("Missing asset redirect");
            }
            String resolved = new URL(new URL(LATEST_APK_URL), location).toString();
            Matcher matcher = RELEASE_TAG_DOWNLOAD_PATTERN.matcher(resolved);
            if (!matcher.find()) {
                throw new Exception("Could not resolve release tag from asset");
            }
            String tag = matcher.group(1);
            long remoteCode = versionCodeFromTag(tag);
            if (remoteCode <= 0) throw new Exception("Invalid release tag");

            return buildUpdateResult(
                    remoteCode,
                    tag,
                    LATEST_APK_URL,
                    LATEST_RELEASE_PAGE
            );
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private JSONObject buildUpdateResult(
            long remoteCode,
            String version,
            String downloadUrl,
            String releaseUrl
    ) throws Exception {
        JSONObject result = new JSONObject();
        long localCode = currentVersionCode();
        if (remoteCode <= localCode) {
            result.put("status", "latest");
            result.put("version", version);
            result.put("currentVersion", getVersionName());
        } else {
            result.put("status", "available");
            result.put("version", version);
            result.put("versionCode", remoteCode);
            result.put("currentVersion", getVersionName());
            result.put("downloadUrl", downloadUrl);
            result.put("releaseUrl", releaseUrl);
        }
        return result;
    }

    private String resolveLatestTagFromPage() {
        HttpURLConnection connection = null;
        try {
            connection = openConnection(LATEST_RELEASE_PAGE);
            connection.setInstanceFollowRedirects(true);
            int code = connection.getResponseCode();
            if (code < 200 || code >= 400) return null;
            Matcher matcher = RELEASE_TAG_PAGE_PATTERN.matcher(
                    connection.getURL().toString()
            );
            return matcher.find() ? matcher.group(1) : null;
        } catch (Exception ignored) {
            return null;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private void downloadUpdateInternal(String requestedUrl) {
        Set<String> candidates = new LinkedHashSet<>();
        if (isTrustedDownloadUrl(requestedUrl)) candidates.add(requestedUrl);
        candidates.add(LATEST_APK_URL);

        String latestTag = resolveLatestTagFromPage();
        if (latestTag != null && !latestTag.isBlank()) {
            candidates.add(
                    RELEASE_DOWNLOAD_PREFIX
                            + latestTag
                            + "/LifePoints.apk"
            );
        }

        for (String candidate : candidates) {
            File apk = tryDownload(candidate);
            if (apk != null) {
                pendingUpdateApk = apk;
                sendDownloadState(
                        "installing",
                        "Opening the Android installer…"
                );
                activity.runOnUiThread(() -> requestInstall(apk));
                return;
            }
        }

        sendDownloadState(
                "error",
                "Could not download the update through the available GitHub paths."
        );
    }

    private File tryDownload(String downloadUrl) {
        if (!isTrustedDownloadUrl(downloadUrl)) return null;

        HttpURLConnection connection = null;
        File apk = null;
        try {
            connection = openConnection(downloadUrl);
            connection.setInstanceFollowRedirects(true);
            connection.setReadTimeout(30000);

            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) return null;

            File directory = activity.getExternalFilesDir(
                    Environment.DIRECTORY_DOWNLOADS
            );
            if (directory == null) directory = activity.getCacheDir();
            if (!directory.exists() && !directory.mkdirs()) return null;

            apk = new File(directory, "LifePoints-update.apk");
            try (BufferedInputStream input = new BufferedInputStream(
                    connection.getInputStream()
            ); FileOutputStream output = new FileOutputStream(apk)) {
                byte[] buffer = new byte[16384];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                }
            }

            if (!apk.exists() || apk.length() < 1024) {
                if (apk.exists()) apk.delete();
                return null;
            }
            return apk;
        } catch (Exception ignored) {
            if (apk != null && apk.exists()) apk.delete();
            return null;
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private boolean canInstallPackages() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.O
                || activity.getPackageManager().canRequestPackageInstalls();
    }

    private void requestInstall(File apk) {
        if (!canInstallPackages()) {
            pendingUpdateApk = apk;
            waitingForInstallPermission = true;
            sendDownloadState(
                    "permission",
                    "Allow LifePoints to install unknown apps, then return to continue."
            );
            try {
                Intent intent = new Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + activity.getPackageName())
                );
                activity.startActivity(intent);
            } catch (Exception e) {
                waitingForInstallPermission = false;
                sendDownloadState(
                        "error",
                        "Open Android settings and allow LifePoints to install unknown apps."
                );
            }
            return;
        }

        pendingUpdateApk = null;
        launchInstaller(apk);
    }

    private void launchInstaller(File apk) {
        try {
            Uri uri = FileProvider.getUriForFile(
                    activity,
                    activity.getPackageName() + ".fileprovider",
                    apk
            );
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(
                    uri,
                    "application/vnd.android.package-archive"
            );
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(intent);
        } catch (Exception e) {
            sendDownloadState(
                    "error",
                    "Android could not open the update installer."
            );
        }
    }

    private void sendUpdateResult(JSONObject result) {
        activity.runOnUiThread(() -> webView.evaluateJavascript(
                "window.LifePointsUpdateResult&&window.LifePointsUpdateResult("
                        + result.toString() + ");",
                null
        ));
    }

    private void sendDownloadState(String status, String message) {
        try {
            JSONObject result = new JSONObject();
            result.put("status", status);
            result.put("message", message == null ? "" : message);
            activity.runOnUiThread(() -> webView.evaluateJavascript(
                    "window.LifePointsDownloadState&&window.LifePointsDownloadState("
                            + result.toString() + ");",
                    null
            ));
        } catch (Exception ignored) {
        }
    }
}
