import React, { forwardRef } from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;
  
  const classes = [
    'discord-input-wrapper',
    fullWidth && 'discord-input-wrapper--full-width',
    error && 'discord-input-wrapper--error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="discord-input__label">
          {label}
        </label>
      )}
      <div className="discord-input__container">
        {leftIcon && (
          <div className="discord-input__icon discord-input__icon--left">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className="discord-input"
          {...props}
        />
        {rightIcon && (
          <div className="discord-input__icon discord-input__icon--right">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <div className={`discord-input__helper ${error ? 'discord-input__helper--error' : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});