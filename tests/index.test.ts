import { describe, it, expect } from 'vitest';
import * as TrToolkit from '../src/index';

describe('Root module exports', () => {
  it('should export all slugify utilities', () => {
    expect(typeof TrToolkit.slugify).toBe('function');
    expect(typeof TrToolkit.replaceTurkishChars).toBe('function');
    expect(typeof TrToolkit.turkishToLower).toBe('function');
    expect(typeof TrToolkit.turkishToUpper).toBe('function');
  });

  it('should export all validator utilities', () => {
    expect(typeof TrToolkit.validateTCKN).toBe('function');
    expect(typeof TrToolkit.maskTCKN).toBe('function');
    expect(typeof TrToolkit.validateVKN).toBe('function');
    expect(typeof TrToolkit.maskVKN).toBe('function');
    expect(typeof TrToolkit.validateIBAN).toBe('function');
    expect(typeof TrToolkit.formatIBAN).toBe('function');
    expect(typeof TrToolkit.maskIBAN).toBe('function');
    expect(typeof TrToolkit.validatePlate).toBe('function');
    expect(typeof TrToolkit.formatPlate).toBe('function');
    expect(typeof TrToolkit.getPlateCity).toBe('function');
    expect(typeof TrToolkit.TURKISH_PROVINCES).toBe('object');
    expect(typeof TrToolkit.validatePhone).toBe('function');
    expect(typeof TrToolkit.formatPhone).toBe('function');
    expect(typeof TrToolkit.maskPhone).toBe('function');
    expect(typeof TrToolkit.normalizePhone).toBe('function');
  });

  it('should export number-to-words utilities', () => {
    expect(typeof TrToolkit.numberToWords).toBe('function');
  });

  it('should export currency utilities', () => {
    expect(typeof TrToolkit.formatCurrency).toBe('function');
    expect(typeof TrToolkit.parseCurrency).toBe('function');
  });

  it('should export profanity utilities', () => {
    expect(typeof TrToolkit.cleanProfanity).toBe('function');
    expect(typeof TrToolkit.hasProfanity).toBe('function');
    expect(typeof TrToolkit.findProfanities).toBe('function');
    expect(Array.isArray(TrToolkit.DEFAULT_PROFANITY_LIST)).toBe(true);
  });
});
