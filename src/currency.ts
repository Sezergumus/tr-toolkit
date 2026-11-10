/**
 * Configuration options for Turkish currency formatting.
 */
export interface CurrencyFormatOptions {
  /**
   * Currency symbol or code to display.
   * @default '₺'
   */
  symbol?: string;

  /**
   * Position of the currency symbol relative to the amount: 'before' or 'after'.
   * @default 'after'
   */
  position?: 'before' | 'after';

  /**
   * Whether to include a space between the symbol and the numeric amount.
   * @default true
   */
  space?: boolean;

  /**
   * Number of decimal fractional places to display.
   * @default 2
   */
  decimals?: number;

  /**
   * Enable compact abbreviation for large amounts (e.g. 1.250.000 -> 1,25M ₺).
   * @default false
   */
  compact?: boolean;

  /**
   * Suffixes used for compact formatting in Turkish.
   */
  compactUnits?: {
    thousand?: string;
    million?: string;
    billion?: string;
    trillion?: string;
  };
}

const DEFAULT_COMPACT_UNITS = {
  thousand: 'B',
  million: 'M',
  billion: 'Mr',
  trillion: 'T',
};

/**
 * Formats a number with Turkish thousand dots and decimal comma.
 */
function formatTurkishNumber(num: number, decimals: number): string {
  const isNegative = num < 0;
  const abs = Math.abs(num);

  const fixed = abs.toFixed(decimals);
  const [intPart, fracPart] = fixed.split('.');

  // Insert dots for thousands
  const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const formattedNum = decimals > 0 && fracPart ? `${withDots},${fracPart}` : withDots;

  return isNegative ? `-${formattedNum}` : formattedNum;
}

/**
 * Formats an amount in Turkish compact notation (e.g. 1,2M).
 */
function formatCompactAmount(
  amount: number,
  units: typeof DEFAULT_COMPACT_UNITS,
  decimals: number
): { formattedNumber: string; suffix: string } {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let scaled = abs;
  let suffix = '';

  if (abs >= 1_000_000_000_000) {
    scaled = abs / 1_000_000_000_000;
    suffix = units.trillion;
  } else if (abs >= 1_000_000_000) {
    scaled = abs / 1_000_000_000;
    suffix = units.billion;
  } else if (abs >= 1_000_000) {
    scaled = abs / 1_000_000;
    suffix = units.million;
  } else if (abs >= 1_000) {
    scaled = abs / 1_000;
    suffix = units.thousand;
  }

  // Format with Turkish decimal comma, trimming unnecessary trailing zeros
  const maxDecimals = Math.min(decimals, 2);
  let str = scaled.toFixed(maxDecimals);
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, '');
  }
  const formattedScaled = str.replace('.', ',');

  const formattedNumber = `${isNegative ? '-' : ''}${formattedScaled}${suffix}`;

  return { formattedNumber, suffix };
}

/**
 * Formats a monetary amount according to Turkish currency conventions (dot for thousands, comma for decimals).
 *
 * @param amount - Numeric amount to format.
 * @param options - Custom formatting options.
 * @returns Formatted currency string.
 *
 * @example
 * ```ts
 * formatCurrency(1250.5); // '1.250,50 ₺'
 * formatCurrency(1250.5, { position: 'before', space: false }); // '₺1.250,50'
 * formatCurrency(1200000, { compact: true }); // '1,2M ₺'
 * formatCurrency(1250.5, { symbol: 'TRY' }); // '1.250,50 TRY'
 * ```
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '';
  }

  const {
    symbol = '₺',
    position = 'after',
    space = true,
    decimals = 2,
    compact = false,
    compactUnits = DEFAULT_COMPACT_UNITS,
  } = options;

  const mergedUnits = { ...DEFAULT_COMPACT_UNITS, ...compactUnits };

  let formattedAmount = '';

  if (compact && Math.abs(amount) >= 1_000) {
    const compactResult = formatCompactAmount(amount, mergedUnits, decimals);
    formattedAmount = compactResult.formattedNumber;
  } else {
    formattedAmount = formatTurkishNumber(amount, decimals);
  }

  if (!symbol) {
    return formattedAmount;
  }

  const gap = space ? ' ' : '';

  if (position === 'before') {
    if (formattedAmount.startsWith('-')) {
      return `-${symbol}${gap}${formattedAmount.slice(1)}`;
    }
    return `${symbol}${gap}${formattedAmount}`;
  }

  return `${formattedAmount}${gap}${symbol}`;
}

/**
 * Parses a Turkish-formatted currency string into a floating point number.
 *
 * @param currencyStr - Turkish currency string (e.g. '1.250,50 ₺', '₺1.250,50', '1.250,50').
 * @returns Numerical value, or NaN if string cannot be parsed.
 *
 * @example
 * ```ts
 * parseCurrency('1.250,50 ₺'); // 1250.5
 * parseCurrency('₺ 5.000,00');  // 5000
 * parseCurrency('-1.250,50 ₺'); // -1250.5
 * ```
 */
export function parseCurrency(currencyStr: string): number {
  if (!currencyStr || typeof currencyStr !== 'string') {
    return NaN;
  }

  const trimmed = currencyStr.trim();
  const isNegative = trimmed.includes('-');

  // Remove currency symbols, letters, spaces
  const cleaned = trimmed
    .replace(/[^\d.,]/g, '')
    // Turkish dots are thousand separators, remove them
    .replace(/\./g, '')
    // Comma is the decimal separator, replace with dot
    .replace(/,/g, '.');

  if (!cleaned) return NaN;

  const val = parseFloat(cleaned);
  return isNegative ? -val : val;
}

export default formatCurrency;
