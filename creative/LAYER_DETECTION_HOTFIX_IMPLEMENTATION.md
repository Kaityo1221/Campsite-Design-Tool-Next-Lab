# 実装メモ

POI分類の優先順位を以下に変更した。

1. Placemarkの`ExtendedData`内 `Data name="nextlab-layer"`
2. 正式レイヤー名の完全一致
3. `styleUrl` の `creative-*` キー
4. 従来の名称・フォルダ名による文字列推測

保存時は全POI Placemarkに `nextlab-layer` を書き出す。

対象キー:
- existing-pokestop
- existing-gym
- existing-power
- new-pokestop
- new-gym
- new-power
