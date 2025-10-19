import { test, expect } from '@playwright/test';

test.describe('Admin Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as admin user
    await page.getByText('TestAdmin').click();
    await expect(page).toHaveURL(/\/admin/);
  });

  test.describe('Game Management', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Games Management section
      await page.getByText('Games Management').click();
      await expect(page.locator('.admin-section__title')).toContainText('Games Management');
    });

    test('should display games management interface', async ({ page }) => {
      // Check that the games management panel is visible
      await expect(page.locator('.game-management-panel')).toBeVisible();
      await expect(page.locator('.game-management-panel__title')).toContainText('Game Management');
      await expect(page.getByRole('button', { name: 'Add New Game' })).toBeVisible();
    });

    test('should create a new game successfully', async ({ page }) => {
      // Click Add New Game button
      await page.getByRole('button', { name: 'Add New Game' }).click();
      
      // Fill in the form
      await page.getByLabel('Game Name').fill('Test Game');
      await page.getByLabel('Game Slug').fill('test-game');
      await page.getByLabel('Icon URL (Optional)').fill('/icons/test-game.png');
      
      // Submit the form
      await page.getByRole('button', { name: 'Create Game' }).click();
      
      // Wait for success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Test Game has been created successfully');
      
      // Verify the game appears in the list
      await expect(page.locator('.game-management-panel__game-name')).toContainText('Test Game');
    });

    test('should validate game form inputs', async ({ page }) => {
      // Click Add New Game button
      await page.getByRole('button', { name: 'Add New Game' }).click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Create Game' }).click();
      
      // Check validation errors
      await expect(page.locator('text=Game name is required')).toBeVisible();
      await expect(page.locator('text=Game slug is required')).toBeVisible();
    });

    test('should edit an existing game', async ({ page }) => {
      // First create a game
      await page.getByRole('button', { name: 'Add New Game' }).click();
      await page.getByLabel('Game Name').fill('Original Game');
      await page.getByLabel('Game Slug').fill('original-game');
      await page.getByRole('button', { name: 'Create Game' }).click();
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Click edit button for the game
      await page.locator('.game-management-panel__game-item').first().getByRole('button', { name: 'Edit' }).click();
      
      // Update the game name
      await page.getByLabel('Game Name').fill('Updated Game');
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Updated Game has been updated successfully');
      
      // Verify the updated name appears
      await expect(page.locator('.game-management-panel__game-name')).toContainText('Updated Game');
    });

    test('should deactivate and reactivate a game', async ({ page }) => {
      // First create a game
      await page.getByRole('button', { name: 'Add New Game' }).click();
      await page.getByLabel('Game Name').fill('Deactivation Test Game');
      await page.getByLabel('Game Slug').fill('deactivation-test');
      await page.getByRole('button', { name: 'Create Game' }).click();
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Deactivate the game
      await page.locator('.game-management-panel__game-item').first().getByRole('button', { name: 'Deactivate' }).click();
      
      // Confirm deactivation in dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('has been deactivated');
      
      // Verify inactive status badge appears
      await expect(page.locator('.game-management-panel__status-badge--inactive')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Reactivate the game
      await page.locator('.game-management-panel__game-item').first().getByRole('button', { name: 'Activate' }).click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('has been activated');
      
      // Verify inactive badge is gone
      await expect(page.locator('.game-management-panel__status-badge--inactive')).not.toBeVisible();
    });
  });

  test.describe('Realm Management', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Games Management section first
      await page.getByText('Games Management').click();
      
      // Create a test game if it doesn't exist
      const gameExists = await page.locator('.game-management-panel__game-name').count() > 0;
      if (!gameExists) {
        await page.getByRole('button', { name: 'Add New Game' }).click();
        await page.getByLabel('Game Name').fill('Test Game for Realms');
        await page.getByLabel('Game Slug').fill('test-game-realms');
        await page.getByRole('button', { name: 'Create Game' }).click();
        await expect(page.locator('.notification-toast--success')).toBeVisible();
        await page.waitForTimeout(2000);
      }
      
      // Navigate to realm management by clicking on a game
      await page.locator('.game-management-panel__game-item').first().click();
    });

    test('should display realm management interface', async ({ page }) => {
      // Check that the realm management panel is visible
      await expect(page.locator('.realm-management-panel')).toBeVisible();
      await expect(page.locator('.realm-management-panel__title')).toContainText('Realm Management');
      await expect(page.getByRole('button', { name: 'Add New Realm' })).toBeVisible();
    });

    test('should create a new realm successfully', async ({ page }) => {
      // Click Add New Realm button
      await page.getByRole('button', { name: 'Add New Realm' }).click();
      
      // Fill in the realm name
      await page.getByLabel('Realm Name').fill('Test Realm');
      
      // Submit the form
      await page.getByRole('button', { name: 'Create Realm' }).click();
      
      // Wait for success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Test Realm has been created successfully');
      
      // Verify the realm appears in the list
      await expect(page.locator('.realm-management-panel__realm-name')).toContainText('Test Realm');
    });

    test('should validate realm form inputs', async ({ page }) => {
      // Click Add New Realm button
      await page.getByRole('button', { name: 'Add New Realm' }).click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Create Realm' }).click();
      
      // Check validation error
      await expect(page.locator('text=Realm name is required')).toBeVisible();
    });

    test('should edit an existing realm', async ({ page }) => {
      // First create a realm
      await page.getByRole('button', { name: 'Add New Realm' }).click();
      await page.getByLabel('Realm Name').fill('Original Realm');
      await page.getByRole('button', { name: 'Create Realm' }).click();
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Click edit button for the realm
      await page.locator('.realm-management-panel__realm-item').first().getByRole('button', { name: 'Edit' }).click();
      
      // Update the realm name
      await page.getByLabel('Realm Name').fill('Updated Realm');
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Updated Realm has been updated successfully');
      
      // Verify the updated name appears
      await expect(page.locator('.realm-management-panel__realm-name')).toContainText('Updated Realm');
    });

    test('should deactivate and reactivate a realm', async ({ page }) => {
      // First create a realm
      await page.getByRole('button', { name: 'Add New Realm' }).click();
      await page.getByLabel('Realm Name').fill('Deactivation Test Realm');
      await page.getByRole('button', { name: 'Create Realm' }).click();
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Deactivate the realm
      await page.locator('.realm-management-panel__realm-item').first().getByRole('button', { name: 'Deactivate' }).click();
      
      // Confirm deactivation in dialog
      page.on('dialog', dialog => dialog.accept());
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('has been deactivated');
      
      // Verify inactive status badge appears
      await expect(page.locator('.realm-management-panel__status-badge--inactive')).toBeVisible();
      
      // Wait for notification to disappear
      await page.waitForTimeout(3000);
      
      // Reactivate the realm
      await page.locator('.realm-management-panel__realm-item').first().getByRole('button', { name: 'Activate' }).click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('has been activated');
      
      // Verify inactive badge is gone
      await expect(page.locator('.realm-management-panel__status-badge--inactive')).not.toBeVisible();
    });
  });

  test.describe('Gold Deposit Management', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Multi-Wallet Management section
      await page.getByText('Multi-Wallet Management').click();
      await expect(page.locator('.admin-section__title')).toContainText('Multi-Wallet Management');
      
      // Click on Gold Deposits tab
      await page.getByRole('button', { name: '💰 Gold Deposits' }).click();
    });

    test('should display gold deposit interface', async ({ page }) => {
      // Check that the gold deposit panel is visible
      await expect(page.locator('.admin-gold-deposit-panel')).toBeVisible();
      await expect(page.locator('.admin-gold-deposit-panel__title')).toContainText('Admin Gold Deposit');
      
      // Check form elements are present
      await expect(page.locator('text=Select User')).toBeVisible();
      await expect(page.locator('text=Select Realm')).toBeVisible();
      await expect(page.getByLabel('Gold Amount')).toBeVisible();
    });

    test('should validate gold deposit form', async ({ page }) => {
      // Try to submit without filling required fields
      await page.getByRole('button', { name: 'Deposit Gold' }).click();
      
      // Button should be disabled when form is incomplete
      await expect(page.getByRole('button', { name: 'Deposit Gold' })).toBeDisabled();
    });

    test('should show deposit summary when form is filled', async ({ page }) => {
      // Fill in the form
      await page.selectOption('select:has-text("Choose a user...")', 'user_1');
      
      // Wait for realms to load and select one
      await page.waitForTimeout(1000);
      const realmOptions = await page.locator('select:has-text("Choose a realm...") option').count();
      if (realmOptions > 1) {
        await page.selectOption('select:has-text("Choose a realm...")', { index: 1 });
      }
      
      await page.getByLabel('Gold Amount').fill('10000');
      
      // Check that deposit summary appears
      await expect(page.locator('.admin-gold-deposit-panel__summary')).toBeVisible();
      await expect(page.locator('.admin-gold-deposit-panel__summary')).toContainText('Deposit Summary');
      await expect(page.locator('.admin-gold-deposit-panel__summary')).toContainText('10,000 gold');
      await expect(page.locator('.admin-gold-deposit-panel__summary')).toContainText('Suspended for 2 months');
    });

    test('should process gold deposit with confirmation', async ({ page }) => {
      // Fill in the form
      await page.selectOption('select:has-text("Choose a user...")', 'user_1');
      
      // Wait for realms to load and select one
      await page.waitForTimeout(1000);
      const realmOptions = await page.locator('select:has-text("Choose a realm...") option').count();
      if (realmOptions > 1) {
        await page.selectOption('select:has-text("Choose a realm...")', { index: 1 });
      }
      
      await page.getByLabel('Gold Amount').fill('5000');
      
      // Submit the form
      await page.getByRole('button', { name: 'Deposit Gold' }).click();
      
      // Check confirmation dialog appears
      await expect(page.locator('.admin-gold-deposit-panel__dialog')).toBeVisible();
      await expect(page.locator('.admin-gold-deposit-panel__dialog')).toContainText('Confirm Gold Deposit');
      await expect(page.locator('.admin-gold-deposit-panel__dialog')).toContainText('5,000 gold');
      
      // Confirm the deposit
      await page.getByRole('button', { name: 'Confirm Deposit' }).click();
      
      // Wait for success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Successfully deposited');
      
      // Verify form is reset
      await expect(page.getByLabel('Gold Amount')).toHaveValue('');
    });

    test('should cancel gold deposit confirmation', async ({ page }) => {
      // Fill in the form
      await page.selectOption('select:has-text("Choose a user...")', 'user_1');
      
      // Wait for realms to load and select one
      await page.waitForTimeout(1000);
      const realmOptions = await page.locator('select:has-text("Choose a realm...") option').count();
      if (realmOptions > 1) {
        await page.selectOption('select:has-text("Choose a realm...")', { index: 1 });
      }
      
      await page.getByLabel('Gold Amount').fill('3000');
      
      // Submit the form
      await page.getByRole('button', { name: 'Deposit Gold' }).click();
      
      // Check confirmation dialog appears
      await expect(page.locator('.admin-gold-deposit-panel__dialog')).toBeVisible();
      
      // Cancel the deposit
      await page.getByRole('button', { name: 'Cancel' }).click();
      
      // Verify dialog is closed and form data is preserved
      await expect(page.locator('.admin-gold-deposit-panel__dialog')).not.toBeVisible();
      await expect(page.getByLabel('Gold Amount')).toHaveValue('3000');
    });
  });

  test.describe('Gold Deposit History', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Multi-Wallet Management section
      await page.getByText('Multi-Wallet Management').click();
      
      // Click on Deposit History tab
      await page.getByRole('button', { name: '📊 Deposit History' }).click();
    });

    test('should display deposit history interface', async ({ page }) => {
      // Check that the deposit history panel is visible
      await expect(page.locator('.gold-deposit-history-panel')).toBeVisible();
      await expect(page.locator('.gold-deposit-history-panel__title')).toContainText('Gold Deposit History');
      
      // Check filter elements are present
      await expect(page.locator('.gold-deposit-history-panel__filters')).toBeVisible();
    });

    test('should show deposit history entries', async ({ page }) => {
      // Check if there are any deposits or show empty state
      const hasDeposits = await page.locator('.gold-deposit-history-panel__deposit-item').count() > 0;
      
      if (hasDeposits) {
        // Verify deposit entries show required information
        await expect(page.locator('.gold-deposit-history-panel__deposit-item').first()).toBeVisible();
      } else {
        // Verify empty state is shown
        await expect(page.locator('.gold-deposit-history-panel__empty')).toBeVisible();
      }
    });

    test('should filter deposits by status', async ({ page }) => {
      // Test status filter functionality
      const statusFilter = page.locator('select[data-testid="status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('suspended');
        // Verify filtering works (implementation depends on actual data)
      }
    });
  });

  test.describe('Conversion Fee Configuration', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Multi-Wallet Management section
      await page.getByText('Multi-Wallet Management').click();
      
      // Click on Conversion Fees tab
      await page.getByRole('button', { name: '⚙️ Conversion Fees' }).click();
    });

    test('should display conversion fee configuration interface', async ({ page }) => {
      // Check that the conversion fee panel is visible
      await expect(page.locator('.conversion-fee-config-panel')).toBeVisible();
      await expect(page.locator('.conversion-fee-config-panel__title')).toContainText('Conversion Fee Configuration');
      
      // Check current configuration is displayed
      await expect(page.locator('.conversion-fee-config-panel__current')).toBeVisible();
      await expect(page.locator('text=USD Conversion Fee:')).toBeVisible();
      await expect(page.locator('text=Toman Conversion Fee:')).toBeVisible();
    });

    test('should show current fee configuration', async ({ page }) => {
      // Verify current fees are displayed
      await expect(page.locator('.conversion-fee-config-panel__fee-value')).toHaveCount(2);
      
      // Check status badge
      const statusBadge = page.locator('.conversion-fee-config-panel__status-badge');
      await expect(statusBadge).toBeVisible();
      await expect(statusBadge).toHaveText(/Active|Inactive/);
    });

    test('should edit conversion fees', async ({ page }) => {
      // Click edit button
      await page.getByRole('button', { name: 'Edit Configuration' }).click();
      
      // Verify form inputs appear
      await expect(page.getByLabel('USD Conversion Fee:')).toBeVisible();
      await expect(page.getByLabel('Toman Conversion Fee:')).toBeVisible();
      
      // Update fees
      await page.getByLabel('USD Conversion Fee:').fill('7.5');
      await page.getByLabel('Toman Conversion Fee:').fill('8.0');
      
      // Save changes
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Configuration Updated');
    });

    test('should cancel fee editing', async ({ page }) => {
      // Click edit button
      await page.getByRole('button', { name: 'Edit Configuration' }).click();
      
      // Make changes
      await page.getByLabel('USD Conversion Fee:').fill('99.9');
      
      // Cancel changes
      await page.getByRole('button', { name: 'Cancel' }).click();
      
      // Verify original values are restored
      await expect(page.getByLabel('USD Conversion Fee:')).not.toBeVisible();
      await expect(page.locator('.conversion-fee-config-panel__fee-value')).not.toContainText('99.9%');
    });

    test('should validate fee input ranges', async ({ page }) => {
      // Click edit button
      await page.getByRole('button', { name: 'Edit Configuration' }).click();
      
      // Try invalid values
      await page.getByLabel('USD Conversion Fee:').fill('-5');
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      // Check validation error
      await expect(page.locator('text=USD fee cannot be negative')).toBeVisible();
      
      // Try value over 100%
      await page.getByLabel('USD Conversion Fee:').fill('150');
      await page.getByRole('button', { name: 'Save Changes' }).click();
      
      // Check validation error
      await expect(page.locator('text=USD fee cannot exceed 100%')).toBeVisible();
    });

    test('should toggle fee status', async ({ page }) => {
      // Get current status
      const statusBadge = page.locator('.conversion-fee-config-panel__status-badge');
      const currentStatus = await statusBadge.textContent();
      
      // Click toggle button
      const toggleButton = currentStatus?.includes('Active') 
        ? page.getByRole('button', { name: 'Disable Fees' })
        : page.getByRole('button', { name: 'Enable Fees' });
      
      await toggleButton.click();
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Status Updated');
      
      // Verify status changed
      const newStatus = await statusBadge.textContent();
      expect(newStatus).not.toBe(currentStatus);
    });

    test('should show example conversions', async ({ page }) => {
      // Check that example calculations are displayed
      await expect(page.locator('.conversion-fee-config-panel__examples')).toBeVisible();
      await expect(page.locator('.conversion-fee-config-panel__example-card')).toHaveCount(3);
      
      // Verify examples show different amounts
      await expect(page.locator('text=1,000 Suspended Gold')).toBeVisible();
      await expect(page.locator('text=5,000 Suspended Gold')).toBeVisible();
      await expect(page.locator('text=10,000 Suspended Gold')).toBeVisible();
    });

    test('should show and hide configuration history', async ({ page }) => {
      // Click view history button
      await page.getByRole('button', { name: 'View History' }).click();
      
      // Verify history section appears
      await expect(page.locator('.conversion-fee-config-panel__history')).toBeVisible();
      await expect(page.locator('text=Configuration History')).toBeVisible();
      
      // Click hide history button
      await page.getByRole('button', { name: 'Hide History' }).click();
      
      // Verify history section is hidden
      await expect(page.locator('.conversion-fee-config-panel__history')).not.toBeVisible();
    });

    test('should reset fees to defaults with confirmation', async ({ page }) => {
      // Click reset button
      await page.getByRole('button', { name: 'Reset to Defaults' }).click();
      
      // Handle confirmation dialog
      page.on('dialog', dialog => {
        expect(dialog.message()).toContain('reset conversion fees to default values');
        dialog.accept();
      });
      
      // Verify success notification
      await expect(page.locator('.notification-toast--success')).toBeVisible();
      await expect(page.locator('.notification-toast--success')).toContainText('Reset Complete');
    });
  });
});
   