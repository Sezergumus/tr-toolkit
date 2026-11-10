/**
 * Validates a Turkish Republic Identity Number (TC Kimlik Numarası - TCKN).
 *
 * Algorithmic rules:
 * - Must be an 11-digit numeric value.
 * - The first digit cannot be 0.
 * - The 10th digit is computed as:
 *   ((sum of odd-positioned digits 1, 3, 5, 7, 9 * 7) - (sum of even-positioned digits 2, 4, 6, 8)) % 10
 * - The 11th digit is computed as:
 *   (sum of the first 10 digits) % 10
 *
 * @param tckn - The TCKN string or number to validate.
 * @returns True if the TCKN is mathematically valid, false otherwise.
 *
 * @example
 * ```ts
 * validateTCKN('10000000146'); // true
 * validateTCKN('01234567890'); // false (starts with 0)
 * validateTCKN('12345678901'); // false (invalid checksum)
 * ```
 */
export function validateTCKN(tckn: string | number): boolean {
  if (tckn === null || tckn === undefined) {
    return false;
  }

  const str = String(tckn).trim();

  // Must consist of exactly 11 digits
  if (!/^[1-9]\d{10}$/.test(str)) {
    return false;
  }

  const digits = str.split('').map(Number);

  // 10th digit rule:
  // ((sum(1,3,5,7,9) * 7) - sum(2,4,6,8)) % 10
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

  const calculated10th = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  if (digits[9] !== calculated10th) {
    return false;
  }

  // 11th digit rule:
  // sum(1..10) % 10
  let totalFirst10 = 0;
  for (let i = 0; i < 10; i++) {
    totalFirst10 += digits[i];
  }

  const calculated11th = totalFirst10 % 10;
  if (digits[10] !== calculated11th) {
    return false;
  }

  return true;
}

/**
 * Masks a TCKN for display privacy, showing only the first few and last few digits.
 *
 * @param tckn - The TCKN string or number.
 * @param maskChar - The character to replace masked digits with (default: '*').
 * @returns Masked TCKN or empty string if input is invalid.
 *
 * @example
 * ```ts
 * maskTCKN('10000000146'); // '10*******46'
 * maskTCKN('10000000146', '•'); // '10•••••••46'
 * ```
 */
export function maskTCKN(tckn: string | number, maskChar = '*'): string {
  if (tckn === null || tckn === undefined) {
    return '';
  }

  const str = String(tckn).trim();
  if (!/^\d{11}$/.test(str)) {
    return '';
  }

  const first2 = str.slice(0, 2);
  const last2 = str.slice(9);
  const mask = maskChar.repeat(7);

  return `${first2}${mask}${last2}`;
}
