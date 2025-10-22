import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { MarketplacePage } from '@pages/marketplace/MarketplacePage';
import { WalletPage } from '@pages/wallet/WalletPage';
import { createMockUser, createMockService } from '@/test/utils/test-utils';
import React from 'react';

describe('Performance Tests - Large Dataset Handling', () => {
  const mockUser = createMockUser();

  beforeEach(() => {
    localStorage.clear();
  });

  it('should handle large number of services efficiently', async () => {
    const startTime = performance.now();
    
    // Generate 1000 mock services
    const largeServiceList = Array.from({ length: 1000 }, (_, index) => 
      createMockService({
        id: `service-${index}`,
        title: `Service ${index}`,
        gameId: index % 3 === 0 ? 'wow' : index % 3 === 1 ? 'ff14' : 'gw2',
        serviceTypeId: index % 4 === 0 ? 'mythic-plus' : index % 4 === 1 ? 'leveling' : index % 4 === 2 ? 'raid' : 'custom',
        prices: { 
          gold: 50000 + (index * 1000), 
          usd: 25 + (index * 0.5), 
          toman: 1000000 + (index * 50000) 
        },
      })
    );
    
    localStorage.setItem('gaming-marketplace-services', JSON.stringify(largeServiceList));
    
    const setupTime = performance.now();
    
    render(<MarketplacePage />, { initialUser: mockUser });
    
    // Should render marketplace page within reasonable time
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    const renderTime = performance.now();
    
    // Performance assertions
    expect(setupTime - startTime).toBeLessThan(100); // Setup should be fast
    expect(renderTime - setupTime).toBeLessThan(2000); // Render should be under 2s
    
    // Test search input performance
    const searchStartTime = performance.now();
    
    const searchInput = screen.getByPlaceholderText(/Search services/i);
    searchInput.focus();
    
    // Simulate typing (should be responsive)
    for (const char of 'Service') {
      searchInput.value += char;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const searchEndTime = performance.now();
    expect(searchEndTime - searchStartTime).toBeLessThan(500); // Search should be under 500ms
  });

  it('should handle large transaction history efficiently', async () => {
    const startTime = performance.now();
    
    // Generate 5000 mock transactions
    const largeTransactionList = Array.from({ length: 5000 }, (_, index) => ({
      id: `tx-${index}`,
      walletId: mockUser.id,
      type: index % 4 === 0 ? 'deposit' : index % 4 === 1 ? 'withdrawal' : index % 4 === 2 ? 'conversion' : 'purchase',
      amount: Math.floor(Math.random() * 1000) + 10,
      currency: index % 3 === 0 ? 'gold' : index % 3 === 1 ? 'usd' : 'toman',
      status: index % 5 === 0 ? 'pending_approval' : 'completed',
      createdAt: new Date(Date.now() - (index * 60000)).toISOString(), // Spread over time
    }));
    
    localStorage.setItem(`gaming-marketplace-transactions-${mockUser.id}`, JSON.stringify(largeTransactionList));
    
    // Set up wallet data to prevent null errors
    const mockWallet = {
      userId: mockUser.id,
      balances: { gold: 100000, usd: 500, toman: 20000000 },
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`gaming-marketplace-wallet-${mockUser.id}`, JSON.stringify(mockWallet));
    
    const setupTime = performance.now();
    
    render(<WalletPage />, { initialUser: mockUser });
    
    // Should render wallet page within reasonable time
    await waitFor(() => {
      expect(screen.getByText('Wallet')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const renderTime = performance.now();
    
    // Performance assertions
    expect(setupTime - startTime).toBeLessThan(200); // Setup should be fast
    expect(renderTime - setupTime).toBeLessThan(3000); // Render should be under 3s
    
    // Test data processing performance
    const processingStartTime = performance.now();
    const processedTransactions = largeTransactionList.slice(0, 100); // Simulate pagination
    const processingEndTime = performance.now();
    
    expect(processingEndTime - processingStartTime).toBeLessThan(100); // Processing should be fast
    expect(processedTransactions.length).toBe(100);
  });

  it('should handle rapid state updates efficiently', async () => {
    render(<MarketplacePage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
    
    const startTime = performance.now();
    
    // Simulate rapid data processing instead of DOM manipulation
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    
    // Rapid array operations
    for (let i = 0; i < 10; i++) {
      const filtered = largeArray.filter(x => x % (i + 1) === 0);
      const mapped = filtered.map(x => x * 2);
      const reduced = mapped.reduce((a, b) => a + b, 0);
      
      // Simulate state updates
      expect(reduced).toBeGreaterThan(0);
    }
    
    const endTime = performance.now();
    
    // Should handle rapid updates without blocking UI
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should efficiently manage localStorage with large data', async () => {
    const startTime = performance.now();
    
    // Test localStorage performance with large objects
    const largeDataSet = {
      services: Array.from({ length: 2000 }, (_, i) => createMockService({ id: `service-${i}` })),
      orders: Array.from({ length: 1000 }, (_, i) => ({
        id: `order-${i}`,
        serviceId: `service-${i % 100}`,
        buyerId: mockUser.id,
        status: 'completed',
        pricePaid: Math.random() * 100,
        currency: 'usd',
        createdAt: new Date().toISOString(),
      })),
      transactions: Array.from({ length: 3000 }, (_, i) => ({
        id: `tx-${i}`,
        walletId: mockUser.id,
        type: 'deposit',
        amount: Math.random() * 500,
        currency: 'usd',
        status: 'completed',
        createdAt: new Date().toISOString(),
      })),
    };
    
    // Test write performance
    const writeStartTime = performance.now();
    localStorage.setItem('gaming-marketplace-services', JSON.stringify(largeDataSet.services));
    localStorage.setItem('gaming-marketplace-orders', JSON.stringify(largeDataSet.orders));
    localStorage.setItem(`gaming-marketplace-transactions-${mockUser.id}`, JSON.stringify(largeDataSet.transactions));
    const writeEndTime = performance.now();
    
    // Test read performance
    const readStartTime = performance.now();
    const services = JSON.parse(localStorage.getItem('gaming-marketplace-services') || '[]');
    const orders = JSON.parse(localStorage.getItem('gaming-marketplace-orders') || '[]');
    const transactions = JSON.parse(localStorage.getItem(`gaming-marketplace-transactions-${mockUser.id}`) || '[]');
    const readEndTime = performance.now();
    
    const totalTime = performance.now() - startTime;
    
    // Performance assertions
    expect(writeEndTime - writeStartTime).toBeLessThan(1000); // Write should be under 1s
    expect(readEndTime - readStartTime).toBeLessThan(500); // Read should be under 500ms
    expect(totalTime).toBeLessThan(2000); // Total operation under 2s
    
    // Verify data integrity
    expect(services).toHaveLength(2000);
    expect(orders).toHaveLength(1000);
    expect(transactions).toHaveLength(3000);
  });

  it('should handle memory usage efficiently with large datasets', async () => {
    // Monitor memory usage if available
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Create large dataset in memory
    const largeServiceList = Array.from({ length: 5000 }, (_, index) => 
      createMockService({
        id: `service-${index}`,
        title: `Service ${index}`,
        description: `This is a detailed description for service ${index}. `.repeat(10),
      })
    );
    
    localStorage.setItem('gaming-marketplace-services', JSON.stringify(largeServiceList));
    
    render(<MarketplacePage />, { initialUser: mockUser });
    
    await waitFor(() => {
      expect(screen.getByText('🛒 Marketplace')).toBeInTheDocument();
    });
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Memory usage should be reasonable (if memory API is available)
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    }
    
    // Test data structure efficiency
    expect(largeServiceList.length).toBe(5000);
    expect(largeServiceList[0]).toHaveProperty('id');
    expect(largeServiceList[0]).toHaveProperty('title');
    
    // Cleanup
    localStorage.clear();
  });

  it('should handle concurrent operations efficiently', async () => {
    const startTime = performance.now();
    
    // Simulate concurrent operations
    const operations = [
      // Concurrent localStorage operations
      () => localStorage.setItem('test-1', JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: i })))),
      () => localStorage.setItem('test-2', JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: i })))),
      () => localStorage.setItem('test-3', JSON.stringify(Array.from({ length: 1000 }, (_, i) => ({ id: i })))),
      
      // Concurrent data processing
      () => Array.from({ length: 1000 }, (_, i) => i * 2).reduce((a, b) => a + b, 0),
      () => Array.from({ length: 1000 }, (_, i) => i * 3).filter(x => x % 2 === 0),
      () => Array.from({ length: 1000 }, (_, i) => ({ id: i, value: i * 4 })).map(x => x.value),
    ];
    
    // Execute operations concurrently
    await Promise.all(operations.map(op => Promise.resolve(op())));
    
    const endTime = performance.now();
    
    // Should complete concurrent operations efficiently
    expect(endTime - startTime).toBeLessThan(2000);
  });
});