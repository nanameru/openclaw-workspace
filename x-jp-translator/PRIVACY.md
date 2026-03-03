# Privacy Policy - X JP Translator

最終更新日: 2026-03-03

## 概要
X JP Translator は、X（旧Twitter）上の投稿本文を日本語翻訳するための Chrome 拡張です。

## 収集する情報
本拡張は、以下の情報をローカル（ユーザー端末内）に保存します。

- OpenAI APIキー（`chrome.storage.local`）

本拡張は、開発者サーバーへユーザーデータを送信・保存しません。

## 外部送信
翻訳実行時に、以下の送信が行われます。

1. 投稿本文（翻訳対象テキスト）
2. OpenAI API へのリクエスト（認証ヘッダーとして APIキーを利用）

送信先:
- `https://api.openai.com/*`

## 権限の利用目的
- `storage`: APIキー保存のため
- `https://x.com/*`, `https://twitter.com/*`: 投稿本文の取得と翻訳ボタン表示のため
- `https://publish.twitter.com/*`: ポップアップのURL翻訳機能（oEmbed取得）のため
- `https://api.openai.com/*`: 翻訳実行のため

## データ共有
本拡張は、ユーザーデータを第三者に販売・共有しません。

## 免責
翻訳品質や外部API仕様変更により、期待する動作にならない場合があります。

## 問い合わせ
必要に応じて、配布元リポジトリの Issue を利用してください。
