// Conversion Fee Service for managing suspended gold conversion fees

import type { ConversionFeeConfig, MultiWalletErrorType } from '../types';
import { StorageService } from './storage';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';

// Conversion Fee Error Class
export class ConversionFeeError extends Error {
  public type: MultiWalletErrorType;
  public details?: Record<string, any>;
  
  constructor(
    type: MultiWalletErrorType,
    message: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConversionFeeError';
    this.type = type;
    this.details = details;
  }
}

export class ConversionFeeService {
  // Default conversion fee configuration
  private static readonly DEFAULT_CONFIG: ConversionFeeConfig = {
    id: 'default',
    suspendedGoldToUsd: 5.0, // 5% fee for USD conversion
    suspendedGoldToToman: 3.0, // 3% fee for Toman conversion
    isActive: true,
    updatedBy: 'system',
    updatedAt: new Date()
  };
  
  /**
   * Get current conversion fee configuration
   */
  static getConversionFeeConfig(): ConversionFeeConfig {
    const config = StorageService.getItem<ConversionFeeConfig>(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG);
    
    if (!config) {
      // Create and save default config
      this.saveConversionFeeConfig(this.DEFAULT_CONFIG);
      return { ...this.DEFAULT_CONFIG };
    }
    
    // Ensure dates are properly parsed
    return {
      ...config,
      updatedAt: new Date(config.updatedAt)
    };
  }
  
  /**
   * Update conversion fee configuration
   */
  static async updateConversionFees(
    usdFee: number, 
    tomanFee: number, 
    adminId: string
  ): Promise<ConversionFeeConfig> {
    // Validate fee percentages
    if (usdFee < 0 || usdFee > 100) {
      throw new ConversionFeeError(
        'CONVERSION_FEE_ERROR',
        'USD conversion fee must be between 0% and 100%',
        { usdFee }
      );
    }
    
    if (tomanFee < 0 || tomanFee > 100) {
      throw new ConversionFeeError(
        'CONVERSION_FEE_ERROR',
        'Toman conversion fee must be between 0% and 100%',
        { tomanFee }
      );
    }
    
    const config: ConversionFeeConfig = {
      id: 'default',
      suspendedGoldToUsd: usdFee,
      suspendedGoldToToman: tomanFee,
      isActive: true,
      updatedBy: adminId,
      updatedAt: new Date()
    };
    
    this.saveConversionFeeConfig(config);
    return config;
  }
  
  /**
   * Calculate conversion fee for suspended gold
   */
  static calculateConversionFee(amount: number, targetCurrency: 'usd' | 'toman'): number {
    if (amount <= 0) {
      return 0;
    }
    
    const config = this.getConversionFeeConfig();
    
    if (!config.isActive) {
      return 0;
    }
    
    const feePercentage = targetCurrency === 'usd' 
      ? config.suspendedGoldToUsd 
      : config.suspendedGoldToToman;
    
    return (amount * feePercentage) / 100;
  }
  
  /**
   * Apply conversion fee and return net amount and fee
   */
  static applyConversionFee(
    amount: number, 
    targetCurrency: 'usd' | 'toman'
  ): { convertedAmount: number; feeAmount: number; netAmount: number } {
    if (amount <= 0) {
      return { convertedAmount: 0, feeAmount: 0, netAmount: 0 };
    }
    
    const feeAmount = this.calculateConversionFee(amount, targetCurrency);
    const netAmount = amount - feeAmount;
    
    return {
      convertedAmount: amount,
      feeAmount,
      netAmount: Math.max(0, netAmount) // Ensure non-negative
    };
  }
  
  /**
   * Get conversion fee percentage for a currency
   */
  static getConversionFeePercentage(targetCurrency: 'usd' | 'toman'): number {
    const config = this.getConversionFeeConfig();
    
    return targetCurrency === 'usd' 
      ? config.suspendedGoldToUsd 
      : config.suspendedGoldToToman;
  }
  
  /**
   * Check if conversion fees are active
   */
  static areConversionFeesActive(): boolean {
    const config = this.getConversionFeeConfig();
    return config.isActive;
  }
  
  /**
   * Disable conversion fees (admin function)
   */
  static async disableConversionFees(adminId: string): Promise<ConversionFeeConfig> {
    const config = this.getConversionFeeConfig();
    config.isActive = false;
    config.updatedBy = adminId;
    config.updatedAt = new Date();
    
    this.saveConversionFeeConfig(config);
    return config;
  }
  
  /**
   * Enable conversion fees (admin function)
   */
  static async enableConversionFees(adminId: string): Promise<ConversionFeeConfig> {
    const config = this.getConversionFeeConfig();
    config.isActive = true;
    config.updatedBy = adminId;
    config.updatedAt = new Date();
    
    this.saveConversionFeeConfig(config);
    return config;
  }
  
  /**
   * Reset to default configuration
   */
  static async resetToDefaults(adminId: string): Promise<ConversionFeeConfig> {
    const config: ConversionFeeConfig = {
      ...this.DEFAULT_CONFIG,
      updatedBy: adminId,
      updatedAt: new Date()
    };
    
    this.saveConversionFeeConfig(config);
    return config;
  }
  
  /**
   * Get conversion fee history (for audit purposes)
   */
  static getConversionFeeHistory(): ConversionFeeConfig[] {
    const history = StorageService.getItem<ConversionFeeConfig[]>(`${MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG}_history`) || [];
    
    return history.map(config => ({
      ...config,
      updatedAt: new Date(config.updatedAt)
    })).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
  
  /**
   * Save conversion fee configuration
   */
  private static saveConversionFeeConfig(config: ConversionFeeConfig): void {
    // Save current config
    StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG, config);
    
    // Save to history for audit trail
    const history = this.getConversionFeeHistory();
    history.unshift(config);
    
    // Keep only last 50 configurations
    if (history.length > 50) {
      history.splice(50);
    }
    
    StorageService.setItem(`${MULTI_WALLET_STORAGE_KEYS.CONVERSION_FEE_CONFIG}_history`, history);
  }
  
  /**
   * Validate conversion fee configuration
   */
  static validateConversionFeeConfig(config: Partial<ConversionFeeConfig>): string[] {
    const errors: string[] = [];
    
    if (config.suspendedGoldToUsd !== undefined) {
      if (typeof config.suspendedGoldToUsd !== 'number' || config.suspendedGoldToUsd < 0 || config.suspendedGoldToUsd > 100) {
        errors.push('USD conversion fee must be a number between 0 and 100');
      }
    }
    
    if (config.suspendedGoldToToman !== undefined) {
      if (typeof config.suspendedGoldToToman !== 'number' || config.suspendedGoldToToman < 0 || config.suspendedGoldToToman > 100) {
        errors.push('Toman conversion fee must be a number between 0 and 100');
      }
    }
    
    return errors;
  }
}