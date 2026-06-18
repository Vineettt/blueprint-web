import { test, expect } from '@playwright/test';

test('home responds without client error', async ({ page }) => {
  const response = await page.goto('/');
  expect(response, 'navigation should return a response').toBeTruthy();
  expect(response!.status(), 'HTTP status should be successful').toBeLessThan(400);
});
