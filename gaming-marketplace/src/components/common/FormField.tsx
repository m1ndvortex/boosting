// Enhanced Form Field Component with Validation and Error Handling

import React, { useState, useCallback } from 'react';
import { Input } from '../discord/Input';
import { LoadingSpinner } from './LoadingStates';
import type { ValidationResult } from '../../services/multiWalletValidationService';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  warning?: string;
  helpText?: string;
  validator?: (value: string | number) => ValidationResult | Promise<ValidationResult>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceDelay?: number;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  rows?: number; // for textarea
  min?: number; // for number input
  max?: number; // for number input
  step?: number; // for number input
  className?: string;
  inputClassName?: string;
  'data-testid'?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  loading = false,
  error,
  warning,
  helpText,
  validator,
  validateOnChange = false,
  validateOnBlur = true,
  debounceDelay = 300,
  options = [],
  rows = 3,
  min,
  max,
  step,
  className = '',
  inputClassName = '',
  'data-testid': testId
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const [validationWarning, setValidationWarning] = useState<string>('');
  const [debounceTimeout, setDebounceTimeout] = useState<number | null>(null);

  // Combined error (prop error takes precedence)
  const displayError = error || validationError;
  const displayWarning = warning || validationWarning;

  const runValidation = useCallback(async (valueToValidate: string | number) => {
    if (!validator) return;

    setIsValidating(true);
    setValidationError('');
    setValidationWarning('');

    try {
      const result = await validator(valueToValidate);
      
      if (!result.isValid && result.errors.length > 0) {
        setValidationError(result.errors[0].message);
      }
      
      if (result.warnings && result.warnings.length > 0) {
        setValidationWarning(result.warnings[0].message);
      }
    } catch (validationErr) {
      setValidationError('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [validator]);

  const debouncedValidation = useCallback((valueToValidate: string | number) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      runValidation(valueToValidate);
    }, debounceDelay);

    setDebounceTimeout(timeout);
  }, [runValidation, debounceDelay, debounceTimeout]);

  const handleChange = useCallback((newValue: string | number) => {
    onChange(newValue);

    if (validateOnChange && validator) {
      debouncedValidation(newValue);
    }
  }, [onChange, validateOnChange, validator, debouncedValidation]);

  const handleBlur = useCallback(() => {
    if (onBlur) {
      onBlur();
    }

    if (validateOnBlur && validator) {
      runValidation(value);
    }
  }, [onBlur, validateOnBlur, validator, value, runValidation]);

  const renderInput = () => {
    const commonProps = {
      name,
      value: value.toString(),
      placeholder,
      disabled: disabled || loading,
      className: `form-field__input ${inputClassName} ${displayError ? 'form-field__input--error' : ''} ${displayWarning ? 'form-field__input--warning' : ''}`,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        handleChange(newValue);
      },
      onBlur: handleBlur,
      'data-testid': testId
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="" disabled>
              {placeholder || `Select ${label.toLowerCase()}`}
            </option>
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea 
            {...commonProps}
            rows={rows}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={type}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`} data-testid={`form-field-${name}`}>
      <label className="form-field__label" htmlFor={name}>
        {label}
        {required && <span className="form-field__required">*</span>}
        {(loading || isValidating) && (
          <LoadingSpinner size="xs" />
        )}
      </label>

      <div className="form-field__input-container">
        {renderInput()}
        
        {(loading || isValidating) && (
          <div className="form-field__loading-indicator">
            <LoadingSpinner size="xs" />
          </div>
        )}
      </div>

      {displayError && (
        <div className="form-field__error" data-testid={`${name}-error`}>
          <span className="form-field__error-icon">⚠️</span>
          {displayError}
        </div>
      )}

      {!displayError && displayWarning && (
        <div className="form-field__warning" data-testid={`${name}-warning`}>
          <span className="form-field__warning-icon">⚠️</span>
          {displayWarning}
        </div>
      )}

      {!displayError && !displayWarning && helpText && (
        <div className="form-field__help" data-testid={`${name}-help`}>
          {helpText}
        </div>
      )}
    </div>
  );
};

// Specialized form fields for common use cases

export const AmountField: React.FC<Omit<FormFieldProps, 'type' | 'validator'> & {
  currency?: string;
  maxAmount?: number;
  minAmount?: number;
}> = ({ currency, maxAmount, minAmount = 0, ...props }) => {
  const validator = useCallback((value: string | number) => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(amount)) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'INVALID_INPUT',
          message: 'Please enter a valid amount'
        }]
      };
    }

    if (amount < minAmount) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'INVALID_INPUT',
          message: `Amount must be at least ${minAmount}${currency ? ` ${currency}` : ''}`
        }]
      };
    }

    if (maxAmount && amount > maxAmount) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'INVALID_INPUT',
          message: `Amount cannot exceed ${maxAmount}${currency ? ` ${currency}` : ''}`
        }]
      };
    }

    if (maxAmount && amount > maxAmount * 0.8) {
      return {
        isValid: true,
        errors: [],
        warnings: [{
          field: props.name,
          message: 'Large amount. Please verify this is correct.'
        }]
      };
    }

    return { isValid: true, errors: [] };
  }, [currency, maxAmount, minAmount, props.name]);

  return (
    <FormField
      {...props}
      type="number"
      min={minAmount}
      max={maxAmount}
      step={0.01}
      validator={validator}
      placeholder={`Enter amount${currency ? ` in ${currency}` : ''}`}
    />
  );
};

export const EmailField: React.FC<Omit<FormFieldProps, 'type' | 'validator'>> = (props) => {
  const validator = useCallback((value: string | number) => {
    const email = value.toString().trim();
    
    if (!email) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'REQUIRED_FIELD_MISSING',
          message: 'Email is required'
        }]
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'VALIDATION_FAILED',
          message: 'Please enter a valid email address'
        }]
      };
    }

    return { isValid: true, errors: [] };
  }, [props.name]);

  return (
    <FormField
      {...props}
      type="email"
      validator={validator}
      placeholder="Enter your email address"
    />
  );
};

export const PasswordField: React.FC<Omit<FormFieldProps, 'type' | 'validator'> & {
  showStrengthIndicator?: boolean;
}> = ({ showStrengthIndicator = true, ...props }) => {
  const validator = useCallback((value: string | number) => {
    const password = value.toString();
    
    if (!password) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'REQUIRED_FIELD_MISSING',
          message: 'Password is required'
        }]
      };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        errors: [{
          field: props.name,
          code: 'VALIDATION_FAILED',
          message: 'Password must be at least 8 characters long'
        }]
      };
    }

    const warnings = [];
    if (!/[A-Z]/.test(password)) {
      warnings.push({
        field: props.name,
        message: 'Consider adding uppercase letters for better security'
      });
    }

    if (!/\d/.test(password)) {
      warnings.push({
        field: props.name,
        message: 'Consider adding numbers for better security'
      });
    }

    return { 
      isValid: true, 
      errors: [],
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }, [props.name]);

  return (
    <FormField
      {...props}
      type="password"
      validator={validator}
      placeholder="Enter your password"
    />
  );
};