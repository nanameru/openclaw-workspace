# Transcript App 実装計画（YouTube / X）

## 目的
- Proactor系ユースケースを日本向けに再設計した、動画リンク文字起こしWebアプリを実装する。
- 対応: YouTube / X（最優先）

## 方針
- 完全コピーはしない（独自UI・独自文言）
- 機能同等レベルを狙う
- 法的・規約順守を明記する

## MVP要件
1. URL入力（YouTube/X）
2. 文字起こし実行
3. 結果表示
4. Copy / TXTダウンロード
5. 日本語UI
6. about/help/terms/privacy/legal/status

## 技術案
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- APIルートで抽出パイプライン
- Whisper系ASR（サーバー側）

## メモ
- Xは取得制約が強いので、URL直接取得が失敗する場合は代替導線を提供する。
- YouTubeは字幕取得可能時は字幕優先、不可時は音声抽出→ASR。
