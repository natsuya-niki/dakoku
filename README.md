# 打刻自動化スクリプト

## 環境構築

### 前提条件
- [nodenv](https://github.com/nodenv/nodenv)がインストールされていること
- [pnpm](https://pnpm.io/ja/)がインストールされていること

### セットアップ手順

1. nodenvで指定のNode.jsバージョンをインストール
   ```bash
   nodenv install $(cat .node-version)
   nodenv local $(cat .node-version)
   ```

2. 依存関係のインストール
```bash
pnpm install
```

3. Playwrightのブラウザをインストール
```bash
pnpm exec playwright install
```

4. 環境変数の設定
```bash
cp .env.example .env
# .envファイルを編集して必要な認証情報を設定してください
```

## 実行方法

### ジョブカン打刻の実行

プロジェクト名を指定して実行（日付と時間を指定）:
```bash
pnpm exec playwright test tests/jobcan.spec.ts --project=chromium --debug -- --date 20250209 --start 0900 --end 1800
```

デフォルト値を使用する場合:
```bash
pnpm exec playwright test tests/jobcan.spec.ts --project=chromium --debug  --headed -- --date 20250203
```

### Slack打刻の実行
```bash
pnpm exec playwright test tests/slack.spec.ts --project=chromium --debug --headed
```

## オプション

- `--date`: 打刻する日付（形式: YYYYMMDD）
- `--start`: 開始時刻（形式: HHMM）
- `--end`: 終了時刻（形式: HHMM）
```

また、`.node-version`ファイルも更新します：

```:.node-version
22.7.0
```

これらの変更により、nodenvとpnpmを使用した一貫性のある環境構築が可能になります。また、実行コマンドもnpxからpnpm execに変更し、より確実なパッケージ管理を実現しています。
