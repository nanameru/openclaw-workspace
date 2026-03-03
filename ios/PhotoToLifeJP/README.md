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

## 備考
- Gemini CLIでデザイン案取得を試みましたが、実行時点ではモデル容量不足(429)で失敗。
- そのため現時点はWeb版UIをベースにiOSへ最適化した実装です。
