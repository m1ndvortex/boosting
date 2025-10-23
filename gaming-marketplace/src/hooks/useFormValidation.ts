// React Hook for Form Validation with Multi-Wallet Support

import { useState, useCallback, useRef, useEffect } from 'react';
import { MultiWalletValidationService, type ValidationResult, type ValidationError } from '../services/multiWalletValidationService';
import { UIErrorHandler, type FormErrorState } from '../utils/errorHandling';
import { useNotifications } from '../contexts/NotificationContext';

export interface FormValidationConfig<T> {
  initialValues: T;
  validators?: Partial<Record<keyof T, (value: any, formData: T) => ValidationResult>>;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceDelay?: number;
}

export interface FormValidationState<T> {
  values: T;
  errors: FormErrorState;
  warnings: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export interface FormValidationActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string | null) => void;
  setErrors: (errors: FormErrorState) => void;
  clearErrors: () => void;
  clearError: (field: keyof T) => void;
  validateField: (field: keyof T) => Promise<ValidationResult>;
  validateForm: () => Promise<ValidationResult>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: T) => void;
  markFieldTouched: (field: keyof T) => void;
  markAllTouched: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  config: FormValidationConfig<T>
): [FormValidationState<T>, FormValidationActions<T>] {
  const {
    initialValues,
    validators = {},
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    debounceDelay = 300
  } = config;

  const { showError, showSuccess } = useNotifications();
  const debounceTimeouts = useRef<Record<string, number>>({});

  // Form state
  const [state, setState] = useState<FormValidationState<T>>({
    values: { ...initialValues },
    errors: {},
    warnings: {},
    touched: {} as Record<keyof T, boolean>,
    isValid: true,
    isSubmitting: false,
    hasSubmitted: false
  });

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Validate a single field
  const validateField = useCallback(async (field: keyof T): Promise<ValidationResult> => {
    const validator = (validators as Record<keyof T, any>)[field];
    if (!validator) {
      return { isValid: true, errors: [] };
    }

    try {
      const result = validator(state.values[field], state.values);
      
      // Update errors and warnings for this field
      setState(prev => {
        const newErrors = { ...prev.errors };
        const newWarnings = { ...prev.warnings };

        if (result.errors.length > 0) {
          newErrors[field as string] = result.errors[0].message;
        } else {
          delete newErrors[field as string];
        }

        if (result.warnings && result.warnings.length > 0) {
          newWarnings[field as string] = result.warnings.map((w: any) => w.message);
        } else {
          delete newWarnings[field as string];
        }

        const isValid = Object.keys(newErrors).length === 0;

        return {
          ...prev,
          errors: newErrors,
          warnings: newWarnings,
          isValid
        };
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation error';
      
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field as string]: errorMessage
        },
        isValid: false
      }));

      return {
        isValid: false,
        errors: [{
          field: field as string,
          code: 'VALIDATION_ERROR',
          message: errorMessage
        }]
      };
    }
  }, [validators, state.values]);

  // Validate entire form
  const validateForm = useCallback(async (): Promise<ValidationResult> => {
    const allErrors: ValidationError[] = [];
    const allWarnings: any[] = [];

    // Validate all fields that have validators
    for (const field of Object.keys(validators)) {
      const result = await validateField(field as keyof T);
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    const isValid = allErrors.length === 0;

    setState(prev => ({
      ...prev,
      isValid
    }));

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings
    };
  }, [validators, validateField]);

  // Debounced field validation
  const debouncedValidateField = useCallback((field: keyof T) => {
    const fieldKey = field as string;
    
    // Clear existing timeout
    if (debounceTimeouts.current[fieldKey]) {
      clearTimeout(debounceTimeouts.current[fieldKey]);
    }

    // Set new timeout
    debounceTimeouts.current[fieldKey] = setTimeout(() => {
      validateField(field);
    }, debounceDelay) as unknown as number;
  }, [validateField, debounceDelay]);

  // Set single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = {
        ...prev.values,
        [field]: value
      };

      return {
        ...prev,
        values: newValues
      };
    });

    // Validate on change if enabled
    if (validateOnChange && (validators as Record<keyof T, any>)[field]) {
      debouncedValidateField(field);
    }
  }, [validateOnChange, validators, debouncedValidateField]);

  // Set multiple field values
  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        ...values
      }
    }));

    // Validate changed fields if enabled
    if (validateOnChange) {
      Object.keys(values).forEach(field => {
        if ((validators as Record<keyof T, any>)[field as keyof T]) {
          debouncedValidateField(field as keyof T);
        }
      });
    }
  }, [validateOnChange, validators, debouncedValidateField]);

  // Set field error
  const setError = useCallback((field: keyof T, error: string | null) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      
      if (error) {
        newErrors[field as string] = error;
      } else {
        delete newErrors[field as string];
      }

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  // Set multiple errors
  const setErrors = useCallback((errors: FormErrorState) => {
    setState(prev => ({
      ...prev,
      errors: { ...errors },
      isValid: Object.keys(errors).length === 0
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
      warnings: {},
      isValid: true
    }));
  }, []);

  // Clear specific field error
  const clearError = useCallback((field: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      const newWarnings = { ...prev.warnings };
      
      delete newErrors[field as string];
      delete newWarnings[field as string];

      return {
        ...prev,
        errors: newErrors,
        warnings: newWarnings,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  // Mark field as touched
  const markFieldTouched = useCallback((field: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: true
      }
    }));

    // Validate on blur if enabled
    if (validateOnBlur && (validators as Record<keyof T, any>)[field]) {
      validateField(field);
    }
  }, [validateOnBlur, validators, validateField]);

  // Mark all fields as touched
  const markAllTouched = useCallback(() => {
    setState(prev => {
      const touched: Record<string, boolean> = {};
      Object.keys(prev.values).forEach(key => {
        touched[key] = true;
      });

      return {
        ...prev,
        touched
      };
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      hasSubmitted: true
    }));

    try {
      // Mark all fields as touched
      markAllTouched();

      // Validate entire form
      const validationResult = await validateForm();

      if (!validationResult.isValid) {
        // Show validation errors
        const errorMessage = UIErrorHandler.formatValidationErrors(validationResult.errors);
        showError('Validation Error', errorMessage);
        
        setState(prev => ({
          ...prev,
          isSubmitting: false
        }));
        return;
      }

      // Call onSubmit if provided
      if (onSubmit) {
        await onSubmit(state.values);
        showSuccess('Success', 'Form submitted successfully');
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false
      }));

    } catch (error) {
      const appError = UIErrorHandler.handleServiceError(error, {
        context: 'form_submission',
        logError: true
      });

      showError('Submission Error', UIErrorHandler.getUserFriendlyMessage(appError));

      setState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    }
  }, [state.values, onSubmit, validateForm, markAllTouched, showError, showSuccess]);

  // Reset form
  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValues;
    
    setState({
      values: { ...resetValues },
      errors: {},
      warnings: {},
      touched: {} as Record<keyof T, boolean>,
      isValid: true,
      isSubmitting: false,
      hasSubmitted: false
    });

    // Clear debounce timeouts
    Object.values(debounceTimeouts.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    debounceTimeouts.current = {};
  }, [initialValues]);

  const formState: FormValidationState<T> = state;
  const formActions: FormValidationActions<T> = {
    setValue,
    setValues,
    setError,
    setErrors,
    clearErrors,
    clearError,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    markFieldTouched,
    markAllTouched
  };

  return [formState, formActions];
}

