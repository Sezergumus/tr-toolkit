import { describe, it, expect } from 'vitest';
import {
  slugify,
  replaceTurkishChars,
  turkishToLower,
  turkishToUpper,
} from '../src/slugify';

describe('slugify', () => {
  it('should handle standard Turkish strings with all special characters', () => {
    const input = 'Şemsi Paşa Pasajında Sesi Boğuk Çocuk';
    expect(slugify(input)).toBe('semsi-pasa-pasajinda-sesi-boguk-cocuk');
  });

  it('should correctly handle capital I and dotted İ', () => {
    expect(slugify('Iğdır ve İstanbul')).toBe('igdir-ve-istanbul');
    expect(slugify('ISPARTA İZMİR')).toBe('isparta-izmir');
  });

  it('should correctly handle circumflex accents â, î, û', () => {
    expect(slugify('Kâzım ile Hâkîm')).toBe('kazim-ile-hakim');
    expect(slugify('Sükût ve Rüyâ')).toBe('sukut-ve-ruya');
  });

  it('should support custom separator', () => {
    expect(slugify('Hızlı ve Öfkeli', { separator: '_' })).toBe('hizli_ve_ofkeli');
    expect(slugify('Hızlı ve Öfkeli', { separator: '.' })).toBe('hizli.ve.ofkeli');
  });

  it('should handle strict mode removing punctuation and symbols', () => {
    expect(slugify('İstanbul, 34! @Kadıköy #Moda?', { strict: true })).toBe(
      'istanbul-34-kadikoy-moda'
    );
  });

  it('should support custom remove regex', () => {
    expect(slugify('Fiyat: 100$!', { remove: /[$!:]/g })).toBe('fiyat-100');
  });

  it('should respect lowercase: false option', () => {
    expect(slugify('Şemsi Paşa', { lowercase: false })).toBe('Semsi-Pasa');
  });

  it('should respect trim: false option', () => {
    expect(slugify('---test---', { trim: false })).toBe('-test-');
  });

  it('should collapse multiple spaces and hyphens', () => {
    expect(slugify('  Çok    boşluklu   metin  -- test -- ')).toBe('cok-bosluklu-metin-test');
  });

  it('should handle empty or invalid inputs gracefully', () => {
    expect(slugify('')).toBe('');
    // @ts-expect-error testing invalid input
    expect(slugify(null)).toBe('');
    // @ts-expect-error testing invalid input
    expect(slugify(undefined)).toBe('');
    // @ts-expect-error testing invalid input
    expect(slugify(123)).toBe('');
  });
});

describe('replaceTurkishChars', () => {
  it('should replace characters preserving case', () => {
    expect(replaceTurkishChars('ÖçŞğÜı')).toBe('OcSgUi');
    expect(replaceTurkishChars('öçşğüı')).toBe('ocsgui');
  });

  it('should support lowercase flag', () => {
    expect(replaceTurkishChars('ÖÇŞĞÜI', true)).toBe('ocsgui');
  });

  it('should handle empty string', () => {
    expect(replaceTurkishChars('')).toBe('');
  });
});

describe('turkishToLower and turkishToUpper', () => {
  it('should convert Turkish text to lower case properly', () => {
    expect(turkishToLower('İSTANBUL')).toBe('istanbul');
    expect(turkishToLower('ISPARTA')).toBe('ısparta');
    expect(turkishToLower('')).toBe('');
  });

  it('should convert Turkish text to upper case properly', () => {
    expect(turkishToUpper('istanbul')).toBe('İSTANBUL');
    expect(turkishToUpper('ısparta')).toBe('ISPARTA');
    expect(turkishToUpper('')).toBe('');
  });
});
