// Combined app provider that wraps all context providers

import React from 'react';
import { AuthProvider } from './AuthContext';
import { WalletProvider } from './WalletContext';
import { MultiWalletProvider } from './MultiWalletContext';
import { WorkspaceProvider } from './WorkspaceContext';
import { OrderProvider } from './OrderContext';
import { GameProvider } from './GameContext';
import { DataService } from '../services/dataService';

// Initialize data service when app starts
DataService.initialize();

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <GameProvider>
        <WalletProvider>
          <MultiWalletProvider>
            <WorkspaceProvider>
              <OrderProvider>
                {children}
              </OrderProvider>
            </WorkspaceProvider>
          </MultiWalletProvider>
        </WalletProvider>
      </GameProvider>
    </AuthProvider>
  );
};

// Export all context hooks for convenience
export { useAuth } from './AuthContext';
export { useWallet } from './WalletContext';
export { useMultiWallet } from './MultiWalletContext';
export { useWorkspace } from './WorkspaceContext';
export { useOrders } from './OrderContext';
export { useGames } from './GameContext';