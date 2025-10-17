import React, { useState } from 'react';
import { Sidebar, type SidebarItem } from '../../../components/layout/Sidebar';
import { DashboardHome } from '../sections/booster/DashboardHome';
import { AssignedOrders } from '../sections/booster/AssignedOrders';
import { MyEarnings } from '../sections/booster/MyEarnings';
import { Profile } from '../sections/booster/Profile';
import './BoosterTab.css';

type BoosterSection = 'dashboard' | 'orders' | 'earnings' | 'profile';

export const BoosterTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<BoosterSection>('dashboard');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Home',
      icon: '🏠',
      active: activeSection === 'dashboard',
      onClick: () => setActiveSection('dashboard')
    },
    {
      id: 'orders',
      label: 'Assigned Orders',
      icon: '📋',
      active: activeSection === 'orders',
      onClick: () => setActiveSection('orders')
    },
    {
      id: 'earnings',
      label: 'My Earnings',
      icon: '💰',
      active: activeSection === 'earnings',
      onClick: () => setActiveSection('earnings')
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      active: activeSection === 'profile',
      onClick: () => setActiveSection('profile')
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'orders':
        return <AssignedOrders />;
      case 'earnings':
        return <MyEarnings />;
      case 'profile':
        return <Profile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="booster-tab">
      <Sidebar 
        items={sidebarItems}
        className="booster-tab__sidebar"
        width={240}
      />
      <main className="booster-tab__main">
        {renderContent()}
      </main>
    </div>
  );
};