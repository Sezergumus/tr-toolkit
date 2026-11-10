import { describe, it, expect } from 'vitest';
import { formatCurrency, parseCurrency } from '../src/currency';

describe('formatCurrency', () => {
  it('should format numbers according to Turkish conventions by default', () => {
    expect(formatCurrency(1250.5)).toBe('1.250,50 ₺');
    expect(formatCurrency(0)).toBe('0,00 ₺');
    expect(formatCurrency(1000000)).toBe('1.000.000,00 ₺');
  });

  it('should support symbol positioning and spacing', () => {
    expect(formatCurrency(1250.5, { position: 'before', space: false })).toBe(
      '₺1.250,50'
    );
    expect(formatCurrency(1250.5, { position: 'before', space: true })).toBe(
      '₺ 1.250,50'
    );
    expect(formatCurrency(1250.5, { position: 'after', space: false })).toBe(
      '1.250,50₺'
    );
  });

  it('should support custom currency symbol', () => {
    expect(formatCurrency(1250.5, { symbol: 'TRY' })).toBe('1.250,50 TRY');
    expect(formatCurrency(1250.5, { symbol: 'USD', position: 'before' })).toBe(
      'USD 1.250,50'
    );
    expect(formatCurrency(1250.5, { symbol: '' })).toBe('1.250,50');
  });

  it('should format custom decimal counts', () => {
    expect(formatCurrency(1250, { decimals: 0 })).toBe('1.250 ₺');
    expect(formatCurrency(1250.555, { decimals: 3 })).toBe('1.250,555 ₺');
  });

  it('should format negative numbers properly', () => {
    expect(formatCurrency(-1250.5)).toBe('-1.250,50 ₺');
    expect(formatCurrency(-1250.5, { position: 'before', space: false })).toBe(
      '-₺1.250,50'
    );
  });

  it('should format compact Turkish notation', () => {
    expect(formatCurrency(1200000, { compact: true })).toBe('1,2M ₺');
    expect(formatCurrency(1500, { compact: true })).toBe('1,5B ₺');
    expect(formatCurrency(2500000000, { compact: true })).toBe('2,5Mr ₺');
    expect(formatCurrency(1000000000000, { compact: true })).toBe('1T ₺');
    expect(formatCurrency(999, { compact: true })).toBe('999,00 ₺');
    expect(formatCurrency(-1200000, { compact: true })).toBe('-1,2M ₺');
  });

  it('should handle edge cases gracefully', () => {
    // @ts-expect-error test invalid args
    expect(formatCurrency(null)).toBe('');
    // @ts-expect-error test invalid args
    expect(formatCurrency(undefined)).toBe('');
    expect(formatCurrency(NaN)).toBe('');
  });
});

describe('parseCurrency', () => {
  it('should parse Turkish formatted currency strings into numbers', () => {
    expect(parseCurrency('1.250,50 ₺')).toBe(1250.5);
    expect(parseCurrency('₺1.250,50')).toBe(1250.5);
    expect(parseCurrency('1.000.000,25 TL')).toBe(1000000.25);
    expect(parseCurrency('-1.250,50 ₺')).toBe(-1250.5);
  });

  it('should handle invalid string inputs', () => {
    expect(parseCurrency('')).toBeNaN();
    // @ts-expect-error test invalid args
    expect(parseCurrency(null)).toBeNaN();
    // @ts-expect-error test invalid args
    expect(parseCurrency(undefined)).toBeNaN();
    expect(parseCurrency('abc')).toBeNaN();
  });
});
