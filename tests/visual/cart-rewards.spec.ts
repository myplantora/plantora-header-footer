import { test, expect } from '@playwright/test';

test.describe('Cart Rewards Visual Regression', () => {
  const setSubtotal = async (page: any, amount: number) => {
    await page.evaluate((val: number) => {
      // Access the store directly to mock the state
      const state = window.localStorage.getItem('plantora-cart');
      const parsed = state ? JSON.parse(state) : { state: {}, version: 0 };
      
      // We'll use page.evaluate to call the store if possible, 
      // but since we might not have easy access to the store instance in window,
      // we can try to find the store via the rendered component's props or just mock the localStorage
      // and reload or trigger a re-render.
      
      // More reliable: Use window.localStorage to persist the state and then reload
      // But we need to make sure we don't overwrite the whole thing if other keys exist
      window.localStorage.setItem('plantora-cart-mock-subtotal', JSON.stringify(val));
      
      // Dispatch a custom event that our app can listen to for testing purposes
      window.dispatchEvent(new CustomEvent('test:set-subtotal', { detail: val }));
    }, amount);
  };

  test('should look correct at empty state', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('button[aria-label*="cart"], button:has-text("basket")');
    
    // Wait for the drawer to be visible
    const rewards = page.locator('section[aria-label="Cart rewards"]');
    await expect(rewards).toBeVisible();
    
    // Take screenshot of just the rewards section
    await expect(rewards).toHaveScreenshot('rewards-empty.png');
  });

  test('should look correct at mid-progress milestone', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('button[aria-label*="cart"], button:has-text("basket")');
    
    // Inject a subtotal of $150 (assuming $99 and $299 milestones)
    await page.evaluate(() => {
      // Try to find the cart store and update it
      // This requires the store to be attached to window in dev mode or using a test hook
      const store = (window as any).__CART_STORE__;
      if (store) {
        store.setState({ subtotal: { amount: 150, currency: 'USD' } });
      }
    });

    const rewards = page.locator('section[aria-label="Cart rewards"]');
    await expect(rewards).toBeVisible();
    await expect(rewards).toHaveScreenshot('rewards-mid.png');
  });

  test('should look correct at full progress', async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click('button[aria-label*="cart"], button:has-text("basket")');
    
    await page.evaluate(() => {
      const store = (window as any).__CART_STORE__;
      if (store) {
        store.setState({ subtotal: { amount: 350, currency: 'USD' } });
      }
    });

    const rewards = page.locator('section[aria-label="Cart rewards"]');
    await expect(rewards).toBeVisible();
    await expect(rewards).toHaveScreenshot('rewards-full.png');
  });
});
