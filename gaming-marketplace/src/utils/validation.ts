// Data validation utilities for the Gaming Marketplace

import type { User, Service, Order, Team, ShopProduct, Transaction } from '../types';

// Simple validation functions for tests
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, contains uppercase, lowercase, number, and special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateServiceForm = (service: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!service.title || service.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!service.description || service.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!service.gameId) {
    errors.push('Game selection is required');
  }

  if (!service.serviceTypeId) {
    errors.push('Service type is required');
  }

  if (!service.prices) {
    errors.push('Pricing information is required');
  } else {
    if (!service.prices.gold || service.prices.gold <= 0) {
      errors.push('Gold price must be greater than 0');
    }
    if (!service.prices.usd || service.prices.usd <= 0) {
      errors.push('USD price must be greater than 0');
    }
    if (!service.prices.toman || service.prices.toman <= 0) {
      errors.push('Toman price must be greater than 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEvidenceUpload = (file: File, notes: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    errors.push('Only PNG, JPG, and JPEG files are allowed');
  }

  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }

  if (!notes || notes.trim().length === 0) {
    errors.push('Notes are required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateWalletAmount = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount > 0;
};

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// User validation
export const validateUser = (user: Partial<User>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!user.username || user.username.trim().length < 2) {
    errors.push({
      field: 'username',
      message: 'Username must be at least 2 characters long',
      code: 'USERNAME_TOO_SHORT'
    });
  }

  if (!user.email || !isValidEmail(user.email)) {
    errors.push({
      field: 'email',
      message: 'Valid email address is required',
      code: 'INVALID_EMAIL'
    });
  }

  if (!user.discordId || user.discordId.length !== 18) {
    errors.push({
      field: 'discordId',
      message: 'Valid Discord ID is required',
      code: 'INVALID_DISCORD_ID'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Service validation
export const validateService = (service: Partial<Service>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!service.title || service.title.trim().length < 5) {
    errors.push({
      field: 'title',
      message: 'Service title must be at least 5 characters long',
      code: 'TITLE_TOO_SHORT'
    });
  }

  if (!service.description || service.description.trim().length < 20) {
    errors.push({
      field: 'description',
      message: 'Service description must be at least 20 characters long',
      code: 'DESCRIPTION_TOO_SHORT'
    });
  }

  if (!service.gameId) {
    errors.push({
      field: 'gameId',
      message: 'Game selection is required',
      code: 'GAME_REQUIRED'
    });
  }

  if (!service.serviceTypeId) {
    errors.push({
      field: 'serviceTypeId',
      message: 'Service type selection is required',
      code: 'SERVICE_TYPE_REQUIRED'
    });
  }

  // Validate prices
  if (!service.prices) {
    errors.push({
      field: 'prices',
      message: 'Pricing information is required',
      code: 'PRICES_REQUIRED'
    });
  } else {
    if (!service.prices.gold || service.prices.gold <= 0) {
      errors.push({
        field: 'prices.gold',
        message: 'Gold price must be greater than 0',
        code: 'INVALID_GOLD_PRICE'
      });
    }

    if (!service.prices.usd || service.prices.usd <= 0) {
      errors.push({
        field: 'prices.usd',
        message: 'USD price must be greater than 0',
        code: 'INVALID_USD_PRICE'
      });
    }

    if (!service.prices.toman || service.prices.toman <= 0) {
      errors.push({
        field: 'prices.toman',
        message: 'Toman price must be greater than 0',
        code: 'INVALID_TOMAN_PRICE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Order validation
export const validateOrder = (order: Partial<Order>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!order.serviceId) {
    errors.push({
      field: 'serviceId',
      message: 'Service ID is required',
      code: 'SERVICE_ID_REQUIRED'
    });
  }

  if (!order.buyerId) {
    errors.push({
      field: 'buyerId',
      message: 'Buyer ID is required',
      code: 'BUYER_ID_REQUIRED'
    });
  }

  if (!order.earningsRecipientId) {
    errors.push({
      field: 'earningsRecipientId',
      message: 'Earnings recipient ID is required',
      code: 'EARNINGS_RECIPIENT_REQUIRED'
    });
  }

  if (!order.pricePaid || order.pricePaid <= 0) {
    errors.push({
      field: 'pricePaid',
      message: 'Price paid must be greater than 0',
      code: 'INVALID_PRICE_PAID'
    });
  }

  if (!order.currency || !['gold', 'usd', 'toman'].includes(order.currency)) {
    errors.push({
      field: 'currency',
      message: 'Valid currency is required (gold, usd, or toman)',
      code: 'INVALID_CURRENCY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Team validation
export const validateTeam = (team: Partial<Team>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!team.name || team.name.trim().length < 3) {
    errors.push({
      field: 'name',
      message: 'Team name must be at least 3 characters long',
      code: 'TEAM_NAME_TOO_SHORT'
    });
  }

  if (!team.description || team.description.trim().length < 10) {
    errors.push({
      field: 'description',
      message: 'Team description must be at least 10 characters long',
      code: 'TEAM_DESCRIPTION_TOO_SHORT'
    });
  }

  if (!team.leaderId) {
    errors.push({
      field: 'leaderId',
      message: 'Team leader ID is required',
      code: 'TEAM_LEADER_REQUIRED'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Transaction validation
export const validateTransaction = (transaction: Partial<Transaction>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!transaction.walletId) {
    errors.push({
      field: 'walletId',
      message: 'Wallet ID is required',
      code: 'WALLET_ID_REQUIRED'
    });
  }

  if (!transaction.type || !['deposit', 'withdrawal', 'conversion', 'purchase', 'refund', 'earning'].includes(transaction.type)) {
    errors.push({
      field: 'type',
      message: 'Valid transaction type is required',
      code: 'INVALID_TRANSACTION_TYPE'
    });
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Transaction amount must be greater than 0',
      code: 'INVALID_AMOUNT'
    });
  }

  if (!transaction.currency || !['gold', 'usd', 'toman'].includes(transaction.currency)) {
    errors.push({
      field: 'currency',
      message: 'Valid currency is required (gold, usd, or toman)',
      code: 'INVALID_CURRENCY'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Shop product validation
export const validateShopProduct = (product: Partial<ShopProduct>): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!product.name || product.name.trim().length < 3) {
    errors.push({
      field: 'name',
      message: 'Product name must be at least 3 characters long',
      code: 'PRODUCT_NAME_TOO_SHORT'
    });
  }

  if (!product.gameId) {
    errors.push({
      field: 'gameId',
      message: 'Game ID is required',
      code: 'GAME_ID_REQUIRED'
    });
  }

  if (!product.durationDays || product.durationDays <= 0) {
    errors.push({
      field: 'durationDays',
      message: 'Duration must be greater than 0 days',
      code: 'INVALID_DURATION'
    });
  }

  // Validate prices
  if (!product.prices) {
    errors.push({
      field: 'prices',
      message: 'Pricing information is required',
      code: 'PRICES_REQUIRED'
    });
  } else {
    if (!product.prices.gold || product.prices.gold <= 0) {
      errors.push({
        field: 'prices.gold',
        message: 'Gold price must be greater than 0',
        code: 'INVALID_GOLD_PRICE'
      });
    }

    if (!product.prices.usd || product.prices.usd <= 0) {
      errors.push({
        field: 'prices.usd',
        message: 'USD price must be greater than 0',
        code: 'INVALID_USD_PRICE'
      });
    }

    if (!product.prices.toman || product.prices.toman <= 0) {
      errors.push({
        field: 'prices.toman',
        message: 'Toman price must be greater than 0',
        code: 'INVALID_TOMAN_PRICE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// File validation for evidence uploads
export const validateEvidenceFile = (file: File): ValidationResult => {
  const errors: ValidationError[] = [];

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    errors.push({
      field: 'file',
      message: 'Only PNG, JPG, and JPEG files are allowed',
      code: 'INVALID_FILE_TYPE'
    });
  }

  if (file.size > maxSize) {
    errors.push({
      field: 'file',
      message: 'File size must be less than 10MB',
      code: 'FILE_TOO_LARGE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Wallet balance validation
export const validateWalletBalance = (
  currentBalance: number,
  requestedAmount: number,
  currency: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (requestedAmount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than 0',
      code: 'INVALID_AMOUNT'
    });
  }

  if (currentBalance < requestedAmount) {
    errors.push({
      field: 'balance',
      message: `Insufficient ${currency.toUpperCase()} balance`,
      code: 'INSUFFICIENT_BALANCE'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generic validation helper
export const validateRequired = (value: unknown, fieldName: string): ValidationError | null => {
  if (value === null || value === undefined || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'FIELD_REQUIRED'
    };
  }
  return null;
};

// String length validation helper
export const validateStringLength = (
  value: string,
  fieldName: string,
  minLength: number,
  maxLength?: number
): ValidationError | null => {
  if (value.trim().length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${minLength} characters long`,
      code: 'STRING_TOO_SHORT'
    };
  }

  if (maxLength && value.trim().length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${maxLength} characters long`,
      code: 'STRING_TOO_LONG'
    };
  }

  return null;
};

// Number range validation helper
export const validateNumberRange = (
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): ValidationError | null => {
  if (min !== undefined && value < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min}`,
      code: 'NUMBER_TOO_SMALL'
    };
  }

  if (max !== undefined && value > max) {
    return {
      field: fieldName,
      message: `${fieldName} must be no more than ${max}`,
      code: 'NUMBER_TOO_LARGE'
    };
  }

  return null;
};