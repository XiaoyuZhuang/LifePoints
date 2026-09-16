package com.xiaoyuzhuang.lifepoints;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int EXPORT_REQUEST_CODE = 1001;
    private WebView webView;
    private String pendingExportJson;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.WHITE);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new AndroidBridge(), "LifePointsAndroid");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
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
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                return false;
            }
        });
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void applyTheme(String theme) {
        runOnUiThread(() -> {
            boolean black = "black".equalsIgnoreCase(theme);
            int color = black ? Color.BLACK : Color.WHITE;
            getWindow().setStatusBarColor(color);
            getWindow().setNavigationBarColor(color);
            int flags = getWindow().getDecorView().getSystemUiVisibility();
            if (black) {
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            } else {
                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            getWindow().getDecorView().setSystemUiVisibility(flags);
            webView.setBackgroundColor(color);
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
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }

    public class AndroidBridge {
        @JavascriptInterface public void setTheme(String theme) { applyTheme(theme); }
        @JavascriptInterface public void exportData(String json) { runOnUiThread(() -> launchExport(json)); }
    }
}
