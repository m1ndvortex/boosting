import React from 'react';
import './Layout.css';

export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className = ''
}) => {
  const classes = [
    'discord-layout',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className = '',
  padding = true
}) => {
  const classes = [
    'discord-main-content',
    padding && 'discord-main-content--padded',
    className
  ].filter(Boolean).join(' ');

  return (
    <main className={classes}>
      {children}
    </main>
  );
};

export interface ContentAreaProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string | number;
  centered?: boolean;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  children,
  className = '',
  maxWidth = '1200px',
  centered = true
}) => {
  const classes = [
    'discord-content-area',
    centered && 'discord-content-area--centered',
    className
  ].filter(Boolean).join(' ');

  const style = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth
  };

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};