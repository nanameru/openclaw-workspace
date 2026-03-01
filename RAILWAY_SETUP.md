# Railway Extractor Setup

Vercelでは `yt-dlp` 実行が不安定なため、抽出処理はRailwayへ分離します。

## Vercel側に入れる環境変数

- `EXTRACTOR_API_URL` = Railwayで立てたAPIのURL
- `EXTRACTOR_API_TOKEN` = 任意のBearerトークン（Railway側と一致）

## Railway側の想定API仕様

`POST /transcribe`

Request:
```json
{
  "provider": "x",
  "url": "https://x.com/..."
}
```

Response:
```json
{
  "text": "...",
  "language": "ja",
  "engine": "deepgram",
  "warnings": ["..."]
}
```

Headers (optional):

- `Authorization: Bearer <EXTRACTOR_API_TOKEN>`

## 備考

- このリポジトリ側は、`EXTRACTOR_API_URL` が設定されている場合にRailway APIを優先します。
- 未設定の場合は従来のローカル処理（yt-dlp実行）を試します。
