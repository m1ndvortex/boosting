import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const sizeClass = size === 'large' ? 'lg' : size;
  const classes = [
    'discord-button',
    `discord-button--${variant}`,
    `discord-button--${sizeClass}`,
    fullWidth && 'discord-button--full-width',
    loading && 'discord-button--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="discord-button__spinner" />}
      <span className={loading ? 'discord-button__content--loading' : 'discord-button__content'}>
        {children}
      </span>
    </button>
  );
};