import React, { useState } from 'react';
import { Sidebar, type SidebarItem } from '../../../components/layout/Sidebar';
import { DashboardHome } from '../sections/advertiser/DashboardHome';
import { MyServices } from '../sections/advertiser/MyServices';
import { RaidBooking } from '../sections/advertiser/RaidBooking';
import { MyOrders } from '../sections/advertiser/MyOrders';
import { Earnings } from '../sections/advertiser/Earnings';
import './AdvertiserTab.css';

type AdvertiserSection = 'dashboard' | 'services' | 'raid-booking' | 'orders' | 'earnings';

export const AdvertiserTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdvertiserSection>('dashboard');

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
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="advertiser-tab">
      <Sidebar 
        items={sidebarItems}
        className="advertiser-tab__sidebar"
        width={240}
      />
      <main className="advertiser-tab__main">
        {renderContent()}
      </main>
    </div>
  );
};