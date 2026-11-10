/**
 * Validates a Turkish Tax Identification Number (Vergi Kimlik Numarası - VKN).
 *
 * Algorithmic rules:
 * - Must consist of exactly 10 digits.
 * - For each of the first 9 digits (index i from 0 to 8):
 *     c1 = (digit[i] + (9 - i)) % 10
 *     c2 = (c1 * (2 ^ (9 - i))) % 9
 *     if (c1 !== 0 && c2 === 0) c2 = 9
 *     sum += c2
 * - Check digit = (10 - (sum % 10)) % 10
 * - The 10th digit must equal the check digit.
 *
 * @param vkn - The VKN string or number to validate.
 * @returns True if the VKN is mathematically valid, false otherwise.
 *
 * @example
 * ```ts
 * validateVKN('1234567807'); // returns true or false based on checksum
 * ```
 */
export function validateVKN(vkn: string | number): boolean {
  if (vkn === null || vkn === undefined) {
    return false;
  }

  const str = String(vkn).trim();

  // Must consist of exactly 10 digits
  if (!/^\d{10}$/.test(str)) {
    return false;
  }

  const digits = str.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const power = 9 - i;
    const c1 = (digits[i] + power) % 10;
    let c2 = (c1 * (2 ** power)) % 9;

    if (c1 !== 0 && c2 === 0) {
      c2 = 9;
    }

    sum += c2;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return digits[9] === checkDigit;
}

/**
 * Masks a VKN for display privacy, showing only the first and last few digits.
 *
 * @param vkn - The VKN string or number.
 * @param maskChar - The character to replace masked digits with (default: '*').
 * @returns Masked VKN or empty string if input is invalid.
 *
 * @example
 * ```ts
 * maskVKN('1234567890'); // '12******90'
 * ```
 */
export function maskVKN(vkn: string | number, maskChar = '*'): string {
  if (vkn === null || vkn === undefined) {
    return '';
  }

  const str = String(vkn).trim();
  if (!/^\d{10}$/.test(str)) {
    return '';
  }

  const first2 = str.slice(0, 2);
  const last2 = str.slice(8);
  const mask = maskChar.repeat(6);

  return `${first2}${mask}${last2}`;
}
