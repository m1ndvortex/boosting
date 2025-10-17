import React from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color
}) => {
  const classes = [
    'discord-spinner',
    `discord-spinner--${size}`,
    className
  ].filter(Boolean).join(' ');

  const style = color ? { borderTopColor: color } : undefined;

  return (
    <div className={classes} style={style} />
  );
};