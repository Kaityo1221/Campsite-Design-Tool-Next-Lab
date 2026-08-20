# POIレイヤー判定 緊急修正テスト

対象ブランチ: `hotfix/nextlab-layer-detection`

## 確認項目

- 新規 PowerSpot を追加 → KMZ保存 → 再読込 → `新規 PowerSpot` を維持
- 新規 Gym を追加 → KMZ保存 → 再読込 → `新規 Gym` を維持
- 新規 PokéStop を追加 → KMZ保存 → 再読込 → `新規 PokéStop` を維持
- 既存3種も保存・再読込後に既存側を維持
- `ExtendedData/Data name="nextlab-layer"` がある場合、その値を最優先
- 明示情報がない旧KMZでは正式レイヤー名の完全一致を優先
- それでも不明な外部KMZのみ従来の文字列推測へフォールバック

※ 距離円レイヤーのKMZ出力欠落は別修正として扱う。
