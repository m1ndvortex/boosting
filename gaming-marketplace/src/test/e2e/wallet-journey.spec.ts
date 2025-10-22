import { test, expect } from '@playwright/test';

test.describe('Wallet Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as client user
    await page.getByText('TestClient').click();
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Navigate to wallet
    await page.getByText('Wallet').click();
    await expect(page).toHaveURL(/\/wallet/);
  });

  test('should display wallet balances', async ({ page }) => {
    // Set up initial wallet balance
    await page.evaluate(() => {
      const wallet = {
        userId: 'test-client-1',
        balances: { gold: 150000, usd: 250.50, toman: 10500000 },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-wallet-test-client-1', JSON.stringify(wallet));
    });
    
    await page.reload();
    
    // Should display all currency balances
    await expect(page.getByText('150,000 G')).toBeVisible();
    await expect(page.getByText('$250.50')).toBeVisible();
    await expect(page.getByText('﷼10,500,000')).toBeVisible();
  });

  test('should complete deposit workflow', async ({ page }) => {
    // Click deposit button
    await page.getByRole('button', { name: 'Deposit' }).click();
    
    // Fill deposit form
    await page.getByLabel('Amount').fill('100');
    await page.selectOption('[data-testid="currency-select"]', 'usd');
    await page.getByText('Credit Card').click();
    
    // Submit deposit
    await page.getByRole('button', { name: 'Confirm Deposit' }).click();
    
    // Should show success message
    await expect(page.getByText('Deposit successful')).toBeVisible();
    
    // Should update balance
    await expect(page.getByText('$100.00')).toBeVisible();
  });

  test('should create withdrawal request', async ({ page }) => {
    // Set up wallet with balance
    await page.evaluate(() => {
      const wallet = {
        userId: 'test-client-1',
        balances: { gold: 100000, usd: 500, toman: 20000000 },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-wallet-test-client-1', JSON.stringify(wallet));
    });
    
    await page.reload();
    
    // Click withdraw button
    await page.getByRole('button', { name: 'Withdraw' }).click();
    
    // Fill withdrawal form
    await page.getByLabel('Amount').fill('200');
    await page.selectOption('[data-testid="currency-select"]', 'usd');
    
    // Submit withdrawal request
    await page.getByRole('button', { name: 'Request Withdrawal' }).click();
    
    // Should show pending approval message
    await expect(page.getByText('Withdrawal request submitted')).toBeVisible();
    await expect(page.getByText('Pending Admin Approval')).toBeVisible();
  });

  test('should complete currency conversion', async ({ page }) => {
    // Set up wallet with balance
    await page.evaluate(() => {
      const wallet = {
        userId: 'test-client-1',
        balances: { gold: 100000, usd: 500, toman: 20000000 },
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('gaming-marketplace-wallet-test-client-1', JSON.stringify(wallet));
    });
    
    await page.reload();
    
    // Click convert button
    await page.getByRole('button', { name: 'Convert' }).click();
    
    // Fill conversion form
    await page.selectOption('[data-testid="from-currency"]', 'usd');
    await page.selectOption('[data-testid="to-currency"]', 'gold');
    await page.getByLabel('Amount').fill('100');
    
    // Should show conversion rate
    await expect(page.getByText(/Exchange Rate:/)).toBeVisible();
    
    // Submit conversion
    await page.getByRole('button', { name: 'Convert Currency' }).click();
    
    // Should show success message
    await expect(page.getByText('Currency converted successfully')).toBeVisible();
    
    // Should update balances
    await expect(page.getByText('$400.00')).toBeVisible(); // 500 - 100
  });

  test('should display transaction history', async ({ page }) => {
    // Set up transaction history
    await page.evaluate(() => {
      const transactions = [
        {
          id: 'tx-1',
          walletId: 'test-client-1',
          type: 'deposit',
          amount: 100,
          currency: 'usd',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tx-2',
          walletId: 'test-client-1',
          type: 'withdrawal',
          amount: 50,
          currency: 'usd',
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('gaming-marketplace-transactions-test-client-1', JSON.stringify(transactions));
    });
    
    // Navigate to transaction history
    await page.getByText('Transaction History').click();
    
    // Should show transactions
    await expect(page.getByText('Deposit')).toBeVisible();
    await expect(page.getByText('Withdrawal')).toBeVisible();
    await expect(page.getByText('$100.00')).toBeVisible();
    await expect(page.getByText('$50.00')).toBeVisible();
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('Pending Approval')).toBeVisible();
  });

  test('should filter transaction history', async ({ page }) => {
    // Set up diverse transaction history
    await page.evaluate(() => {
      const transactions = [
        {
          id: 'tx-1',
          type: 'deposit',
          amount: 100,
          currency: 'usd',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tx-2',
          type: 'withdrawal',
          amount: 50,
          currency: 'usd',
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tx-3',
          type: 'conversion',
          amount: 25,
          currency: 'gold',
          status: 'completed',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('gaming-marketplace-transactions-test-client-1', JSON.stringify(transactions));
    });
    
    await page.getByText('Transaction History').click();
    
    // Filter by transaction type
    await page.selectOption('[data-testid="transaction-type-filter"]', 'deposit');
    await expect(page.getByText('Deposit')).toBeVisible();
    await expect(page.getByText('Withdrawal')).not.toBeVisible();
    
    // Filter by status
    await page.selectOption('[data-testid="transaction-type-filter"]', 'all');
    await page.selectOption('[data-testid="transaction-status-filter"]', 'completed');
    await expect(page.getByText('Deposit')).toBeVisible();
    await expect(page.getByText('Pending Approval')).not.toBeVisible();
  });
});