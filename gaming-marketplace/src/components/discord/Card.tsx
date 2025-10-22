import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick
}) => {
  const classes = [
    'discord-card',
    `discord-card--padding-${padding}`,
    hover && 'discord-card--hover',
    clickable && 'discord-card--clickable',
    className
  ].filter(Boolean).join(' ');

  const Component = clickable ? 'button' : 'div';

  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = ''
}) => (
  <div className={`discord-card__header ${className}`}>
    {children}
  </div>
);

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = ''
}) => (
  <div className={`discord-card__body ${className}`}>
    {children}
  </div>
);

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = ''
}) => (
  <div className={`discord-card__footer ${className}`}>
    {children}
  </div>
);