import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../discord/Button';
import { Input } from '../discord/Input';
import { MultiWalletService } from '../../services/multiWalletService';
import { GameManagementService } from '../../services/gameManagementService';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingOverlay } from '../common/LoadingStates';
import type { SuspendedDeposit, GameRealm, User } from '../../types';
import './GoldDepositHistoryPanel.css';

interface GoldDepositHistoryPanelProps {
  className?: string;
}

interface DepositWithDetails extends SuspendedDeposit {
  realmId: string;
  realmName: string;
  gameName: string;
  userId: string;
  username?: string;
}

interface FilterState {
  userId: string;
  realmId: string;
  status: 'all' | 'suspended' | 'withdrawable';
  searchQuery: string;
}

// Mock users for now - in a real app this would come from a user service
const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    discordId: '123456789',
    username: 'TestUser1',
    discriminator: '0001',
    avatar: '',
    email: 'test1@example.com',
    roles: [{ id: 'role_1', name: 'booster', status: 'active' }],
    createdAt: new Date()
  },
  {
    id: 'user_2',
    discordId: '987654321',
    username: 'TestUser2',
    discriminator: '0002',
    avatar: '',
    email: 'test2@example.com',
    roles: [{ id: 'role_2', name: 'advertiser', status: 'active' }],
    createdAt: new Date()
  },
  {
    id: 'user_3',
    discordId: '456789123',
    username: 'TestUser3',
    discriminator: '0003',
    avatar: '',
    email: 'test3@example.com',
    roles: [{ id: 'role_3', name: 'client', status: 'active' }],
    createdAt: new Date()
  }
];

const ITEMS_PER_PAGE = 10;

