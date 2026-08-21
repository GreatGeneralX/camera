# 無音カメラ

GitHub Pages などの HTTPS 環境で使える、サーバー不要のカメラ Web アプリです。

## 公開方法

1. このフォルダを GitHub リポジトリに push します。
2. リポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の Source を **Deploy from a branch**、Branch を `main` / `(root)` にして保存します。
4. 表示された URL をスマホの Safari / Chrome で開き、カメラ権限を許可します。

撮影データはサーバーへ送信されません。保存ボタンから、端末の共有・写真保存を行えます。

> ブラウザ側はシャッター音を再生しません。ただし、端末・OS・地域の仕様による撮影音は Web アプリから無効化できません。
