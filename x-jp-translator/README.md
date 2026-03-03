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

## 権限
- `storage`: APIキー保存
- `https://x.com/*`, `https://twitter.com/*`: 投稿本文読取・翻訳表示
- `https://publish.twitter.com/*`: 単一投稿URL翻訳（oEmbed取得）
- `https://api.openai.com/*`: 翻訳API実行

## 公開準備
- プライバシーポリシー: `PRIVACY.md`
- ストア提出文面: `STORE_LISTING_JA.md`
- アイコン: `icons/icon-16.png`, `icons/icon-32.png`, `icons/icon-48.png`, `icons/icon-128.png`

## 注意
- X側仕様変更で取得成功率が変わる可能性があります
- APIキーはローカル保存です（端末内）
- 翻訳は OpenAI API 課金対象です
