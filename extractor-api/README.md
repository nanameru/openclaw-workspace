# JP Transcript Extractor API (VPS)

Node.js版（採用）です。`yt-dlp + ffmpeg` を常駐させて `/transcribe` を提供します。

## 1. VPSセットアップ

```bash
bash scripts/install-vps.sh
# 再ログイン
```

## 2. 配置

```bash
git clone <your-repo-url> extractor-api
cd extractor-api/extractor-api
cp .env.example .env
# .env を編集
```

## 3. 起動

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:8080/health
```

## 4. systemd 常駐化

```bash
bash scripts/enable-systemd.sh "$PWD"
```

## 5. Vercel環境変数を設定

```bash
vercel env add EXTRACTOR_API_URL production --value "https://<your-domain-or-ip>:8080" --yes --force
vercel env add EXTRACTOR_API_TOKEN production --value "<same-token-as-vps>" --yes --force
vercel env add EXTRACTOR_API_URL preview --value "https://<your-domain-or-ip>:8080" --yes --force
vercel env add EXTRACTOR_API_TOKEN preview --value "<same-token-as-vps>" --yes --force
```

※ TLS終端はNginx/Caddy推奨。

## API

- `GET /health`
- `POST /transcribe`
  - Header: `Authorization: Bearer <EXTRACTOR_API_TOKEN>`
  - Body: `{ "provider": "x", "url": "https://x.com/..." }`
