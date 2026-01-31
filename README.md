# Singlish to Sinhala Translator - Automated Test Suite

**Author:** B A N Dulmin  
**Student ID:** IT23703544  
**Project:** Assignment 1 - Playwright Automated Testing

## Overview

This project contains an automated test suite for the [Swift Translator](https://www.swifttranslator.com/) web application, which converts Singlish (romanized Sinhala) text to Sinhala Unicode script. The test suite is built using Playwright and TypeScript to ensure the translator functions correctly across different browsers.

## Test Coverage

### Test Suite Summary
- **24 Positive Functional Tests** - Verify correct Singlish to Sinhala translations
- **10 Negative Functional Tests** - Validate that incorrect outputs are not produced
- **1 UI Test** - Confirm real-time conversion as users type

**Total:** 35 test cases across 3 browsers (Chromium, Firefox, WebKit) = 105 total test executions

## Project Structure

```
IT23703544 Assignment 1/
├── tests/
│   ├── positive-functional_spec.ts    # 24 positive test cases
│   ├── negative-functional_spec.ts    # 10 negative test cases
│   └── ui-conversion_spec.ts          # 1 UI/real-time test case
├── playwright.config.js               # Playwright configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
```

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- Internet connection (tests run against live site)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd "IT23703544 Assignment 1"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run All Tests (All Browsers)
```bash
npm test
```
or
```bash
npx playwright test
```

### Run Tests by Browser
```bash
# Chromium only
npm run test:chromium
# or
npx playwright test --project=chromium

# Firefox only
npm run test:firefox

# WebKit/Safari only
npm run test:webkit
```

### Run Specific Test Suite
```bash
# Positive functional tests only
npm run test:positive

# Negative functional tests only
npm run test:negative

# UI/real-time conversion test only
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
# or
npx playwright test --headed
```

### Debug Tests
```bash
npm run test:debug
# or
npx playwright test --debug
```

## Test Results

### View Test Report
After running tests, view the HTML report:
```bash
npm run show-report
# or
npx playwright show-report
```

The report will open in your browser showing:
- Pass/fail status for each test
- Screenshots of failures
- Videos of test execution (for failures)
- Detailed error messages

## Test Cases

### Positive Functional Tests (24)
Tests verify correct translations for various Singlish inputs:
- `Pos_Fun_0001` to `Pos_Fun_0024`
- Examples:
  - Simple sentences: "eyaa pansal yanavaa." → "එයා පන්සල් යනවා."
  - Complex sentences with punctuation
  - Mixed English/Singlish text (e.g., "WhatsApp", "Email")
  - Multiple spaces and line breaks
  - Long paragraphs

### Negative Functional Tests (10)
Tests verify that incorrect or malformed inputs do NOT produce expected wrong outputs:
- `Neg_Fun_0001` to `Neg_Fun_0010`
- Test cases include:
  - Typos in Singlish
  - Missing spaces
  - Incomplete sentences
  - Wrong grammar
  - Special characters handling

### UI Test (1)
- `Pos_UI_0001`: Verifies real-time conversion as user types character-by-character

## Configuration

### Key Configuration Settings
- **Workers:** 1 (sequential execution for stability with live site)
- **Timeout:** 2 minutes per test
- **Retries:** 1 retry on failure (2 on CI)
- **Base URL:** https://www.swifttranslator.com/
- **Viewport:** 1280x720

### Modify Configuration
Edit `playwright.config.js` to adjust:
- Number of workers (parallel execution)
- Timeouts
- Retry attempts
- Browser settings
- Reporter options

## Technical Details

### Selector Strategy
The test suite uses resilient, role-based selectors:
- **Input field:** Located by role `textbox` with name matching "Singlish"
- **Output field:** Located as the last sibling of the "Swap Languages" button
- **Fallback mechanisms:** Multiple selector strategies ensure tests work even if the site structure changes slightly

### Handling Dynamic Content
- **Wait times:** 3.5 seconds after typing to allow translation to complete
- **Retry logic:** Up to 2 retries if output is empty
- **Inner content fallback:** If main output element is empty, searches for inner elements containing Sinhala script

### TypeScript Support
- Full TypeScript support with type checking
- Type definitions for Playwright test API
- ESNext module system

## Troubleshooting

### Tests Failing with Empty Output
- **Cause:** Network latency or site rate limiting
- **Solution:** Increase wait times in `clearAndType()` function or increase retries in config

### Tests Not Discovered
- **Cause:** Test files not matching `testMatch` pattern
- **Solution:** Ensure test files end with `_spec.ts` or `.spec.ts`

### Selector Not Found Errors
- **Cause:** Site structure changed
- **Solution:** Update selectors in `getInputOutput()` function

### Browser Not Installed
- **Cause:** Playwright browsers not installed
- **Solution:** Run `npx playwright install`

## CI/CD Integration

The test suite is designed for CI/CD pipelines:
- Automatically uses 2 retries in CI environments (detected via `CI` env variable)
- Generates HTML reports in `playwright-report/` directory
- Screenshots and videos saved in `test-results/` for failed tests

### Example GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright browsers
  run: npx playwright install --with-deps
  
- name: Run Playwright tests
  run: npx playwright test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Known Issues

1. **Live Site Dependency:** Tests run against the live swifttranslator.com site, so failures may occur if:
   - Site is down or slow
   - Site structure changes
   - Network connectivity issues

2. **Flakiness:** Some tests may occasionally fail with empty output due to:
   - Site response time variability
   - Rate limiting
   - **Mitigation:** Retries are enabled to handle transient failures

## Future Improvements

- Add API-level tests (if API is available)
- Mock the translator service for faster, more stable tests
- Add accessibility (a11y) tests
- Add performance tests (response time benchmarks)
- Expand test coverage with edge cases
- Add visual regression tests

## Dependencies

### Main Dependencies
- `@playwright/test`: ^1.58.1 - Test runner and browser automation
- `@types/node`: ^25.1.0 - TypeScript type definitions for Node.js

### Browser Engines
- Chromium (latest)
- Firefox (latest)
- WebKit (latest)

## License

ISC

## Contact

**Author:** B A N Dulmin  
**Student ID:** IT23703544  
**Assignment:** Assignment 1 - Automated Testing with Playwright

---

## Quick Reference

```bash
# Install
npm install && npx playwright install

# Run all tests
npm test

# Run specific browser
npx playwright test --project=chromium

# View results
npm run show-report

# Debug
npm run test:debug
```

**Note:** Ensure stable internet connection when running tests as they interact with the live translator website.
