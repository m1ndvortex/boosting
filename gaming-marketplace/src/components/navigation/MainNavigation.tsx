import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MainNavigation.css';

export interface NavigationTab {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
}

// Global navigation tabs available to all authenticated users
const NAVIGATION_TABS: NavigationTab[] = [
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: '🛒',
    path: '/marketplace',
    description: 'Browse and purchase gaming services'
  },
  {
    id: 'shop',
    label: 'Shop',
    icon: '🏪',
    path: '/shop',
    description: 'Game time products and subscriptions'
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: '💰',
    path: '/wallet',
    description: 'Multi-currency wallet management'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/dashboard',
    description: 'Role-based dashboard'
  }
];

export interface MainNavigationProps {
  className?: string;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
  className = ''
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useAuth();

  // Helper function to check if user has admin role
  const hasAdminRole = (): boolean => {
    return state.user?.roles.some(
      role => role.name === 'admin' && role.status === 'active'
    ) || false;
  };

  // Get the appropriate dashboard path based on user roles
  const getDashboardPath = (): string => {
    return hasAdminRole() ? '/admin' : '/dashboard';
  };

  // Determine if a tab is active
  const isTabActive = (tab: NavigationTab): boolean => {
    if (tab.id === 'dashboard') {
      // Dashboard tab is active for both /admin and /dashboard paths
      return location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');
    }
    return location.pathname.startsWith(tab.path);
  };

  // Handle tab click
  const handleTabClick = (tab: NavigationTab): void => {
    if (tab.id === 'dashboard') {
      navigate(getDashboardPath());
    } else {
      navigate(tab.path);
    }
  };

  // Handle logout
  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  const classes = [
    'main-navigation',
    className
  ].filter(Boolean).join(' ');

  return (
    <nav className={classes}>
      <div className="main-navigation__container">
        {/* Logo/Brand */}
        <div className="main-navigation__brand">
          <span className="main-navigation__logo">🎮</span>
          <span className="main-navigation__title">Gaming Marketplace</span>
        </div>

        {/* Navigation Tabs */}
        <div className="main-navigation__tabs">
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`main-navigation__tab ${
                isTabActive(tab) ? 'main-navigation__tab--active' : ''
              }`}
              onClick={() => handleTabClick(tab)}
              title={tab.description}
            >
              <span className="main-navigation__tab-icon">{tab.icon}</span>
              <span className="main-navigation__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* User Menu */}
        <div className="main-navigation__user">
          <div className="main-navigation__user-info">
            <img
              src={state.user.avatar}
              alt={`${state.user.username}'s avatar`}
              className="main-navigation__user-avatar"
            />
            <div className="main-navigation__user-details">
              <span className="main-navigation__username">
                {state.user.username}
              </span>
              <span className="main-navigation__user-roles">
                {state.user.roles
                  .filter(role => role.status === 'active')
                  .map(role => role.name)
                  .join(', ')}
              </span>
            </div>
          </div>
          <button
            className="main-navigation__logout"
            onClick={handleLogout}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
};