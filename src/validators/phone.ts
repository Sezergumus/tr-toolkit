/**
 * Configuration options for phone number validation.
 */
export interface PhoneValidationOptions {
  /**
   * Restrict validation exclusively to mobile numbers (starts with 5xx).
   * @default false
   */
  mobileOnly?: boolean;
}

/**
 * Normalizes a raw Turkish phone number into a clean 10-digit national number.
 * Strips international prefixes (+90, 0090, 90) and leading zero.
 *
 * @param phone - Raw phone number.
 * @returns 10-digit national number, or empty string if invalid.
 */
export function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';

  // Keep only digits
  let digits = phone.replace(/\D/g, '');

  // Strip international prefix: 0090 or +90 (90)
  if (digits.startsWith('0090')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('90') && digits.length === 12) {
    digits = digits.slice(2);
  }

  // Strip leading 0
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Validates a Turkish mobile or landline phone number.
 *
 * Valid formats accepted include:
 * - `+90 532 123 45 67`
 * - `0532 123 45 67`
 * - `532 123 45 67`
 * - `05321234567`
 *
 * @param phone - Phone number to validate.
 * @param options - Validation options.
 * @returns True if valid, false otherwise.
 *
 * @example
 * ```ts
 * validatePhone('+90 532 123 45 67'); // true
 * validatePhone('0212 123 45 67', { mobileOnly: true }); // false
 * validatePhone('0212 123 45 67'); // true (landline)
 * ```
 */
export function validatePhone(
  phone: string,
  options: PhoneValidationOptions = {}
): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const digits = normalizePhone(phone);

  // A standard national number must have exactly 10 digits
  if (digits.length !== 10) {
    return false;
  }

  // If mobileOnly is requested, first digit must be 5
  if (options.mobileOnly) {
    return digits.startsWith('5');
  }

  // Standard Turkish area codes begin with:
  // 5 (Mobile: Turkcell, Vodafone, TT Mobil)
  // 2, 3, 4 (Geographic landline numbers)
  // 8 (850 VoIP, 800 Toll-Free, 900 Value-Added)
  const firstChar = digits[0];
  return ['2', '3', '4', '5', '8', '9'].includes(firstChar);
}

/**
 * Formats a Turkish phone number into standard human-readable or E.164 styles.
 *
 * @param phone - Phone number to format.
 * @param format - Output format style: 'national' | 'international' | 'e164' (default: 'national').
 * @returns Formatted phone string or original if invalid.
 *
 * @example
 * ```ts
 * formatPhone('5321234567'); // '0532 123 45 67'
 * formatPhone('5321234567', 'international'); // '+90 532 123 45 67'
 * formatPhone('5321234567', 'e164'); // '+905321234567'
 * ```
 */
export function formatPhone(
  phone: string,
  format: 'national' | 'international' | 'e164' = 'national'
): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const digits = normalizePhone(phone);
  if (digits.length !== 10) {
    return phone;
  }

  const area = digits.slice(0, 3);
  const part1 = digits.slice(3, 6);
  const part2 = digits.slice(6, 8);
  const part3 = digits.slice(8, 10);

  switch (format) {
    case 'e164':
      return `+90${digits}`;
    case 'international':
      return `+90 ${area} ${part1} ${part2} ${part3}`;
    case 'national':
    default:
      return `0${area} ${part1} ${part2} ${part3}`;
  }
}

/**
 * Masks a Turkish phone number for privacy, showing only the prefix and the last two digits.
 *
 * @param phone - Raw or formatted phone number.
 * @param maskChar - Character used for masking (default: '*').
 * @returns Masked phone string, e.g. '0532 *** ** 67'.
 *
 * @example
 * ```ts
 * maskPhone('0532 123 45 67'); // '0532 *** ** 67'
 * maskPhone('5321234567', '•'); // '0532 ••• •• 67'
 * ```
 */
export function maskPhone(phone: string, maskChar = '*'): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  const digits = normalizePhone(phone);
  if (digits.length !== 10) {
    return phone;
  }

  const area = digits.slice(0, 3);
  const mask3 = maskChar.repeat(3);
  const mask2 = maskChar.repeat(2);
  const last2 = digits.slice(8, 10);

  return `0${area} ${mask3} ${mask2} ${last2}`;
}
