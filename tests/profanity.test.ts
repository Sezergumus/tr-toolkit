import { describe, it, expect } from 'vitest';
import {
  cleanProfanity,
  hasProfanity,
  findProfanities,
  DEFAULT_PROFANITY_LIST,
} from '../src/profanity';

describe('hasProfanity', () => {
  it('should detect Turkish profanities in simple sentences', () => {
    expect(hasProfanity('Bu adam tam bir yavşak')).toBe(true);
    expect(hasProfanity('Siktir git')).toBe(true);
    expect(hasProfanity('Lan orospu çocuğu')).toBe(true);
    expect(hasProfanity('Bu bir amk meselesi')).toBe(true);
  });

  it('should detect uppercase and mixed case profanities', () => {
    expect(hasProfanity('SİKTİR GİT')).toBe(true);
    expect(hasProfanity('OROSPU')).toBe(true);
    expect(hasProfanity('YavŞaK')).toBe(true);
  });

  it('should detect leetspeak variations', () => {
    expect(hasProfanity('s1kt1r git')).toBe(true);
    expect(hasProfanity('0rospu')).toBe(true);
  });

  it('should NOT trigger false positives on legitimate Turkish words', () => {
    expect(hasProfanity('Selam Göteborg şehrine gidiyorum')).toBe(false);
    expect(hasProfanity('Tamam bu akşam gelir misin?')).toBe(false);
    expect(hasProfanity('Fizik dersi çok eğlenceli')).toBe(false);
    expect(hasProfanity('Kesik çizgi ile belirtilmiş')).toBe(false);
    expect(hasProfanity('Yeni bir bilgisayar programı yazdım')).toBe(false);
    expect(hasProfanity('Biraz hamam böceği gördük')).toBe(false);
  });

  it('should support customWords list', () => {
    expect(hasProfanity('Bu bir elma', ['elma'])).toBe(true);
    expect(hasProfanity('Bu bir armut', ['elma'])).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(hasProfanity('')).toBe(false);
    // @ts-expect-error test invalid args
    expect(hasProfanity(null)).toBe(false);
    // @ts-expect-error test invalid args
    expect(hasProfanity(undefined)).toBe(false);
    expect(hasProfanity('...!!!???')).toBe(false);
  });
});

describe('cleanProfanity', () => {
  it('should mask profanities with default asterisks', () => {
    expect(cleanProfanity('Siktir git buradan')).toBe('****** git buradan');
    expect(cleanProfanity('Ne diyorsun amk!?!')).toBe('Ne diyorsun ***!?!');
  });

  it('should support custom maskChar', () => {
    expect(cleanProfanity('Siktir git', { maskChar: '#' })).toBe('###### git');
    expect(cleanProfanity('piç', { maskChar: '•' })).toBe('•••');
  });

  it('should support keepFirstLast strategy', () => {
    expect(
      cleanProfanity('Siktir git buradan', { strategy: 'keepFirstLast' })
    ).toBe('S****r git buradan');
    expect(
      cleanProfanity('yavşak herif', { strategy: 'keepFirstLast' })
    ).toBe('y****k herif');
    // Short word (<=2 chars) stays fully masked
    expect(
      cleanProfanity('oç sen kimsin', { strategy: 'keepFirstLast' })
    ).toBe('** sen kimsin');
  });

  it('should respect excludeWords whitelist', () => {
    expect(
      cleanProfanity('Bu boktan bir durum', { excludeWords: ['boktan'] })
    ).toBe('Bu boktan bir durum');
  });

  it('should support customWords parameter', () => {
    expect(cleanProfanity('Yasaklı kelime bu', { customWords: ['yasaklı'] })).toBe(
      '******* kelime bu'
    );
  });

  it('should handle empty or invalid inputs', () => {
    expect(cleanProfanity('')).toBe('');
    // @ts-expect-error test invalid args
    expect(cleanProfanity(null)).toBe('');
    // @ts-expect-error test invalid args
    expect(cleanProfanity(undefined)).toBe('');
  });
});

describe('findProfanities', () => {
  it('should return detected profanities in text', () => {
    const list = findProfanities('Siktir lan yavşak ve orospu');
    expect(list).toContain('Siktir');
    expect(list).toContain('yavşak');
    expect(list).toContain('orospu');
  });

  it('should return empty array for clean text or invalid input', () => {
    expect(findProfanities('Harika bir gün')).toEqual([]);
    expect(findProfanities('')).toEqual([]);
    expect(findProfanities('!@#$%^&*()')).toEqual([]);
    // @ts-expect-error test invalid args
    expect(findProfanities(null)).toEqual([]);
  });

  it('should expose DEFAULT_PROFANITY_LIST', () => {
    expect(DEFAULT_PROFANITY_LIST.length).toBeGreaterThan(20);
    expect(DEFAULT_PROFANITY_LIST).toContain('orospu');
  });
});
