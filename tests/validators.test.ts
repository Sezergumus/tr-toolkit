import { describe, it, expect } from 'vitest';
import {
  validateTCKN,
  maskTCKN,
  validateVKN,
  maskVKN,
  validateIBAN,
  formatIBAN,
  maskIBAN,
  validatePlate,
  formatPlate,
  getPlateCity,
  validatePhone,
  formatPhone,
  maskPhone,
} from '../src/validators';

describe('TCKN Validator & Masker', () => {
  it('should validate known valid TCKN numbers', () => {
    expect(validateTCKN('10000000146')).toBe(true);
    expect(validateTCKN(10000000146)).toBe(true);
    expect(validateTCKN('53654128958')).toBe(true);
  });

  it('should invalidate incorrect TCKN numbers', () => {
    // Starts with 0
    expect(validateTCKN('00000000146')).toBe(false);
    expect(validateTCKN('01234567890')).toBe(false);
    // Invalid length
    expect(validateTCKN('1000000014')).toBe(false);
    expect(validateTCKN('100000001460')).toBe(false);
    // Non-numeric
    expect(validateTCKN('1000000014a')).toBe(false);
    expect(validateTCKN('abcdefghijk')).toBe(false);
    // Checksum mismatch
    expect(validateTCKN('10000000147')).toBe(false);
    expect(validateTCKN('10000000156')).toBe(false);
    // Null, undefined, empty
    // @ts-expect-error test invalid args
    expect(validateTCKN(null)).toBe(false);
    // @ts-expect-error test invalid args
    expect(validateTCKN(undefined)).toBe(false);
    expect(validateTCKN('')).toBe(false);
  });

  it('should correctly mask TCKN', () => {
    expect(maskTCKN('10000000146')).toBe('10*******46');
    expect(maskTCKN(10000000146, '•')).toBe('10•••••••46');
    expect(maskTCKN('123')).toBe('');
    // @ts-expect-error test invalid args
    expect(maskTCKN(null)).toBe('');
  });
});

describe('VKN Validator & Masker', () => {
  it('should validate valid VKN', () => {
    expect(validateVKN('1234567890')).toBe(true);
    expect(validateVKN(1234567890)).toBe(true);
    expect(validateVKN('0000000001')).toBe(true);
  });

  it('should invalidate incorrect VKN', () => {
    expect(validateVKN('1234567891')).toBe(false);
    expect(validateVKN('123')).toBe(false);
    expect(validateVKN('12345678901')).toBe(false);
    expect(validateVKN('123456789a')).toBe(false);
    // @ts-expect-error test invalid args
    expect(validateVKN(null)).toBe(false);
    // @ts-expect-error test invalid args
    expect(validateVKN(undefined)).toBe(false);
  });

  it('should correctly mask VKN', () => {
    expect(maskVKN('1234567890')).toBe('12******90');
    expect(maskVKN('1234567890', 'X')).toBe('12XXXXXX90');
    expect(maskVKN('123')).toBe('');
    // @ts-expect-error test invalid args
    expect(maskVKN(null)).toBe('');
  });
});

describe('IBAN Validator, Formatter & Masker', () => {
  // Let's create a known valid TR IBAN:
  // Base: TR00 1234 5000 0000 0000 0000 00
  // Compute check digits:
  // Account = "1234500000000000000000"
  // Rearranged = Account + "292700"
  // Remainder = BigInt(Rearranged) % 97n
  // checkDigits = (98n - Remainder).toString().padStart(2, '0')
  const accountPart = '1234500000000000000000';
  const testNum = BigInt(accountPart + '292700');
  const rem = testNum % 97n;
  const check = String(98n - rem).padStart(2, '0');
  const validTrIban = `TR${check}${accountPart}`;

  it('should validate valid TR IBAN', () => {
    expect(validateIBAN(validTrIban)).toBe(true);
    expect(validateIBAN(formatIBAN(validTrIban))).toBe(true);
    expect(validateIBAN(validTrIban.toLowerCase())).toBe(true);
  });

  it('should invalidate invalid IBANs', () => {
    expect(validateIBAN('TR001234500000000000000000')).toBe(false);
    expect(validateIBAN('US330006100519786457841326')).toBe(false); // Not TR
    expect(validateIBAN('TR123')).toBe(false); // Too short
    expect(validateIBAN('TR330006100519786457841326000')).toBe(false); // Too long
    expect(validateIBAN('TR33000610051978645784132A')).toBe(false); // Non-digit in body
    // @ts-expect-error test invalid args
    expect(validateIBAN(null)).toBe(false);
  });

  it('should format IBAN with grouping', () => {
    const formatted = formatIBAN(validTrIban);
    expect(formatted).toMatch(/^TR\d{2} \d{4} \d{4} \d{4} \d{4} \d{4} \d{2}$/);
    expect(formatIBAN('')).toBe('');
    // @ts-expect-error test invalid args
    expect(formatIBAN(null)).toBe('');
  });

  it('should mask IBAN', () => {
    const masked = maskIBAN(validTrIban);
    expect(masked.startsWith(`TR${check} 1234 **** **** **** ****`)).toBe(true);
    expect(maskIBAN('')).toBe('');
    expect(maskIBAN('123')).toBe('123');
    // Test shorter parts
    expect(maskIBAN('TR123456')).toBe('TR12 3456');
    // Test custom mask char
    expect(maskIBAN(validTrIban, '#')).toContain('####');
  });
});

