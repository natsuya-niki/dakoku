import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

function parseArgs(args: string[]) {
  const options: { [key: string]: string | true } = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      options[key] = value;
      if (value !== true) i++; // 値がある場合は次の引数をスキップ
    }
  }
  console.log('Parsed Arguments:', options);
  return options;
}

test('ジョブカン打刻', async ({ page }, testInfo) => {
  // 環境変数が設定されているか確認
  if (!process.env.JOBCAN_EMAIL || !process.env.JOBCAN_PASSWORD) {
    throw new Error('環境変数 JOBCAN_EMAIL と JOBCAN_PASSWORD を設定してください');
  }

  // コマンドライン引数を解析
  const args = parseArgs(process.argv.slice(2));

  // 引数から日付を取得
  const inputDate = typeof args['date'] === 'string' ? args['date'] : typeof args['d'] === 'string' ? args['d'] : null;
  console.log(`args['date']: ${args['date']}`);
  console.log(`Input Date: ${inputDate}`);
  const date = process.env.TEST_DATE || '20250203';
  const year = dayjs(date, 'YYYYMMDD').year();
  const month = dayjs(date, 'YYYYMMDD').month() + 1; // monthは0から始まるため+1
  const day = dayjs(date, 'YYYYMMDD').date();

  // デバッグログに表示
  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);
  // 5秒待機
//   await page.waitForTimeout(5000);

  // コマンドライン引数から開始時刻と終了時刻を取得
  const startTime = typeof args['start'] === 'string' ? args['start'] : '0900';
  const endTime = typeof args['end'] === 'string' ? args['end'] : '1800';

  await page.goto('https://id.jobcan.jp/users/sign_in');
  
  // 環境変数からログイン情報を取得
  await page.getByPlaceholder('メールアドレスまたはスタッフコード').fill(process.env.JOBCAN_EMAIL);
  await page.getByPlaceholder('パスワード').fill(process.env.JOBCAN_PASSWORD);  
  await page.getByRole('button', { name: 'ログイン' }).click();

  // ログイン後に特定の要素が表示されるのを待機
  await page.waitForSelector('//html/body/div[1]/div/section[1]/h1', { timeout: 5000 });

  // 勤怠リンクをクリックして新しいタブを開く
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '勤怠' }).click();
  const page1 = await page1Promise;

  // 新しいタブでの操作を続ける
  await page1.goto(`https://ssl.jobcan.jp/employee/adit/modify?year=${year}&month=${month}&day=${day}`);
  await page.waitForTimeout(5000); // 3秒待機

  // 開始時刻を入力
  await page1.getByRole('textbox', { name: '時刻' }).fill(startTime);
  await page1.locator('textarea[name="notice"]').fill('手動打刻');
  await page1.getByRole('button', { name: '打刻' }).click();

  // 終了時刻を入力
  await page1.getByRole('textbox', { name: '時刻' }).fill(endTime);
  await page1.getByRole('button', { name: '打刻' }).click();

  await page.waitForTimeout(3000); // 3秒待機
});