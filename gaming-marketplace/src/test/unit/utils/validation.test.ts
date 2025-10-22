import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateServiceForm,
  validateEvidenceUpload,
  validateWalletAmount,
} from '@utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MySecure@Pass1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('password')).toBe(false);
    });
  });

  describe('validateServiceForm', () => {
    const validService = {
      title: 'Mythic+ Boost',
      description: 'Professional boost service',
      gameId: 'wow',
      serviceTypeId: 'mythic-plus',
      prices: { gold: 100000, usd: 50, toman: 2000000 },
    };

    it('should validate correct service data', () => {
      const result = validateServiceForm(validService);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject service with missing required fields', () => {
      const invalidService = { ...validService, title: '' };
      const result = validateServiceForm(invalidService);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject service with invalid prices', () => {
      const invalidService = { ...validService, prices: { gold: -100, usd: 0, toman: 0 } };
      const result = validateServiceForm(invalidService);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('price'))).toBe(true);
    });
  });

  describe('validateEvidenceUpload', () => {
    it('should validate correct image files', () => {
      const validFile = new File([''], 'screenshot.png', { type: 'image/png' });
      Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB
      
      const result = validateEvidenceUpload(validFile, 'Completed the boost successfully');
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'large.png', { type: 'image/png' });
      Object.defineProperty(largeFile, 'size', { value: 15 * 1024 * 1024 }); // 15MB
      
      const result = validateEvidenceUpload(largeFile, 'Notes');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File([''], 'document.pdf', { type: 'application/pdf' });
      
      const result = validateEvidenceUpload(invalidFile, 'Notes');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Only PNG, JPG, and JPEG files are allowed');
    });
  });

  describe('validateWalletAmount', () => {
    it('should validate positive amounts', () => {
      expect(validateWalletAmount(100)).toBe(true);
      expect(validateWalletAmount(0.01)).toBe(true);
    });

    it('should reject negative or zero amounts', () => {
      expect(validateWalletAmount(0)).toBe(false);
      expect(validateWalletAmount(-10)).toBe(false);
    });

    it('should reject non-numeric values', () => {
      expect(validateWalletAmount(NaN)).toBe(false);
      expect(validateWalletAmount(Infinity)).toBe(false);
    });
  });
});