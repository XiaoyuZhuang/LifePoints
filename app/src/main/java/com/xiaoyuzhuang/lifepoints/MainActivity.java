package com.xiaoyuzhuang.lifepoints;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int EXPORT_REQUEST_CODE = 1001;
    private static final String PREFS = "lifepoints_native";
    private static final String PREF_THEME = "theme";

    private FrameLayout root;
    private WebView webView;
    private String pendingExportJson;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String initialTheme = getSharedPreferences(PREFS, MODE_PRIVATE).getString(PREF_THEME, "light");
        int initialColor = "black".equals(initialTheme) ? Color.BLACK : Color.WHITE;

        root = new FrameLayout(this);
        root.setBackgroundColor(initialColor);

        webView = new WebView(this);
        webView.setBackgroundColor(initialColor);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setHapticFeedbackEnabled(true);

        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        );
        root.addView(webView, webParams);
        setContentView(root);

        root.setOnApplyWindowInsetsListener((view, insets) -> {
            int top;
            int bottom;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                top = bars.top;
                bottom = bars.bottom;
            } else {
                top = insets.getSystemWindowInsetTop();
                bottom = insets.getSystemWindowInsetBottom();
            }
            FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) webView.getLayoutParams();
            if (lp.topMargin != top || lp.bottomMargin != bottom) {
                lp.topMargin = top;
                lp.bottomMargin = bottom;
                webView.setLayoutParams(lp);
            }
            return insets;
        });
        root.requestApplyInsets();

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setTextZoom(100);

        webView.addJavascriptInterface(new AndroidBridge(), "LifePointsAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectAssetScript("timeline_undo.js");
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openExternal(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternal(Uri.parse(url));
            }

            private boolean openExternal(Uri uri) {
                String scheme = uri.getScheme();
                if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "No browser available", Toast.LENGTH_SHORT).show();
                    }
                    return true;
                }
                return false;
            }
        });

        applyTheme(initialTheme);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void injectAssetScript(String assetName) {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(getAssets().open(assetName), StandardCharsets.UTF_8))) {
            StringBuilder script = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                script.append(line).append('\n');
            }
            webView.evaluateJavascript(script.toString(), null);
        } catch (Exception ignored) {
        }
    }

    private void applyTheme(String theme) {
        runOnUiThread(() -> {
            boolean black = "black".equalsIgnoreCase(theme);
            int color = black ? Color.BLACK : Color.WHITE;

            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString(PREF_THEME, black ? "black" : "light").apply();
            root.setBackgroundColor(color);
            webView.setBackgroundColor(color);

            getWindow().setStatusBarColor(color);
            getWindow().setNavigationBarColor(color);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                getWindow().setStatusBarContrastEnforced(false);
                getWindow().setNavigationBarContrastEnforced(false);
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = getWindow().getInsetsController();
                if (controller != null) {
                    int mask = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                            | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                    controller.setSystemBarsAppearance(black ? 0 : mask, mask);
                }
            } else {
                int flags = getWindow().getDecorView().getSystemUiVisibility();
                if (black) {
                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    }
                } else {
                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                    }
                }
                getWindow().getDecorView().setSystemUiVisibility(flags);
            }
        });
    }

    private void performHaptic(String kind) {
        runOnUiThread(() -> {
            int constant = HapticFeedbackConstants.VIRTUAL_KEY;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if ("success".equalsIgnoreCase(kind)) {
                    constant = HapticFeedbackConstants.CONFIRM;
                } else if ("warning".equalsIgnoreCase(kind)) {
                    constant = HapticFeedbackConstants.REJECT;
                }
            } else if ("warning".equalsIgnoreCase(kind)) {
                constant = HapticFeedbackConstants.LONG_PRESS;
            }
            webView.performHapticFeedback(constant);
        });
    }

    private void launchExport(String json) {
        pendingExportJson = json;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, "lifepoints-data.json");
        startActivityForResult(intent, EXPORT_REQUEST_CODE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != EXPORT_REQUEST_CODE || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
            if (out != null && pendingExportJson != null) {
                out.write(pendingExportJson.getBytes(StandardCharsets.UTF_8));
                Toast.makeText(this, "LifePoints data exported", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Export failed", Toast.LENGTH_SHORT).show();
        } finally {
            pendingExportJson = null;
        }
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript(
                "window.LifePointsBack ? String(window.LifePointsBack()) : 'false'",
                result -> {
                    boolean handled = "\"true\"".equals(result) || "true".equals(result);
                    if (!handled) finish();
                }
        );
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void setTheme(String theme) {
            applyTheme(theme);
        }

        @JavascriptInterface
        public void haptic(String kind) {
            performHaptic(kind);
        }

        @JavascriptInterface
        public void exportData(String json) {
            runOnUiThread(() -> launchExport(json));
        }
    }
}
