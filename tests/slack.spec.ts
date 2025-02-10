import { test, expect } from '@playwright/test';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

test.setTimeout(60000);

test('Slack打刻', async ({ page }) => {
  await page.goto('https://app.slack.com/workspace-signin?redir=%2Fgantry%2Fauth%3Fapp%3Dclient%26lc%3D1739108612%26return_to%3D%252Fclient%252FT4Y2T7AMN%252FC059VF7J8TV%26teams%3D');
  await page.getByRole('textbox', { name: 'ワークスペースの Slack URL を入力してください' }).fill('aitravel');
  await page.getByRole('button', { name: '続行する' }).click();
  await page.getByRole('button', { name: 'Google でサインインする' }).click();

  // 環境変数が設定されているか確認
  if (!process.env.SLACK_EMAIL || !process.env.SLACK_PASSWORD) {
    throw new Error('環境変数 SLACK_EMAIL と SLACK_PASSWORD を設定してください');
  }

  await page.getByRole('textbox', { name: 'メールアドレスまたは電話番号' }).fill(process.env.SLACK_EMAIL);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('textbox', { name: 'パスワードを入力' }).fill(process.env.SLACK_PASSWORD);
  await page.getByRole('button', { name: '次へ' }).click();
  await page.getByRole('button', { name: '次へ' }).click();
  await page.waitForTimeout(10000); // 5秒待機

  await page.goto('https://app.slack.com/client/T4Y2T7AMN/C059VF7J8TV'
  ,
    {
      // waitUntil: 'networkidle', // ページのネットワーク接続がアイドル状態になるまで待つ
      timeout: 10000,
    }
  );
  // await page.waitForSelector('/html/body/div[2]/div/div/div[4]/div[2]/div/div[1]/div[2]/div[1]/div/div/div[1]/div[2]/div/button/svg', { timeout: 10000 });

  // 出勤
  const formattedDate = dayjs(process.env.TEST_DATE || '20250201', 'YYYYMMDD').format('YYYY/MM/DD');
  await page.getByRole('button', { name: '勤怠ログ' }).click();
  await page.getByRole('combobox', { name: '出勤/退勤のどちらの記録かを教えてください！' }).click();
  await page.getByRole('option', { name: '出勤' }).locator('div').first().click();
  await page.getByRole('textbox', { name: '出退勤日を教えてください！（yyyy/mm/dd）' }).fill(formattedDate);
  await page.getByRole('textbox', { name: '出勤/退勤したお時間教えてください！（例：9:15）' }).fill('09:00');
  await page.getByRole('button', { name: '送信する' }).click();

  // 退勤
  await page.getByRole('button', { name: '勤怠ログ' }).click();
  await page.getByRole('combobox', { name: '出勤/退勤のどちらの記録かを教えてください！' }).click();
  await page.getByRole('option', { name: '退勤' }).locator('div').first().click();
  await page.getByRole('textbox', { name: '出退勤日を教えてください！（yyyy/mm/dd）' }).fill(formattedDate);
  await page.getByRole('textbox', { name: '出勤/退勤したお時間教えてください！（例：9:15）' }).fill('18:00'); // 退勤時間を設定
  await page.getByRole('button', { name: '送信する' }).click();
});