// Specialized hooks for common multi-wallet forms

export function useWalletCreationForm() {
  return useFormValidation({
    initialValues: {
      realmId: ''
    },
    validators: {
      realmId: (value) => {
        if (!value || value.trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'realmId',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Please select a realm'
            }]
          };
        }
        return { isValid: true, errors: [] };
      }
    },
    validateOnChange: true,
    validateOnBlur: true
  });
}

export function useGoldDepositForm() {
  return useFormValidation({
    initialValues: {
      userId: '',
      realmId: '',
      amount: ''
    },
    validators: {
      userId: (value) => {
        if (!value || value.trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'userId',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Please select a user'
            }]
          };
        }
        return { isValid: true, errors: [] };
      },
      realmId: (value) => {
        if (!value || value.trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'realmId',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Please select a realm'
            }]
          };
        }
        return { isValid: true, errors: [] };
      },
      amount: (value) => {
        if (!value || value.trim().length === 0) {
          return {
            isValid: false,
            errors: [{
              field: 'amount',
              code: 'REQUIRED_FIELD_MISSING',
              message: 'Amount is required'
            }]
          };
        }

        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) {
          return {
            isValid: false,
            errors: [{
              field: 'amount',
              code: 'INVALID_INPUT',
              message: 'Amount must be a positive number'
            }]
          };
        }

        if (amount > 100000) {
          return {
            isValid: true,
            errors: [],
            warnings: [{
              field: 'amount',
              message: 'Large deposit amount. Please verify this is correct.'
            }]
          };
        }

        return { isValid: true, errors: [] };
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
    debounceDelay: 500
  });
}

export function useGameCreationForm() {
  return useFormValidation({
    initialValues: {
      name: '',
      slug: '',
      icon: ''
    },
    validators: {
      name: (value) => MultiWalletValidationService.validateGameCreation(value, 'temp-slug').errors.filter(e => e.field === 'name').length === 0 
        ? { isValid: true, errors: [] }
        : { 
            isValid: false, 
            errors: MultiWalletValidationService.validateGameCreation(value, 'temp-slug').errors.filter(e => e.field === 'name')
          },
      slug: (value, formData) => MultiWalletValidationService.validateGameCreation(formData.name || 'temp-name', value).errors.filter(e => e.field === 'slug').length === 0
        ? { isValid: true, errors: [] }
        : { 
            isValid: false, 
            errors: MultiWalletValidationService.validateGameCreation(formData.name || 'temp-name', value).errors.filter(e => e.field === 'slug')
          }
    },
    validateOnChange: true,
    validateOnBlur: true,
    debounceDelay: 300
  });
}

export function useConversionFeeForm() {
  return useFormValidation({
    initialValues: {
      usdFee: 5.0,
      tomanFee: 3.0
    },
    validators: {
      usdFee: (value) => {
        const result = MultiWalletValidationService.validateConversionFeeConfig(value, 3.0);
        return {
          isValid: result.errors.filter(e => e.field === 'usdFee').length === 0,
          errors: result.errors.filter(e => e.field === 'usdFee'),
          warnings: result.warnings?.filter(w => w.field === 'usdFee')
        };
      },
      tomanFee: (value, formData) => {
        const result = MultiWalletValidationService.validateConversionFeeConfig(formData.usdFee || 5.0, value);
        return {
          isValid: result.errors.filter(e => e.field === 'tomanFee').length === 0,
          errors: result.errors.filter(e => e.field === 'tomanFee'),
          warnings: result.warnings?.filter(w => w.field === 'tomanFee')
        };
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
    debounceDelay: 500
  });
}