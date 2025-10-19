import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar, type SidebarItem } from '../../components/layout/Sidebar';
import { DashboardHome } from './sections/DashboardHome';
import { GamesManagement } from './sections/GamesManagement';
import { UsersAndRoles } from './sections/UsersAndRoles';
import { PendingRoleRequests } from './sections/PendingRoleRequests';
import { FinancialManagement } from './sections/FinancialManagement';
import { ExchangeRates } from './sections/ExchangeRates';
import { ShopManagement } from './sections/ShopManagement';
import { OrderReview } from './sections/OrderReview';
import { SystemSettings } from './sections/SystemSettings';
import { MultiWalletManagement } from './sections/MultiWalletManagement';
import './AdminDashboard.css';

type AdminSection = 
  | 'dashboard-home'
  | 'games-management'
  | 'users-roles'
  | 'pending-requests'
  | 'financial-management'
  | 'multi-wallet-management'
  | 'exchange-rates'
  | 'shop-management'
  | 'order-review'
  | 'system-settings';

export const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard-home');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard-home',
      label: 'Dashboard Home',
      icon: '📊',
      active: activeSection === 'dashboard-home',
      onClick: () => setActiveSection('dashboard-home'),
    },
    {
      id: 'games-management',
      label: 'Games Management',
      icon: '🎮',
      active: activeSection === 'games-management',
      onClick: () => setActiveSection('games-management'),
    },
    {
      id: 'users-roles',
      label: 'Users & Roles',
      icon: '👥',
      active: activeSection === 'users-roles',
      onClick: () => setActiveSection('users-roles'),
    },
    {
      id: 'pending-requests',
      label: 'Pending Role Requests',
      icon: '⏳',
      active: activeSection === 'pending-requests',
      onClick: () => setActiveSection('pending-requests'),
    },
    {
      id: 'financial-management',
      label: 'Financial Management',
      icon: '💰',
      active: activeSection === 'financial-management',
      onClick: () => setActiveSection('financial-management'),
    },
    {
      id: 'multi-wallet-management',
      label: 'Multi-Wallet Management',
      icon: '🏦',
      active: activeSection === 'multi-wallet-management',
      onClick: () => setActiveSection('multi-wallet-management'),
    },
    {
      id: 'exchange-rates',
      label: 'Exchange Rates',
      icon: '💱',
      active: activeSection === 'exchange-rates',
      onClick: () => setActiveSection('exchange-rates'),
    },
    {
      id: 'shop-management',
      label: 'Shop Management',
      icon: '🏪',
      active: activeSection === 'shop-management',
      onClick: () => setActiveSection('shop-management'),
    },
    {
      id: 'order-review',
      label: 'Order Review',
      icon: '📋',
      active: activeSection === 'order-review',
      onClick: () => setActiveSection('order-review'),
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: '⚙️',
      active: activeSection === 'system-settings',
      onClick: () => setActiveSection('system-settings'),
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard-home':
        return <DashboardHome />;
      case 'games-management':
        return <GamesManagement />;
      case 'users-roles':
        return <UsersAndRoles />;
      case 'pending-requests':
        return <PendingRoleRequests />;
      case 'financial-management':
        return <FinancialManagement />;
      case 'multi-wallet-management':
        return <MultiWalletManagement />;
      case 'exchange-rates':
        return <ExchangeRates />;
      case 'shop-management':
        return <ShopManagement />;
      case 'order-review':
        return <OrderReview />;
      case 'system-settings':
        return <SystemSettings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar items={sidebarItems} className="admin-dashboard__sidebar" />
      <div className="admin-dashboard__content">
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">Admin Dashboard</h1>
          <p className="admin-dashboard__subtitle">
            Welcome, {state.user?.username} - Platform Administration
          </p>
        </div>
        <div className="admin-dashboard__main">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};