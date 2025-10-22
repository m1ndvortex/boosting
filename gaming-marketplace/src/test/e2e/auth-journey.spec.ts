import { test, expect } from '@playwright/test';

test.describe('Authentication Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete Discord OAuth simulation flow', async ({ page }) => {
    // Should show Discord login page
    await expect(page.getByText('Sign in with Discord')).toBeVisible();
    
    // Should show mock user selection
    await expect(page.getByText('Select a user to simulate login')).toBeVisible();
    
    // Select a client user
    await page.getByText('TestClient').click();
    
    // Should redirect to marketplace after login
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.getByText('Marketplace')).toBeVisible();
  });

  test('should redirect admin users to admin dashboard', async ({ page }) => {
    await page.getByText('AdminUser').click();
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('Admin Dashboard')).toBeVisible();
    await expect(page.getByText('Dashboard Home')).toBeVisible();
  });

  test('should redirect service providers to service provider dashboard', async ({ page }) => {
    await page.getByText('BoosterUser').click();
    
    // Should redirect to service provider dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('🎮 Booster')).toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.getByText('TestClient').click();
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Logout
    await page.getByText('Logout').click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Sign in with Discord')).toBeVisible();
  });

  test('should persist user session across page refresh', async ({ page }) => {
    // Login
    await page.getByText('TestClient').click();
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/\/marketplace/);
    await expect(page.getByText('Marketplace')).toBeVisible();
  });
});