export const GoldDepositHistoryPanel: React.FC<GoldDepositHistoryPanelProps> = ({ className = '' }) => {
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositWithDetails[]>([]);
  const [availableRealms, setAvailableRealms] = useState<GameRealm[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    userId: '',
    realmId: '',
    status: 'all',
    searchQuery: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Initialize services
      GameManagementService.initialize();
      
      // Load available realms
      const realms = GameManagementService.getAllRealms();
      setAvailableRealms(realms);

      // Load all deposits from all users
      const allDeposits: DepositWithDetails[] = [];
      
      // In a real app, you would get all user IDs from a user service
      // For now, we'll check our mock users and any existing wallets
      const userIds = MOCK_USERS.map(u => u.id);
      
      for (const userId of userIds) {
        try {
          const userDeposits = MultiWalletService.getAllSuspendedDeposits(userId);
          const depositsWithUserInfo = userDeposits.map(deposit => ({
            ...deposit,
            userId,
            username: MOCK_USERS.find(u => u.id === userId)?.username
          }));
          allDeposits.push(...depositsWithUserInfo);
        } catch (error) {
          // User might not have a wallet yet, skip
          console.debug(`No wallet found for user ${userId}`);
        }
      }

      setDeposits(allDeposits);
    } catch (error) {
      console.error('Failed to load deposit history:', error);
      showError('Load Failed', 'Failed to load deposit history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      realmId: '',
      status: 'all',
      searchQuery: ''
    });
    setCurrentPage(1);
  };

  // Filter and search deposits
  const filteredDeposits = useMemo(() => {
    let filtered = deposits;

    // Filter by user
    if (filters.userId) {
      filtered = filtered.filter(deposit => deposit.userId === filters.userId);
    }

    // Filter by realm
    if (filters.realmId) {
      filtered = filtered.filter(deposit => deposit.realmId === filters.realmId);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(deposit => deposit.status === filters.status);
    }

    // Search query (username, realm name, or game name)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(deposit => 
        deposit.username?.toLowerCase().includes(query) ||
        deposit.realmName.toLowerCase().includes(query) ||
        deposit.gameName.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.depositedAt.getTime() - a.depositedAt.getTime());
  }, [deposits, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getTimeRemaining = (deposit: DepositWithDetails): string => {
    if (deposit.status === 'withdrawable') {
      return 'Available now';
    }

    const now = new Date();
    const withdrawableAt = new Date(deposit.withdrawableAt);
    const timeRemaining = withdrawableAt.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      return 'Available now';
    }

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
  };

  const getStatusBadgeClass = (status: 'suspended' | 'withdrawable'): string => {
    return status === 'suspended' 
      ? 'gold-deposit-history-panel__status-badge--suspended'
      : 'gold-deposit-history-panel__status-badge--withdrawable';
  };

  return (
    <LoadingOverlay isLoading={loading} message="Loading deposit history...">
      <div className={`gold-deposit-history-panel ${className}`}>
        <div className="gold-deposit-history-panel__header">
          <h3 className="gold-deposit-history-panel__title">Gold Deposit History</h3>
          <p className="gold-deposit-history-panel__description">
            View and manage all gold deposits across all users and realms
          </p>
        </div>

        {/* Filters */}
        <div className="gold-deposit-history-panel__filters">
          <div className="gold-deposit-history-panel__filters-row">
            {/* Search */}
            <div className="gold-deposit-history-panel__filter-field">
              <Input
                label="Search"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                placeholder="Search by username, realm, or game..."
                fullWidth
              />
            </div>

            {/* User Filter */}
            <div className="gold-deposit-history-panel__filter-field">
              <label className="gold-deposit-history-panel__filter-label">User</label>
              <select
                className="gold-deposit-history-panel__filter-select"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              >
                <option value="">All Users</option>
                {MOCK_USERS.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}#{user.discriminator}
                  </option>
                ))}
              </select>
            </div>

            {/* Realm Filter */}
            <div className="gold-deposit-history-panel__filter-field">
              <label className="gold-deposit-history-panel__filter-label">Realm</label>
              <select
                className="gold-deposit-history-panel__filter-select"
                value={filters.realmId}
                onChange={(e) => handleFilterChange('realmId', e.target.value)}
              >
                <option value="">All Realms</option>
                {availableRealms.map(realm => (
                  <option key={realm.id} value={realm.id}>
                    {realm.gameName} - {realm.realmName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="gold-deposit-history-panel__filter-field">
              <label className="gold-deposit-history-panel__filter-label">Status</label>
              <select
                className="gold-deposit-history-panel__filter-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as FilterState['status'])}
              >
                <option value="all">All Status</option>
                <option value="suspended">Suspended</option>
                <option value="withdrawable">Withdrawable</option>
              </select>
            </div>
          </div>

          <div className="gold-deposit-history-panel__filters-actions">
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="primary" size="sm" onClick={loadData}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="gold-deposit-history-panel__summary">
          <p className="gold-deposit-history-panel__summary-text">
            Showing {paginatedDeposits.length} of {filteredDeposits.length} deposits
            {filteredDeposits.length !== deposits.length && ` (filtered from ${deposits.length} total)`}
          </p>
        </div>

        {/* Deposits Table */}
        {filteredDeposits.length === 0 ? (
          <div className="gold-deposit-history-panel__empty">
            <p>No deposits found matching your criteria.</p>
            {(filters.userId || filters.realmId || filters.status !== 'all' || filters.searchQuery) && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="gold-deposit-history-panel__table-container">
              <table className="gold-deposit-history-panel__table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Realm</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Deposited</th>
                    <th>Time Remaining</th>
                    <th>Deposited By</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeposits.map((deposit) => (
                    <tr key={deposit.id} className="gold-deposit-history-panel__table-row">
                      <td className="gold-deposit-history-panel__table-cell">
                        <div className="gold-deposit-history-panel__user-info">
                          <span className="gold-deposit-history-panel__username">
                            {deposit.username || 'Unknown User'}
                          </span>
                        </div>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <div className="gold-deposit-history-panel__realm-info">
                          <span className="gold-deposit-history-panel__game-name">
                            {deposit.gameName}
                          </span>
                          <span className="gold-deposit-history-panel__realm-name">
                            {deposit.realmName}
                          </span>
                        </div>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <span className="gold-deposit-history-panel__amount">
                          {deposit.amount.toLocaleString()} gold
                        </span>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <span className={`gold-deposit-history-panel__status-badge ${getStatusBadgeClass(deposit.status)}`}>
                          {deposit.status === 'suspended' ? 'Suspended' : 'Withdrawable'}
                        </span>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <span className="gold-deposit-history-panel__date">
                          {deposit.depositedAt.toLocaleDateString()}
                        </span>
                        <span className="gold-deposit-history-panel__time">
                          {deposit.depositedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <span className="gold-deposit-history-panel__time-remaining">
                          {getTimeRemaining(deposit)}
                        </span>
                      </td>
                      <td className="gold-deposit-history-panel__table-cell">
                        <span className="gold-deposit-history-panel__deposited-by">
                          {deposit.depositedBy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="gold-deposit-history-panel__pagination">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="gold-deposit-history-panel__pagination-info">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </LoadingOverlay>
  );
};