describe('Plate Validator, Formatter & City lookup', () => {
  it('should validate valid Turkish license plates', () => {
    expect(validatePlate('34 ABC 123')).toBe(true);
    expect(validatePlate('34ABC123')).toBe(true);
    expect(validatePlate('06 A 1234')).toBe(true);
    expect(validatePlate('06 A 12345')).toBe(true);
    expect(validatePlate('35 AB 1234')).toBe(true);
    expect(validatePlate('16 ABC 12')).toBe(true);
    expect(validatePlate('01 AA 123')).toBe(true);
    expect(validatePlate('81 ZZ 999')).toBe(true);
  });

  it('should invalidate non-Turkish or incorrect plates', () => {
    expect(validatePlate('00 ABC 123')).toBe(false); // Province 00 invalid
    expect(validatePlate('82 ABC 123')).toBe(false); // Province 82 invalid
    expect(validatePlate('34 ÇŞ 123')).toBe(false); // Special Turkish chars not on plates
    expect(validatePlate('34 ABCD 123')).toBe(false); // 4 letters invalid
    expect(validatePlate('34 A 12')).toBe(false); // 1 letter, 2 digits invalid
    expect(validatePlate('')).toBe(false);
    // @ts-expect-error test invalid args
    expect(validatePlate(null)).toBe(false);
  });

  it('should format plate correctly', () => {
    expect(formatPlate('34abc123')).toBe('34 ABC 123');
    expect(formatPlate('06a1234')).toBe('06 A 1234');
    expect(formatPlate('34tb1234')).toBe('34 TB 1234');
    expect(formatPlate('01b12345')).toBe('01 B 12345');
    expect(formatPlate('34 A 12')).toBe('34A12');
    expect(formatPlate('')).toBe('');
    // @ts-expect-error test invalid args
    expect(formatPlate(null)).toBe('');
  });

  it('should return correct province city', () => {
    expect(getPlateCity('34 ABC 123')).toBe('İstanbul');
    expect(getPlateCity('06 A 1234')).toBe('Ankara');
    expect(getPlateCity('35')).toBe('İzmir');
    expect(getPlateCity('01')).toBe('Adana');
    expect(getPlateCity('81')).toBe('Düzce');
    expect(getPlateCity('99')).toBeUndefined();
    expect(getPlateCity('')).toBeUndefined();
    // @ts-expect-error test invalid args
    expect(getPlateCity(null)).toBeUndefined();
  });
});

describe('Phone Validator, Formatter & Masker', () => {
  it('should validate Turkish phone numbers in various formats', () => {
    expect(validatePhone('0532 123 45 67')).toBe(true);
    expect(validatePhone('+90 532 123 45 67')).toBe(true);
    expect(validatePhone('5321234567')).toBe(true);
    expect(validatePhone('00905321234567')).toBe(true);
    expect(validatePhone('0212 123 45 67')).toBe(true); // Landline
    expect(validatePhone('0850 123 45 67')).toBe(true); // 850
  });

  it('should support mobileOnly option', () => {
    expect(validatePhone('0532 123 45 67', { mobileOnly: true })).toBe(true);
    expect(validatePhone('0212 123 45 67', { mobileOnly: true })).toBe(false);
    expect(validatePhone('0850 123 45 67', { mobileOnly: true })).toBe(false);
  });

  it('should invalidate incorrect numbers', () => {
    expect(validatePhone('12345')).toBe(false);
    expect(validatePhone('0132 123 45 67')).toBe(false); // Invalid prefix 1
    expect(validatePhone('+1 555 123 45 67')).toBe(false); // Non-TR
    expect(validatePhone('')).toBe(false);
    // @ts-expect-error test invalid args
    expect(validatePhone(null)).toBe(false);
  });

  it('should format phone numbers', () => {
    expect(formatPhone('5321234567')).toBe('0532 123 45 67');
    expect(formatPhone('05321234567', 'national')).toBe('0532 123 45 67');
    expect(formatPhone('5321234567', 'international')).toBe('+90 532 123 45 67');
    expect(formatPhone('5321234567', 'e164')).toBe('+905321234567');
    expect(formatPhone('invalid')).toBe('invalid');
    expect(formatPhone('')).toBe('');
    // @ts-expect-error test invalid args
    expect(formatPhone(null)).toBe('');
  });

  it('should mask phone numbers', () => {
    expect(maskPhone('0532 123 45 67')).toBe('0532 *** ** 67');
    expect(maskPhone('5321234567', '•')).toBe('0532 ••• •• 67');
    expect(maskPhone('invalid')).toBe('invalid');
    expect(maskPhone('')).toBe('');
    // @ts-expect-error test invalid args
    expect(maskPhone(null)).toBe('');
  });
});
