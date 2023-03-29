# fetch-kosen-syllabus
高専のシラバスを一括ダウンロードするCLIツール

## 使い方

### クイックスタート
Node.jsとnpmが実行できる環境を用意してください．
```sh
npx fetch-kosen-syllabus
```

### 各オプションについて
```
\fetch-kosen-syllabus [path]

高専のシラバスPDFを一括ダウンロードする

位置:
  path  ダウンロード先のディレクトリパス
                                    [文字列] [デフォルト: "/tmp/tmp.J5prSCWvkM"]

オプション:
  --help                 ヘルプを表示                                     [真偽]
  --version              バージョンを表示                                 [真偽]
  --school-id            学校ID                                         [文字列]
  --department-id        学科ID                                         [文字列]
  --year                 年度                                           [文字列]
  --grades               学年                                             [配列]
  --additional-subjects  追加する科目ID                                   [配列]
  --exclude-subjects     除外する科目ID                                   [配列]
  --marge                ダウンロード完了時にPDFをマージする
                                                       [真偽] [デフォルト: true]
  --prompt               最終確認をする                [真偽] [デフォルト: true]

```