import React, { useState } from 'react';
import { Sidebar, type SidebarItem } from '../../../components/layout/Sidebar';
import { DashboardHome } from '../sections/advertiser/DashboardHome';
import { MyServices } from '../sections/advertiser/MyServices';
import { RaidBooking } from '../sections/advertiser/RaidBooking';
import { MyOrders } from '../sections/advertiser/MyOrders';
import { Earnings } from '../sections/advertiser/Earnings';
import { TeamManagement } from '../../../components/team/TeamManagement';
import './TeamAdvertiserTab.css';

type TeamAdvertiserSection = 'dashboard' | 'services' | 'raid-booking' | 'orders' | 'earnings' | 'team-management';

export const TeamAdvertiserTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<TeamAdvertiserSection>('dashboard');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Home',
      icon: '🏠',
      active: activeSection === 'dashboard',
      onClick: () => setActiveSection('dashboard')
    },
    {
      id: 'services',
      label: 'My Services',
      icon: '⚙️',
      active: activeSection === 'services',
      onClick: () => setActiveSection('services')
    },
    {
      id: 'raid-booking',
      label: 'Raid Booking',
      icon: '🗡️',
      active: activeSection === 'raid-booking',
      onClick: () => setActiveSection('raid-booking')
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: '📋',
      active: activeSection === 'orders',
      onClick: () => setActiveSection('orders')
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: '💰',
      active: activeSection === 'earnings',
      onClick: () => setActiveSection('earnings')
    },
    {
      id: 'team-management',
      label: 'Team Management',
      icon: '👥',
      active: activeSection === 'team-management',
      onClick: () => setActiveSection('team-management')
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'services':
        return <MyServices />;
      case 'raid-booking':
        return <RaidBooking />;
      case 'orders':
        return <MyOrders />;
      case 'earnings':
        return <Earnings />;
      case 'team-management':
        return <TeamManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="team-advertiser-tab">
      <Sidebar 
        items={sidebarItems}
        className="team-advertiser-tab__sidebar"
        width={240}
      />
      <main className="team-advertiser-tab__main">
        {renderContent()}
      </main>
    </div>
  );
};