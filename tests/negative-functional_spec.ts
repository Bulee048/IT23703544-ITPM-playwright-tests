import { test, expect, Page } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';

function getInputOutput(page: Page) {
  const input = page.getByRole('textbox', { name: /Input Your Singlish|Singlish/i }).or(page.getByRole('textbox').first());
  const output = page.getByRole('button', { name: 'Swap Languages' }).locator('..').locator('..').locator('> *').last();
  return { input, output };
}

function stripSinhalaLabel(text: string): string {
  return text.replace(/^Sinhala\s*/i, '').trim();
}

async function getOutputValue(page: Page): Promise<string> {
  const { output } = getInputOutput(page);
  try {
    await output.waitFor({ state: 'visible', timeout: 15000 });
  } catch {
    const fallback = page.locator('div, [contenteditable]').filter({ hasText: /[\u0D80-\u0DFF]{2,}/ }).first();
    await fallback.waitFor({ state: 'visible', timeout: 8000 });
    return stripSinhalaLabel((await fallback.textContent()) ?? '');
  }
  const tagName = await output.evaluate((el) => el.tagName.toLowerCase());
  let text: string;
  if (tagName === 'textarea' || tagName === 'input') {
    text = await output.inputValue();
  } else {
    text = (await output.textContent()) ?? '';
  }
  if (!text || !/[\u0D80-\u0DFF]/.test(text)) {
    const inner = output.locator('[contenteditable], div, span').filter({ hasText: /[\u0D80-\u0DFF]/ }).first();
    try {
      await inner.waitFor({ state: 'visible', timeout: 8000 });
      text = (await inner.textContent()) ?? '';
    } catch {
      // keep text as is
    }
  }
  return stripSinhalaLabel(text);
}

async function clearAndType(page: Page, text: string) {
  const { input } = getInputOutput(page);
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill('');
  await input.fill(text);
  await page.waitForTimeout(3500);
}

test.describe('Negative Functional Tests - Singlish to Sinhala Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  const negativeTests = [
    { id: 'Neg_Fun_0001', input: 'mama gedhra yanavaa.', wrongOutput: 'මම ගෙධ්‍රා යනවා.' },
    { id: 'Neg_Fun_0002', input: 'mama kema kanna yanawa', wrongOutput: 'මම කෑම කන්න යනවා' },
    { id: 'Neg_Fun_0003', input: 'mamagedharayanavaa', wrongOutput: 'මම ගෙදර යනවා' },
    { id: 'Neg_Fun_0004', input: 'mama giyeya.', wrongOutput: 'මම ගියා.' },
    { id: 'Neg_Fun_0005', input: 'mama gedhara', wrongOutput: 'මම ගෙදර.' },
    { id: 'Neg_Fun_0006', input: 'mama heta gedhara yanava, habayi mata kema kana ona.', wrongOutput: 'මම හෙට ගෙදර යනවා, හැබැයි මට කෑම කන්න ඕනා.' },
    { id: 'Neg_Fun_0007', input: 'mama heta gedhara giyaa.', wrongOutput: 'මම හෙට ගෙදර යනවා.' },
    { id: 'Neg_Fun_0008', input: 'mama yanavaa!!!???', wrongOutput: 'මම යනවා???!!!' },
    { id: 'Neg_Fun_0009', input: 'gedhara mama yanavaa.', wrongOutput: 'මම ගෙදර යනවා.' },
    { id: 'Neg_Fun_0010', input: 'mama #gedhara @yanavaa.', wrongOutput: 'මම ගෙදර යනවා.' }
  ];

  for (const t of negativeTests) {
    test(t.id, async ({ page }) => {
      await clearAndType(page, t.input);
      const actual = await getOutputValue(page);
      expect(actual.trim()).not.toBe(t.wrongOutput);
    });
  }
});
