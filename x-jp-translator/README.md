# X JP Translator (Chrome Extension)

単一X投稿の本文を取得し、日本語翻訳して表示する拡張です。画像URLはそのまま表示します。

## 使い方
1. `chrome://extensions` を開く
2. デベロッパーモードON
3. `Load unpacked` でこのフォルダを読み込み
4. 拡張を開き、OpenAI APIキーとX投稿URLを入力

## 注意
- X側仕様変更で取得成功率が変わる可能性があります
- APIキーは `chrome.storage.local` に保存されます
