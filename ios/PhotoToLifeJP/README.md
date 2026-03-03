# Photo to Life JP iOS (SwiftUI MVP)

SwiftUI + MVVM で、既存Web API（`/api/generate`）に接続するiOS MVP雛形です。

## 画面
- 画像選択（PhotosPicker）
- プロンプト入力
- 比率 / 解像度 / 秒数 / 高精細モード
- 想定クレジット表示
- 生成開始 → ジョブ状態ポーリング → 結果リンク表示

## API接続先
`Networking/APIClient.swift` の `baseURL` を実環境に変更してください。

```swift
APIClient(baseURL: URL(string: "https://your-domain.com")!)
```

## Xcodeプロジェクト化（macOS）
このディレクトリは XcodeGen 前提です。

1. `brew install xcodegen`
2. `cd ios/PhotoToLifeJP`
3. `bash scripts/bootstrap-macos.sh`
4. `open PhotoToLifeJP.xcodeproj`

## 実機ビルド手順
1. Xcodeで `PhotoToLifeJP.xcodeproj` を開く
2. Signing & Capabilities で Team を設定
3. iPhoneを接続して実機を選択
4. Product > Run

## 備考
- Gemini CLIでデザイン案取得を試みましたが、実行時点ではモデル容量不足(429)で失敗。
- 現時点はWeb版UIをベースにiOSへ最適化した実装です。
