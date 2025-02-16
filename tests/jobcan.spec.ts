import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

test('ジョブカン打刻', async ({ page }, testInfo) => {
  // 環境変数から引数を取得
  const args = {
    date: process.env.TEST_DATE ? process.env.TEST_DATE : dayjs().tz('Asia/Tokyo').format('YYYYMMDD'),
    start: process.env.TEST_START_TIME || '0900',
    end: process.env.TEST_END_TIME || '1800'
  };
  console.log('Args:', args);

  if (!process.env.JOBCAN_EMAIL || !process.env.JOBCAN_PASSWORD) {
    throw new Error('環境変数 JOBCAN_EMAIL と JOBCAN_PASSWORD を設定してください');
  }

  const inputDate = args.date || '20250203';
  console.log(`Input Date: ${inputDate}`);
  const year = dayjs(inputDate, 'YYYYMMDD').year();
  const month = dayjs(inputDate, 'YYYYMMDD').month() + 1;
  const day = dayjs(inputDate, 'YYYYMMDD').date();

  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);

  const startTime = args.start || '0900';
  const endTime = args.end || '1800';

  await page.goto('https://id.jobcan.jp/users/sign_in');
  
  await page.getByPlaceholder('メールアドレスまたはスタッフコード').fill(process.env.JOBCAN_EMAIL);
  await page.getByPlaceholder('パスワード').fill(process.env.JOBCAN_PASSWORD);  
  await page.getByRole('button', { name: 'ログイン' }).click();

  await page.waitForSelector('//html/body/div[1]/div/section[1]/h1', { timeout: 5000 });

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '勤怠' }).click();
  const page1 = await page1Promise;

  await page1.goto(`https://ssl.jobcan.jp/employee/adit/modify?year=${year}&month=${month}&day=${day}`);
  await page.waitForTimeout(5000);

  await page1.getByRole('textbox', { name: '時刻' }).fill(startTime);
  await page1.locator('textarea[name="notice"]').fill('手動打刻');
  await page1.getByRole('button', { name: '打刻' }).click();

  await page1.getByRole('textbox', { name: '時刻' }).fill(endTime);
  await page1.getByRole('button', { name: '打刻' }).click();

  await page.waitForTimeout(3000);
});