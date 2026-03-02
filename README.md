# Photo to Life JP (MVP)

Pruna AI P-Video（Replicate）を基盤に、写真を短い動画へ変換する日本向けSaaSです。  
※ 参照サービスの完コピではなく、機能同等の独自UI/独自文言で実装しています。

## 実装状況
- ✅ 日本語LP / ダッシュボードUI
- ✅ 画像アップロード → 生成ジョブ作成
- ✅ ジョブ状態ポーリング（queued/running/done/failed）
- ✅ 日本語エラー分類（認証失敗・混雑・容量超過など）
- ✅ 法務ページ（about/help/terms/privacy/legal/status）

## 開発
```bash
npm install
npm run dev
```

## 必須環境変数
`.env.local` を作成して設定:
```bash
REPLICATE_API_TOKEN=...
REPLICATE_MODEL_VERSION=... # Pruna AI P-Video の model version
```

任意（既存機能）:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DEEPGRAM_API_KEY=...
OPENAI_API_KEY=...
NEXT_PUBLIC_CONVEX_URL=...
```

## API
- `POST /api/generate`
  - multipart: `image`, `prompt`, `aspectRatio`
- `GET /api/generate/:jobId`
  - ジョブ状態取得
- `GET /api/generate/:jobId/download`
  - MVPではダウンロード導線（本番では署名付きURLに置換予定）

## 注意事項
- 権利侵害画像のアップロードは禁止
- 生成結果の利用責任はユーザーに帰属
- 生成動画は原則、速度変更や追加編集を行わない出力を前提
