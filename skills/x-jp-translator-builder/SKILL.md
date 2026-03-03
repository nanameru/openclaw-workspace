---
name: x-jp-translator-builder
description: Build, update, and package a personal-use Chrome extension that translates X post text to Japanese. Use when creating or modifying manifest/popup/background/content scripts, preparing privacy/store listing files, generating release zip, and producing Web Store submission copy.
---

# X JP Translator Builder

Create or update a personal-use Chrome extension in `x-jp-translator/`.

## Do
- Keep implementation focused on:
  - translating only post text
  - leaving images unchanged
  - popup API key input and local storage (`chrome.storage.local`)
- Keep files aligned with the template in `assets/template/`.
- Increment `manifest.json` version when behavior changes.
- Generate release zip to `x-jp-translator/dist/x-jp-translator-v<version>.zip`.
- Provide concise release notes and commit changes.

## Base file set
- `manifest.json`
- `popup.html`
- `popup.js`
- `background.js`
- `content.js`
- `PRIVACY.md`
- `STORE_LISTING_JA.md`
- `WEBSTORE_SUBMIT_SHORT_JA.md`
- `icons/*`

## Packaging
Use PowerShell:

```powershell
$src = "x-jp-translator"
$ver = (Get-Content "$src/manifest.json" | ConvertFrom-Json).version
$zip = "$src/dist/x-jp-translator-v$ver.zip"
New-Item -ItemType Directory -Force "$src/dist" | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path `
  "$src/manifest.json", "$src/popup.html", "$src/popup.js", "$src/background.js", "$src/content.js", `
  "$src/README.md", "$src/PRIVACY.md", "$src/STORE_LISTING_JA.md", "$src/WEBSTORE_SUBMIT_SHORT_JA.md", "$src/icons" `
  -DestinationPath $zip
```

## Safety constraints
- Treat this as personal-use unless the user explicitly asks for public production hardening.
- Do not claim official affiliation with X/Twitter.
- If asked to improve security for public release, move API key handling to server-side proxy design.
