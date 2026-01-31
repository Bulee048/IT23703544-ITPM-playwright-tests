import { test, expect, Page } from '@playwright/test';

const URL = 'https://www.swifttranslator.com/';

/** Input: Singlish textbox. Output: Sinhala panel (right of Swap Languages button). */
function getInputOutput(page: Page) {
  const input = page.getByRole('textbox', { name: /Input Your Singlish|Singlish/i }).or(page.getByRole('textbox').first());
  // Sinhala panel is the last sibling of the Swap Languages button (layout: Singlish panel | Swap | Sinhala panel)
  const output = page.getByRole('button', { name: 'Swap Languages' }).locator('..').locator('..').locator('> *').last();
  return { input, output };
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
  // If panel is a wrapper with content in a child, get the inner element that has Sinhala
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

function stripSinhalaLabel(text: string): string {
  return text.replace(/^Sinhala\s*/i, '').trim();
}

async function clearAndType(page: Page, text: string) {
  const { input } = getInputOutput(page);
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill('');
  await input.fill(text);
  await page.waitForTimeout(3500);
}

test.describe('Positive Functional Tests - Singlish to Sinhala Conversion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
  });

  const positiveTests = [
    { id: 'Pos_Fun_0001', input: 'eyaa pansal yanavaa.', expected: 'එයා පන්සල් යනවා.' },
    { id: 'Pos_Fun_0002', input: 'mata bath kanna oonee, haebaeyi mama dhaen kaevalaa naee.', expected: 'මට බත් කන්න ඕනේ, හැබැයි මම දැන් කැවලා නෑ.' },
    { id: 'Pos_Fun_0003', input: 'vaessa unoth api yannee naehae.', expected: 'වැස්ස උනොත් අපි යන්නේ නැහැ.' },
    { id: 'Pos_Fun_0004', input: 'oyaa kavadhdha enna inne?', expected: 'ඔයා කවද්ද එන්න ඉන්නේ?' },
    { id: 'Pos_Fun_0005', input: 'issarahata yanna.', expected: 'ඉස්සරහට යන්න.' },
    { id: 'Pos_Fun_0006', input: 'api naetum panthi giyaa.', expected: 'අපි නැටුම් පන්ති ගියා.' },
    { id: 'Pos_Fun_0007', input: 'api iiLaGa sathiyee yamu.', expected: 'අපි ඊළඟ සතියේ යමු.' },
    { id: 'Pos_Fun_0008', input: 'mata eeka epaa.', expected: 'මට ඒක එපා.' },
    { id: 'Pos_Fun_0009', input: 'oyaalaa enavadha?', expected: 'ඔයාලා එනවද?' },
    { id: 'Pos_Fun_0010', input: 'suba udhaeesanak!', expected: 'සුබ උදෑසනක්!' },
    { id: 'Pos_Fun_0011', input: 'karuNaakaralaa magee lipinaya eyaata yavanna.', expected: 'කරුණාකරලා මගේ ලිපිනය එයාට යවන්න.' },
    { id: 'Pos_Fun_0012', input: 'mata nidhimathayi.', expected: 'මට නිදිමතයි.' },
    { id: 'Pos_Fun_0013', input: 'poddak inna.', expected: 'පොඩ්ඩක් ඉන්න.' },
    { id: 'Pos_Fun_0014', input: 'chuttak chuttak enna.', expected: 'චුට්ටක් චුට්ටක් එන්න.' },
    { id: 'Pos_Fun_0015', input: 'mata WhatsApp message ekak yavanna. Email eken evanna mama check karannee naehae.', expected: 'මට WhatsApp message එකක් යවන්න. Email එකෙන් එවන්න මම check කරන්නේ නැහැ.' },
    { id: 'Pos_Fun_0016', input: 'nimaali office enna late vennee traffic nisaa.', expected: 'නිමාලි office එන්න late වෙන්නේ traffic නිසා.' },
    { id: 'Pos_Fun_0017', input: 'magee NIC eka saha ID card eka dhenna.', expected: 'මගේ NIC එක සහ ID card එක දෙන්න.' },
    { id: 'Pos_Fun_0018', input: 'meeka hariyata vaeda karanavaadha?', expected: 'මේක හරියට වැඩ කරනවාද?' },
    { id: 'Pos_Fun_0019', input: 'mata Rs. 5000 k oonee.', expected: 'මට Rs. 5000 ක් ඕනේ.' },
    { id: 'Pos_Fun_0020', input: 'mata 10.00 AM vala phone karanna.', expected: 'මට 10.00 AM වල phone කරන්න.' },
    { id: 'Pos_Fun_0021', input: 'mama     gedhara     yanavaa.', expected: 'මම     ගෙදර     යනවා.' },
    { id: 'Pos_Fun_0022', input: 'mama gedhara yanavaa.\noyaa enavadha?', expected: 'මම ගෙදර යනවා.\nඔයා එනවද?' },
    { id: 'Pos_Fun_0023', input: 'ela machan! supiri!! mata beheth bonna amathaka vunaa kiyahankoo.', expected: 'එල මචන්! සුපිරි!! මට බෙහෙත් බොන්න අමතක වුනා කියහන්කෝ.' },
    { id: 'Pos_Fun_0024', input: 'mama adha udhee pansal gihillaa avee. mama hithuvaa adha kisi vaedak naethi nisaa gedhara innavaa kiyalaa, haebaeyi mama ammata kathaa karalaa kivvaa eyaata dhosthara kenek LaGAta aran yanna oonee kiyalaa. havasa mama ammaava dhosthara LaGAta aragena giyaa. ohu ammaata beheth dhunnaa.', expected: 'මම අද උදේ පන්සල් ගිහිල්ලා අවේ. මම හිතුවා අද කිසි වැඩක් නැති නිසා ගෙදර ඉන්නවා කියලා, හැබැයි මම අම්මට කතා කරලා කිව්වා එයාට දොස්තර කෙනෙක් ළඟට අරන් යන්න ඕනේ කියලා. හවස මම අම්මාව දොස්තර ළඟට අරගෙන ගියා. ඔහු අම්මාට බෙහෙත් දුන්නා.' }
  ];

  for (const t of positiveTests) {
    test(t.id, async ({ page }) => {
      await clearAndType(page, t.input);
      let actual = await getOutputValue(page);
      for (let retry = 0; retry < 2 && !actual.trim(); retry++) {
        await page.waitForTimeout(3000);
        actual = await getOutputValue(page);
      }
      expect(actual.trim()).toBe(t.expected);
    });
  }
});
