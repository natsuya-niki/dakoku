import { test } from '@playwright/test';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import config from '../config.test.json';

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

test.setTimeout(60000);

test('Slack打刻', async ({ page }) => {
  const args = {
    date: config.testDate || dayjs().tz('Asia/Tokyo').format('YYYYMMDD'),
    start: config.testStartTime || '0900',
    end: config.testEndTime || '1800'
  };

  const slackSigninUrl = config.slackSigninUrl;
  const slackClientUrl = config.slackClientUrl;
  const slackWorkspace = config.slackWorkspace;
  const slackEmail = config.slackEmail;
  const slackPassword = config.slackPassword;

  if (!slackSigninUrl || !slackClientUrl || !slackWorkspace || !slackEmail || !slackPassword) {
    throw new Error(`
      以下の設定値が正しく設定されているか確認してください:
      slackSigninUrl: ${slackSigninUrl}
      slackClientUrl: ${slackClientUrl}
      slackWorkspace: ${slackWorkspace}
      slackEmail: ${slackEmail}
      slackPassword: ${slackPassword}
    `);
  }

  await page.goto(slackSigninUrl);
  await page.getByRole('textbox', { name: 'ワークスペースの Slack URL を入力してください' }).fill(slackWorkspace);
  await page.getByRole('button', { name: '続行する' }).click();
  await page.getByRole('button', { name: 'Google でサインインする' }).click();

  await page.getByRole('textbox', { name: 'メールアドレスまたは電話番号' }).fill(slackEmail);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('textbox', { name: 'パスワードを入力' }).fill(slackPassword);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('button', { name: '次へ' }).click();
  await page.waitForTimeout(10000); // 5秒待機



  await page.goto(slackClientUrl, {
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
