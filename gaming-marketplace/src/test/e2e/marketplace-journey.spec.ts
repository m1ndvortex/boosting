import { test, expect } from '@playwright/test';

test.describe('Marketplace Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as client user
    await page.getByText('TestClient').click();
    await expect(page).toHaveURL(/\/marketplace/);
  });

  test('should browse and filter services', async ({ page }) => {
    // Should show services
    await expect(page.getByText('Mythic+ Dungeon Boost')).toBeVisible();
    
    // Test search functionality
    await page.getByPlaceholder('Search services').fill('Mythic');
    await expect(page.getByText('Mythic+ Dungeon Boost')).toBeVisible();
    
    // Clear search
    await page.getByPlaceholder('Search services').clear();
    
    // Test game filter
    await page.selectOption('[data-testid="game-filter"]', 'wow');
    await expect(page.getByText('Mythic+ Dungeon Boost')).toBeVisible();
    
    // Test service type filter
    await page.selectOption('[data-testid="service-type-filter"]', 'mythic-plus');
    await expect(page.getByText('Mythic+ Dungeon Boost')).toBeVisible();
  });

  test('should view service details', async ({ page }) => {
    // Click on a service
    await page.getByText('Mythic+ Dungeon Boost').click();
    
    // Should open service details modal
    await expect(page.getByText('Service Details')).toBeVisible();
    await expect(page.getByText('Professional mythic+ dungeon boost')).toBeVisible();
    
    // Should show multi-currency pricing
    await expect(page.getByText('100,000 G')).toBeVisible();
    await expect(page.getByText('$50.00')).toBeVisible();
    await expect(page.getByText('﷼2,000,000')).toBeVisible();
    
    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Service Details')).not.toBeVisible();
  });

  test('should complete service purchase with sufficient balance', async ({ page }) => {
    // Set up wallet with sufficient balance via localStorage
    await page.evaluate(() => {
      const wallet = {
        userId: 'test-client-1',
        balances: { gold: 500000, usd: 1000, toman: 50000000 },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-wallet-test-client-1', JSON.stringify(wallet));
    });
    
    // Refresh to load wallet data
    await page.reload();
    
    // Click on service
    await page.getByText('Mythic+ Dungeon Boost').click();
    
    // Select USD currency and purchase
    await page.getByText('$50.00').click();
    await page.getByRole('button', { name: 'Purchase' }).click();
    
    // Should show success message
    await expect(page.getByText('Order created successfully')).toBeVisible();
    
    // Should redirect to order tracking or close modal
    await expect(page.getByText('Service Details')).not.toBeVisible();
  });

  test('should prevent purchase with insufficient balance', async ({ page }) => {
    // Set up wallet with insufficient balance
    await page.evaluate(() => {
      const wallet = {
        userId: 'test-client-1',
        balances: { gold: 1000, usd: 10, toman: 500000 },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-wallet-test-client-1', JSON.stringify(wallet));
    });
    
    await page.reload();
    
    // Try to purchase service
    await page.getByText('Mythic+ Dungeon Boost').click();
    await page.getByText('$50.00').click();
    await page.getByRole('button', { name: 'Purchase' }).click();
    
    // Should show insufficient balance error
    await expect(page.getByText('Insufficient balance')).toBeVisible();
  });

  test('should track order status', async ({ page }) => {
    // Create a mock order
    await page.evaluate(() => {
      const order = {
        id: 'order-1',
        serviceId: 'service-1',
        buyerId: 'test-client-1',
        status: 'pending',
        pricePaid: 50,
        currency: 'usd',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-orders', JSON.stringify([order]));
    });
    
    // Navigate to order history
    await page.getByText('My Orders').click();
    
    // Should show order with status
    await expect(page.getByText('Order #order-1')).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('$50.00')).toBeVisible();
  });
});