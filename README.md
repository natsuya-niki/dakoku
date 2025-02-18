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
cp config.test.example.json config.test.json
```

## 実行方法

### ジョブカン打刻の実行

```bash
pnpm exec playwright test tests/jobcan.spec.ts --project=chromium --headed
# 日付と打刻時刻を指定する場合
TEST_DATE=20250214 TEST_START_TIME=0900 TEST_END_TIME=1800 pnpm exec playwright test tests/jobcan.spec.ts --project=chromium --headed
```

### Slack打刻の実行
```bash
pnpm exec playwright test tests/slack.spec.ts --project=chromium --headed
# 日付と打刻時刻を指定する場合
TEST_DATE=20250214 TEST_START_TIME=0900 TEST_END_TIME=1800 pnpm exec playwright test tests/slack.spec.ts --project=chromium --headed
```
