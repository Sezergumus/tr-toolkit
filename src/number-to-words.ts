import { turkishToLower, turkishToUpper } from './slugify';

/**
 * Options for converting numbers to Turkish words.
 */
export interface NumberToWordsOptions {
  /**
   * Whether to format the output as currency text.
   * @default false
   */
  currency?: boolean;

  /**
   * Main currency unit name.
   * @default 'Türk Lirası'
   */
  currencyUnit?: string;

  /**
   * Fractional currency unit name (cents).
   * @default 'Kuruş'
   */
  centsUnit?: string;

  /**
   * Casing for the returned words.
   * - 'lower': all lowercase
   * - 'first': only first character capitalized
   * - 'words': capitalize each word (Title Case)
   * - 'upper': all uppercase
   * @default 'lower'
   */
  case?: 'lower' | 'first' | 'words' | 'upper';

  /**
   * Word used for decimal point in non-currency conversions.
   * @default 'virgül'
   */
  decimalWord?: string;
}

const ONES: readonly string[] = [
  '',
  'bir',
  'iki',
  'üç',
  'dört',
  'beş',
  'altı',
  'yedi',
  'sekiz',
  'dokuz',
];

const TENS: readonly string[] = [
  '',
  'on',
  'yirmi',
  'otuz',
  'kırk',
  'elli',
  'altmış',
  'yetmiş',
  'seksen',
  'doksan',
];

const SCALES: readonly string[] = [
  '',
  'bin',
  'milyon',
  'milyar',
  'trilyon',
  'katrilyon',
  'kentilyon',
];

/**
 * Converts a 3-digit number (0-999) into Turkish words.
 */
function convertThreeDigitGroup(num: number): string[] {
  const parts: string[] = [];

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  const tens = Math.floor(remainder / 10);
  const ones = remainder % 10;

  if (hundreds > 0) {
    if (hundreds === 1) {
      parts.push('yüz');
    } else {
      parts.push(ONES[hundreds], 'yüz');
    }
  }

  if (tens > 0) {
    parts.push(TENS[tens]);
  }

  if (ones > 0) {
    parts.push(ONES[ones]);
  }

  return parts;
}

/**
 * Converts a non-negative integer string to Turkish words.
 */
function convertIntegerToWords(intStr: string): string {
  // Strip leading zeros
  const trimmed = intStr.replace(/^0+/, '');
  if (!trimmed) {
    return 'sıfır';
  }

  // Split string into groups of 3 from right to left
  const groups: number[] = [];
  let remaining = trimmed;
  while (remaining.length > 0) {
    const chunkLength = remaining.length % 3 || 3;
    const chunk = remaining.slice(0, chunkLength);
    groups.unshift(parseInt(chunk, 10));
    remaining = remaining.slice(chunkLength);
  }

  const resultWords: string[] = [];

  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal === 0) continue;

    const scaleName = SCALES[i] || '';

    // Special rule for 'bin' (thousands, index 1):
    // 1,000 is 'bin', NOT 'bir bin'
    if (i === 1 && groupVal === 1) {
      resultWords.push('bin');
    } else {
      const groupWords = convertThreeDigitGroup(groupVal);
      resultWords.push(...groupWords);
      if (scaleName) {
        resultWords.push(scaleName);
      }
    }
  }

  return resultWords.join(' ');
}

/**
 * Formats casing according to Turkish locale rules.
 */
function applyCase(text: string, casing: NumberToWordsOptions['case'] = 'lower'): string {
  if (!text) return '';

  switch (casing) {
    case 'upper':
      return turkishToUpper(text);
    case 'first': {
      const firstChar = text.charAt(0);
      const rest = text.slice(1);
      return turkishToUpper(firstChar) + rest;
    }
    case 'words': {
      return text
        .split(' ')
        .map((w) => {
          if (!w) return '';
          return turkishToUpper(w.charAt(0)) + w.slice(1);
        })
        .join(' ');
    }
    case 'lower':
    default:
      return turkishToLower(text);
  }
}

/**
 * Converts numbers into Turkish words with support for negative numbers, decimals, and currency.
 *
 * @param num - The number, string, or bigint to convert.
 * @param options - Custom options for currency and casing.
 * @returns Turkish word representation.
 *
 * @example
 * ```ts
 * numberToWords(1250); // 'bin iki yüz elli'
 * numberToWords(1250.50, { currency: true }); // 'bin iki yüz elli Türk Lirası elli Kuruş'
 * numberToWords(-42); // 'eksi kırk iki'
 * numberToWords(1000000); // 'bir milyon'
 * ```
 */
export function numberToWords(
  num: number | string | bigint,
  options: NumberToWordsOptions = {}
): string {
  if (num === null || num === undefined || num === '') {
    return '';
  }

  const {
    currency = false,
    currencyUnit = 'Türk Lirası',
    centsUnit = 'Kuruş',
    case: casing,
    decimalWord = 'virgül',
  } = options;

  let str = String(num).trim().replace(/,/g, '.');

  // Check negative
  let isNegative = false;
  if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1);
  }

  // Split integer and fraction
  const parts = str.split('.');
  const intPart = parts[0] || '0';
  const fracPart = parts[1];

  let result = '';

  if (currency) {
    const mainWords = convertIntegerToWords(intPart);
    result = `${mainWords} ${currencyUnit}`;

    if (fracPart) {
      // Normalize fraction to 2 digits for cents
      const centsStr = fracPart.length === 1 ? fracPart + '0' : fracPart.slice(0, 2);
      const centsVal = parseInt(centsStr, 10);
      if (centsVal > 0) {
        const centsWords = convertIntegerToWords(String(centsVal));
        result += ` ${centsWords} ${centsUnit}`;
      }
    }
  } else {
    result = convertIntegerToWords(intPart);

    if (fracPart !== undefined && fracPart.length > 0) {
      // Convert fraction digits
      const fracWords: string[] = [];
      // Leading zeros after decimal point
      for (let i = 0; i < fracPart.length; i++) {
        const digit = fracPart[i];
        if (digit === '0' && fracWords.length === 0) {
          fracWords.push('sıfır');
        } else {
          // If after leading zeros or standard number
          const remainingFrac = fracPart.slice(i);
          fracWords.push(convertIntegerToWords(remainingFrac));
          break;
        }
      }

      result += ` ${decimalWord} ${fracWords.join(' ')}`;
    }
  }

  if (isNegative) {
    result = `eksi ${result}`;
  }

  return casing ? applyCase(result.trim(), casing) : result.trim();
}

export default numberToWords;
