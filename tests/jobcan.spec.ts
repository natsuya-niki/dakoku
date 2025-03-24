import { test } from '@playwright/test';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';

import config from '../config.test.json';

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

test('ジョブカン打刻', async ({ page }) => {
  const jobCanEmail = config.jobCanEmail;
  const jobCanPassword = config.jobCanPassword;


  const inputDate = config.testDate || dayjs().tz('Asia/Tokyo').format('YYYYMMDD');
  const startTime = config.testStartTime || '0900';
  const endTime = config.testEndTime || '1800';


  if (!jobCanEmail || !jobCanPassword) {
    throw new Error('config.test.json に jobCanEmail と jobCanPassword を設定してください');
  }


  const year = dayjs(inputDate, 'YYYYMMDD').year();
  const month = dayjs(inputDate, 'YYYYMMDD').month() + 1;
  const day = dayjs(inputDate, 'YYYYMMDD').date();

  await page.goto('https://id.jobcan.jp/users/sign_in');


  await page.getByPlaceholder('メールアドレスまたはスタッフコード').fill(jobCanEmail);
  await page.getByPlaceholder('パスワード').fill(jobCanPassword);
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

  await page1.waitForTimeout(3000);
});
