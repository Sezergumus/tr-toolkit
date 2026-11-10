import { describe, it, expect } from 'vitest';
import { numberToWords } from '../src/number-to-words';

describe('numberToWords', () => {
  it('should convert single digits and zero', () => {
    expect(numberToWords(0)).toBe('sıfır');
    expect(numberToWords(1)).toBe('bir');
    expect(numberToWords(5)).toBe('beş');
    expect(numberToWords(9)).toBe('dokuz');
  });

  it('should convert tens and two-digit numbers', () => {
    expect(numberToWords(10)).toBe('on');
    expect(numberToWords(17)).toBe('on yedi');
    expect(numberToWords(20)).toBe('yirmi');
    expect(numberToWords(42)).toBe('kırk iki');
    expect(numberToWords(99)).toBe('doksan dokuz');
  });

  it('should convert hundreds correctly without "bir yüz"', () => {
    expect(numberToWords(100)).toBe('yüz');
    expect(numberToWords(101)).toBe('yüz bir');
    expect(numberToWords(110)).toBe('yüz on');
    expect(numberToWords(200)).toBe('iki yüz');
    expect(numberToWords(354)).toBe('üç yüz elli dört');
  });

  it('should convert thousands correctly without "bir bin"', () => {
    expect(numberToWords(1000)).toBe('bin');
    expect(numberToWords(1001)).toBe('bin bir');
    expect(numberToWords(1250)).toBe('bin iki yüz elli');
    expect(numberToWords(2000)).toBe('iki bin');
    expect(numberToWords(2024)).toBe('iki bin yirmi dört');
  });

  it('should convert millions, billions, and trillions with "bir"', () => {
    expect(numberToWords(1000000)).toBe('bir milyon');
    expect(numberToWords(1000001)).toBe('bir milyon bir');
    expect(numberToWords(2500000)).toBe('iki milyon beş yüz bin');
    expect(numberToWords(1000000000)).toBe('bir milyar');
    expect(numberToWords(1000000000000)).toBe('bir trilyon');
  });

  it('should handle negative numbers', () => {
    expect(numberToWords(-5)).toBe('eksi beş');
    expect(numberToWords(-1250)).toBe('eksi bin iki yüz elli');
  });

  it('should handle decimals in regular mode', () => {
    expect(numberToWords(12.5)).toBe('on iki virgül beş');
    expect(numberToWords('0.05')).toBe('sıfır virgül sıfır beş');
    expect(numberToWords('3.14', { decimalWord: 'nokta' })).toBe('üç nokta on dört');
  });

  it('should convert currency with lira and kuruş', () => {
    expect(numberToWords(1250.5, { currency: true })).toBe(
      'bin iki yüz elli Türk Lirası elli Kuruş'
    );
    expect(numberToWords(1250.05, { currency: true })).toBe(
      'bin iki yüz elli Türk Lirası beş Kuruş'
    );
    expect(numberToWords(1250, { currency: true })).toBe(
      'bin iki yüz elli Türk Lirası'
    );
    expect(numberToWords(0.75, { currency: true })).toBe(
      'sıfır Türk Lirası yetmiş beş Kuruş'
    );
    expect(
      numberToWords(100, {
        currency: true,
        currencyUnit: 'TL',
        centsUnit: 'kr',
      })
    ).toBe('yüz TL');
  });

  it('should format casing correctly', () => {
    expect(numberToWords(1250, { case: 'upper' })).toBe('BİN İKİ YÜZ ELLİ');
    expect(numberToWords(1250, { case: 'first' })).toBe('Bin iki yüz elli');
    expect(numberToWords(1250, { case: 'words' })).toBe('Bin İki Yüz Elli');
  });

  it('should handle bigint and string inputs', () => {
    expect(numberToWords(BigInt(1000))).toBe('bin');
    expect(numberToWords('5000000')).toBe('beş milyon');
    expect(numberToWords('')).toBe('');
    // @ts-expect-error test invalid args
    expect(numberToWords(null)).toBe('');
    // @ts-expect-error test invalid args
    expect(numberToWords(undefined)).toBe('');
  });
});
