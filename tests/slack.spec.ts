import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

test.setTimeout(60000);

test('Slack打刻', async ({ page }) => {
  // 環境変数から引数を取得
  const args = {
    date: process.env.TEST_DATE ? process.env.TEST_DATE : dayjs().tz('Asia/Tokyo').format('YYYYMMDD'),
    start: process.env.TEST_START_TIME || '0900',
    end: process.env.TEST_END_TIME || '1800'
  };

  // console.log(args.start);
  // console.log(dayjs(args.start, 'HHmm').format('HH:mm'));

  // 環境変数が設定されているか確認
  if (!process.env.SLACK_WORKSPACE || !process.env.SLACK_EMAIL || !process.env.SLACK_PASSWORD) {
    throw new Error('環境変数 SLACK_WORKSPACE と SLACK_EMAIL と SLACK_PASSWORD を設定してください');
  }

  await page.goto('https://app.slack.com/workspace-signin?redir=%2Fgantry%2Fauth%3Fapp%3Dclient%26lc%3D1739108612%26return_to%3D%252Fclient%252FT4Y2T7AMN%252FC059VF7J8TV%26teams%3D');
  await page.getByRole('textbox', { name: 'ワークスペースの Slack URL を入力してください' }).fill(process.env.SLACK_WORKSPACE || '');
  await page.getByRole('button', { name: '続行する' }).click();
  await page.getByRole('button', { name: 'Google でサインインする' }).click();

  await page.getByRole('textbox', { name: 'メールアドレスまたは電話番号' }).fill(process.env.SLACK_EMAIL);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('textbox', { name: 'パスワードを入力' }).fill(process.env.SLACK_PASSWORD);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('button', { name: '次へ' }).click();
  await page.waitForTimeout(10000); // 5秒待機



  await page.goto('https://app.slack.com/client/T4Y2T7AMN/C059VF7J8TV', {
    timeout: 10000,
  });

  // 出勤
  const formattedDate = dayjs(args.date, 'YYYYMMDD').format('YYYY/MM/DD');
  await page.getByRole('button', { name: '勤怠ログ' }).click();
  await page.getByRole('combobox', { name: '出勤/退勤のどちらの記録かを教えてください！' }).click();
  await page.getByRole('option', { name: '出勤' }).locator('div').first().click();
  await page.getByRole('textbox', { name: '出退勤日を教えてください！（yyyy/mm/dd）' }).fill(formattedDate);
  await page.getByRole('textbox', { name: '出勤/退勤したお時間教えてください！（例：9:15）' }).fill(dayjs(args.start, 'HHmm').format('HH:mm'));
  await page.getByRole('button', { name: '送信する' }).click();

  // 退勤
  await page.getByRole('button', { name: '勤怠ログ' }).click();
  await page.getByRole('combobox', { name: '出勤/退勤のどちらの記録かを教えてください！' }).click();
  await page.getByRole('option', { name: '退勤' }).locator('div').first().click();
  await page.getByRole('textbox', { name: '出退勤日を教えてください！（yyyy/mm/dd）' }).fill(formattedDate);
  await page.getByRole('textbox', { name: '出勤/退勤したお時間教えてください！（例：9:15）' }).fill(dayjs(args.end, 'HHmm').format('HH:mm')); // 退勤時間を設定
  await page.getByRole('button', { name: '送信する' }).click();
});