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

test.describe('UI Tests - Real-time Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  test('Pos_UI_0001: Real-time output updates as user types', async ({ page }) => {
    const { input } = getInputOutput(page);
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.fill('');
    const testInput = 'eyaa pansal yanavaa';

    for (const char of testInput) {
      await input.type(char);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(3500);

    let finalOutput = await getOutputValue(page);
    if (!finalOutput) {
      await page.waitForTimeout(3000);
      finalOutput = await getOutputValue(page);
    }
    expect(finalOutput).toContain('එයා');
    expect(finalOutput).toContain('පන්සල්');
    expect(finalOutput).toContain('යනවා');
  });
});
