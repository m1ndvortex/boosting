import React from 'react';
import './Header.css';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  children,
  className = '',
  actions,
  breadcrumbs
}) => {
  const classes = [
    'discord-header',
    className
  ].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <div className="discord-header__content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="discord-header__breadcrumbs">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="discord-header__breadcrumb-separator">
                    /
                  </span>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    className="discord-header__breadcrumb-link"
                  >
                    {item.label}
                  </a>
                ) : item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="discord-header__breadcrumb-button"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="discord-header__breadcrumb-text">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        <div className="discord-header__main">
          <div className="discord-header__text">
            {title && (
              <h1 className="discord-header__title">{title}</h1>
            )}
            {subtitle && (
              <p className="discord-header__subtitle">{subtitle}</p>
            )}
            {children}
          </div>
          
          {actions && (
            <div className="discord-header__actions">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};