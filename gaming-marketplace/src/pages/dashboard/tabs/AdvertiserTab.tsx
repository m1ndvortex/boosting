import React, { useState } from 'react';
import { Sidebar, type SidebarItem } from '../../../components/layout/Sidebar';
import { DashboardHome } from '../sections/advertiser/DashboardHome';
import { MyServices } from '../sections/advertiser/MyServices';
import { RaidBooking } from '../sections/advertiser/RaidBooking';
import { MythicPlusOrders } from '../sections/advertiser/MythicPlusOrders';
import { Earnings } from '../sections/advertiser/Earnings';
import './AdvertiserTab.css';

type AdvertiserSection = 'dashboard' | 'services' | 'raid-booking' | 'mythic-orders' | 'earnings';

export const AdvertiserTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdvertiserSection>('mythic-orders');

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
      id: 'mythic-orders',
      label: 'Mythic+ Orders',
      icon: '�️',
      active: activeSection === 'mythic-orders',
      onClick: () => setActiveSection('mythic-orders')
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
      case 'mythic-orders':
        return <MythicPlusOrders />;
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