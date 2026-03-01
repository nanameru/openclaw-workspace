# JP Link Transcript (MVP)

YouTube / X の動画URLから文字起こしを取得する日本向けMVPです。

## 実装状況
- ✅ YouTube URL 文字起こし（`youtube-transcript`）
- ⚠️ X URL はベータ（プラットフォーム制約により段階導入）
- ✅ Copy / Export TXT
- ✅ 必須ページ: about/help/terms/privacy/legal/status

## 開発
```bash
npm install
npm run dev
```

## 環境変数
`.env.local` を作成して設定:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
OPENAI_API_KEY=...
# Convex（導入時）
NEXT_PUBLIC_CONVEX_URL=...
```

## Xフォールバック要件
- `yt-dlp` をOSにインストールしてPATHを通す
- `OPENAI_API_KEY` を設定（Whisper転写用）

## 法務・規約注意
- 著作権侵害用途は禁止
- 各プラットフォームの利用規約を順守
- Xは仕様変更で取得失敗の可能性あり

## 今後（本番化）
1. Clerk認証
2. Convex保存
3. Whisper fallback (yt-dlp経由)
4. 課金とクレジット制
5. ログ/監視
