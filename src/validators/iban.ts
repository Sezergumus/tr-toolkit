/**
 * Validates a Turkish International Bank Account Number (TR IBAN) using the ISO 7064 Modulo-97 algorithm.
 *
 * Rules:
 * - Total length is 26 characters.
 * - Starts with the country code 'TR'.
 * - Followed by 2 check digits and 22 numeric characters (bank code, reserve, account number).
 * - Satisfies `ISO 7064 Modulo 97-10` check.
 *
 * @param iban - The IBAN string to validate.
 * @returns True if the IBAN is valid, false otherwise.
 *
 * @example
 * ```ts
 * validateIBAN('TR330006100519786457841326'); // boolean
 * ```
 */
export function validateIBAN(iban: string): boolean {
  if (!iban || typeof iban !== 'string') {
    return false;
  }

  // Strip whitespace and dashes
  const clean = iban.replace(/[\s-]+/g, '').toUpperCase();

  // Turkey IBANs are strictly 26 characters long and start with TR followed by 24 digits
  if (!/^TR\d{24}$/.test(clean)) {
    return false;
  }

  // Rearrange: move the first 4 characters to the end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert letters to numbers (A=10, B=11, ..., T=29, R=27)
  let numericString = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    // A-Z is 65-90
    if (code >= 65 && code <= 90) {
      numericString += String(code - 55);
    } else {
      numericString += rearranged[i];
    }
  }

  // ISO 7064 Modulo 97 check using BigInt
  try {
    return BigInt(numericString) % 97n === 1n;
  } catch {
    return false;
  }
}

/**
 * Formats a Turkish IBAN into standard 4-character separated groups.
 *
 * @param iban - Raw or unformatted IBAN string.
 * @param separator - Group separator (default: ' ').
 * @returns Formatted IBAN string, e.g. 'TR33 0006 1005 1978 6457 8413 26'.
 *
 * @example
 * ```ts
 * formatIBAN('TR330006100519786457841326'); // 'TR33 0006 1005 1978 6457 8413 26'
 * ```
 */
export function formatIBAN(iban: string, separator = ' '): string {
  if (!iban || typeof iban !== 'string') {
    return '';
  }

  const clean = iban.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const chunks: string[] = [];

  for (let i = 0; i < clean.length; i += 4) {
    chunks.push(clean.slice(i, i + 4));
  }

  return chunks.join(separator);
}

/**
 * Masks a Turkish IBAN for privacy while keeping the bank identifier and last digits visible.
 *
 * @param iban - The IBAN string to mask.
 * @param maskChar - The masking character (default: '*').
 * @returns Masked IBAN string, e.g. 'TR33 0006 **** **** **** **** 26'.
 *
 * @example
 * ```ts
 * maskIBAN('TR330006100519786457841326'); // 'TR33 0006 **** **** **** **** 26'
 * ```
 */
export function maskIBAN(iban: string, maskChar = '*'): string {
  if (!iban || typeof iban !== 'string') {
    return '';
  }

  const formatted = formatIBAN(iban);
  const parts = formatted.split(' ');

  if (parts.length < 7) {
    return formatted;
  }

  const maskBlock = maskChar.repeat(4);
  const lastBlock = parts[6]; // 2 chars
  const maskedLast = maskChar.repeat(lastBlock.length > 2 ? lastBlock.length - 2 : 0) + lastBlock.slice(-2);

  return `${parts[0]} ${parts[1]} ${maskBlock} ${maskBlock} ${maskBlock} ${maskBlock} ${maskedLast}`;
}
