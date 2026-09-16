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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class UpdateBridge {
    private static final String LATEST_RELEASE_API =
            "https://api.github.com/repos/XiaoyuZhuang/LifePoints/releases/latest";
    private static final String TRUSTED_RELEASE_PREFIX =
            "https://github.com/XiaoyuZhuang/LifePoints/releases/download/";

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
        if (downloadUrl == null
                || !downloadUrl.startsWith(TRUSTED_RELEASE_PREFIX)) {
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

    private void checkForUpdateInternal() {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection)
                    new URL(LATEST_RELEASE_API).openConnection();
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(12000);
            connection.setRequestProperty(
                    "Accept",
                    "application/vnd.github+json"
            );
            connection.setRequestProperty(
                    "User-Agent",
                    "LifePoints-Android"
            );
            connection.setRequestProperty(
                    "X-GitHub-Api-Version",
                    "2022-11-28"
            );

            int code = connection.getResponseCode();
            if (code != HttpURLConnection.HTTP_OK) {
                JSONObject error = new JSONObject();
                error.put("status", "error");
                if (code == HttpURLConnection.HTTP_NOT_FOUND) {
                    error.put(
                            "message",
                            "No public release is available. If this repository is private, make it public before using in-app updates."
                    );
                } else {
                    error.put(
                            "message",
                            "GitHub returned HTTP " + code + "."
                    );
                }
                sendUpdateResult(error);
                return;
            }

            JSONObject release =
                    new JSONObject(readUtf8(connection.getInputStream()));
            String tag = release.optString("tag_name", "");
            String releaseName = release.optString("name", tag);
            long remoteCode = versionCodeFromTag(tag);
            long localCode = currentVersionCode();

            JSONArray assets = release.optJSONArray("assets");
            String apkUrl = null;
            if (assets != null) {
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.optJSONObject(i);
                    if (asset == null) continue;
                    String name = asset.optString("name", "");
                    String candidate =
                            asset.optString("browser_download_url", "");
                    if ("LifePoints.apk".equals(name)) {
                        apkUrl = candidate;
                        break;
                    }
                    if (apkUrl == null
                            && name.toLowerCase().endsWith(".apk")) {
                        apkUrl = candidate;
                    }
                }
            }

            JSONObject result = new JSONObject();
            if (remoteCode <= 0 || apkUrl == null || apkUrl.isBlank()) {
                result.put("status", "error");
                result.put(
                        "message",
                        "The latest GitHub Release does not contain a valid LifePoints APK."
                );
            } else if (remoteCode <= localCode) {
                result.put("status", "latest");
                result.put("version", releaseName);
                result.put("currentVersion", getVersionName());
            } else {
                result.put("status", "available");
                result.put("version", releaseName);
                result.put("versionCode", remoteCode);
                result.put("currentVersion", getVersionName());
                result.put("downloadUrl", apkUrl);
                result.put(
                        "releaseUrl",
                        release.optString("html_url", "")
                );
            }
            sendUpdateResult(result);
        } catch (Exception e) {
            try {
                JSONObject error = new JSONObject();
                error.put("status", "error");
                error.put(
                        "message",
                        "Could not reach GitHub. Check your network connection and try again."
                );
                sendUpdateResult(error);
            } catch (Exception ignored) {
            }
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private void downloadUpdateInternal(String downloadUrl) {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection)
                    new URL(downloadUrl).openConnection();
            connection.setInstanceFollowRedirects(true);
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(30000);
            connection.setRequestProperty(
                    "User-Agent",
                    "LifePoints-Android"
            );

            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) {
                sendDownloadState(
                        "error",
                        "The APK download failed with HTTP " + code + "."
                );
                return;
            }

            File directory =
                    activity.getExternalFilesDir(
                            Environment.DIRECTORY_DOWNLOADS
                    );
            if (directory == null) {
                directory = activity.getCacheDir();
            }
            if (!directory.exists() && !directory.mkdirs()) {
                sendDownloadState(
                        "error",
                        "Could not create the update folder."
                );
                return;
            }

            File apk = new File(directory, "LifePoints-update.apk");
            try (BufferedInputStream input =
                         new BufferedInputStream(
                                 connection.getInputStream()
                         );
                 FileOutputStream output =
                         new FileOutputStream(apk)) {
                byte[] buffer = new byte[16384];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    output.write(buffer, 0, read);
                }
            }

            if (!apk.exists() || apk.length() < 1024) {
                sendDownloadState(
                        "error",
                        "The downloaded APK was incomplete."
                );
                return;
            }

            pendingUpdateApk = apk;
            sendDownloadState(
                    "installing",
                    "Opening the Android installer…"
            );
            activity.runOnUiThread(() -> requestInstall(apk));
        } catch (Exception e) {
            sendDownloadState(
                    "error",
                    "Could not download the update."
            );
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private boolean canInstallPackages() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.O
                || activity.getPackageManager()
                .canRequestPackageInstalls();
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
                        Uri.parse(
                                "package:" + activity.getPackageName()
                        )
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

    private void sendDownloadState(
            String status,
            String message
    ) {
        try {
            JSONObject result = new JSONObject();
            result.put("status", status);
            result.put(
                    "message",
                    message == null ? "" : message
            );
            activity.runOnUiThread(() -> webView.evaluateJavascript(
                    "window.LifePointsDownloadState&&window.LifePointsDownloadState("
                            + result.toString() + ");",
                    null
            ));
        } catch (Exception ignored) {
        }
    }
}
