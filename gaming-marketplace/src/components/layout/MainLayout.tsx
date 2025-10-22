import React from 'react';
import { MainNavigation } from '../navigation/MainNavigation';
import './MainLayout.css';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = ''
}) => {
  const classes = [
    'main-layout',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <MainNavigation />
      <main className="main-layout__content">
        {children}
      </main>
    </div>
  );
};