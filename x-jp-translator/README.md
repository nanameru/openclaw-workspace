# X JP Translator (Chrome Extension)

X投稿の本文を日本語翻訳して表示する拡張です。画像URLはそのまま表示します。

## 対応機能
- ポップアップから単一投稿URLを翻訳（MVP機能）
- Xタイムライン上の各投稿に「日本語訳」ボタンを追加（v1.1）
- OpenAI APIキーを `chrome.storage.local` に保存

## 使い方
1. `chrome://extensions` を開く
2. デベロッパーモードON
3. `Load unpacked` でこのフォルダを読み込み
4. 拡張ポップアップでOpenAI APIキーを入力
5. `x.com` を開き、投稿下の「日本語訳」ボタンを押す

## 注意
- X側仕様変更で取得成功率が変わる可能性があります
- APIキーはローカル保存です（端末内）
- 翻訳は OpenAI API 課金対象です
