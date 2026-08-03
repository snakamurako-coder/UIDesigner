// ==========================================
// UI Builder - バックエンド (code.gs)
// ==========================================

/**
 * WebアプリのURLにアクセスされた時に自動で実行される必須関数
 * サーバー側でHTMLを構築し、ブラウザに返します。
 */
function doGet(e) {
  // 'index' という名前のファイル（index.html）を読み込んで画面を生成
  const htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  
  // ブラウザのタブに表示されるタイトル
  htmlOutput.setTitle('GAS UI Builder');
  
  // モバイル端末での表示崩れを防ぐためのビューポート設定
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
  // iframe（外部サイトなど）での埋め込み表示を許可する設定
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}

/**
 * HTML/JSの分割管理用ヘルパー関数（大規模化する場合に便利です）
 * HTMLファイル内で <?!= include('ファイル名'); ?> と書くことで、別ファイルを読み込めます。
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// 以下は今後のステップで利用するデータ保存・連携用のAPI（準備）
// ==========================================

/**
 * フロントエンドで作成したUIデータ（JSON）をGAS側に保存する関数
 * フロントエンドのJSから `google.script.run.saveUIData(jsonString)` で呼び出します。
 */
function saveUIData(jsonData) {
  try {
    // 例: プロパティサービスを使ってGASのプロジェクト内に簡易保存する
    PropertiesService.getUserProperties().setProperty('saved_ui_layout', jsonData);
    
    // ※スプレッドシートやGoogle Driveのテキストファイルに保存するよう変更することも可能です。
    
    return { success: true, message: "デザインデータを保存しました" };
  } catch (error) {
    console.error("保存エラー: " + error.message);
    return { success: false, message: "エラーが発生しました: " + error.message };
  }
}

/**
 * 保存しておいたUIデータ（JSON）を読み込む関数
 * 画面を開いた時に前回の状態を復元するために使います。
 */
function loadUIData() {
  try {
    const data = PropertiesService.getUserProperties().getProperty('saved_ui_layout');
    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, data: null };
  }
}