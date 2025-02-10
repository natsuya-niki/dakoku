# プロジェクト名を指定して実行
npx playwright test tests/example.spec.ts --project=chromium --debug -- --date 20250209 --start 0900 --end 1800

# デフォルト値を使用する場合
npx playwright test tests/example.spec.ts --project=chromium --debug -- --date 20250203


npx playwright test tests/slack.spec.ts --project=chromium --h
eaded