// ==========================================
// GAS UI Designer & Simulator - バックエンド (コード.js)
// ==========================================

/**
 * WebアプリのURLにアクセスされた時に自動で実行される必須関数
 */
function doGet(e) {
  const htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  htmlOutput.setTitle('GAS UI Designer & Web Simulator');
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return htmlOutput;
}

/**
 * HTML/JSの分割管理用ヘルパー関数
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 外部URLのコンテンツを取得するプロキシ関数（CORS回避・シミュレーター用）
 */
function fetchExternalUrl(targetUrl) {
  try {
    let url = targetUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const responseCode = response.getResponseCode();
    let content = response.getContentText('UTF-8');
    
    // スクリプトタグの無効化（安全対策および実行エラー防止）
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // 相対パスの絶対URL化処理
    const match = url.match(/^(https?:\/\/[^\/]+)/i);
    const baseUrl = match ? match[1] : url;
    content = content.replace(/(href|src)=["'](?!\/\/|http)(?:\.?\/)?([^"']+)["']/gi, `$1="${baseUrl}/$2"`);
    
    return {
      success: true,
      url: url,
      statusCode: responseCode,
      content: content
    };
  } catch (error) {
    console.error("Fetch Error: " + error.toString());
    return {
      success: false,
      message: "Webページの取得に失敗しました: " + error.message
    };
  }
}

/**
 * UIデザインデータ（JSON）の保存
 */
function saveUIData(jsonData) {
  try {
    PropertiesService.getUserProperties().setProperty('saved_ui_layout', jsonData);
    return { success: true, message: "デザインデータを保存しました。" };
  } catch (error) {
    console.error("Save error: " + error.message);
    return { success: false, message: "保存失敗: " + error.message };
  }
}

/**
 * UIデザインデータ（JSON）の読み込み
 */
function loadUIData() {
  try {
    const data = PropertiesService.getUserProperties().getProperty('saved_ui_layout');
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, data: null, message: error.message };
  }
}