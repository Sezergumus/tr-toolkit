/**
 * Configuration options for the Turkish-aware slugify utility.
 */
export interface SlugifyOptions {
  /**
   * Character or string used to separate words in the resulting slug.
   * @default '-'
   */
  separator?: string;

  /**
   * Whether to transform the slug to lowercase.
   * @default true
   */
  lowercase?: boolean;

  /**
   * Optional regular expression pattern to remove matched characters before slugifying.
   */
  remove?: RegExp;

  /**
   * Whether to strictly strip all non-alphanumeric characters (except the separator).
   * @default false
   */
  strict?: boolean;

  /**
   * Whether to trim leading and trailing separators and whitespace.
   * @default true
   */
  trim?: boolean;
}

/**
 * Turkish character mapping table for transliteration to Latin ASCII.
 */
const TURKISH_CHAR_MAP: Record<string, string> = {
  // Lowercase
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
  // Uppercase
  Ç: 'C',
  Ğ: 'G',
  I: 'I',
  İ: 'I',
  Ö: 'O',
  Ş: 'S',
  Ü: 'U',
  Â: 'A',
  Î: 'I',
  Û: 'U',
};

/**
 * Lowercase Turkish character mapping table.
 */
const TURKISH_CHAR_MAP_LOWER: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  i: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Î: 'i',
  û: 'u',
  Û: 'u',
};

/**
 * Converts a Turkish string to lowercase respecting Turkish dotted/dotless I rules.
 *
 * @param text - The input string to convert.
 * @returns The lowercase string.
 *
 * @example
 * ```ts
 * turkishToLower('İSTANBUL'); // 'istanbul'
 * turkishToLower('ISPARTA');  // 'ısparta'
 * ```
 */
export function turkishToLower(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR');
}

/**
 * Converts a Turkish string to uppercase respecting Turkish dotted/dotless I rules.
 *
 * @param text - The input string to convert.
 * @returns The uppercase string.
 *
 * @example
 * ```ts
 * turkishToUpper('istanbul'); // 'İSTANBUL'
 * turkishToUpper('ısparta');  // 'ISPARTA'
 * ```
 */
export function turkishToUpper(text: string): string {
  if (!text) return '';
  return text
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toLocaleUpperCase('tr-TR');
}

/**
 * Transliterates Turkish characters in a string to standard ASCII Latin characters.
 *
 * @param text - The input string.
 * @param lowercase - Whether to map all characters directly to lowercase ASCII. Default: false.
 * @returns Transliterated ASCII string.
 *
 * @example
 * ```ts
 * replaceTurkishChars('Şemsi Paşa'); // 'Semsi Pasa'
 * replaceTurkishChars('Şemsi Paşa', true); // 'semsi pasa'
 * ```
 */
export function replaceTurkishChars(text: string, lowercase = false): string {
  if (!text) return '';
  const map = lowercase ? TURKISH_CHAR_MAP_LOWER : TURKISH_CHAR_MAP;
  return text.replace(/[çÇğĞıIİiöÖşŞüÜâÂîÎûÛ]/g, (char) => map[char] ?? char);
}

/**
 * Escapes regex special characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates a URL-friendly, SEO-optimized slug from a Turkish string.
 * Correctly maps special Turkish characters ('ı', 'I', 'İ', 'ğ', 'ü', 'ş', 'ö', 'ç')
 * without common transliteration pitfalls.
 *
 * @param text - The raw string to slugify.
 * @param options - Custom configuration options.
 * @returns The generated slug string.
 *
 * @example
 * ```ts
 * slugify('Şemsi Paşa Pasajı'); // 'semsi-pasa-pasaji'
 * slugify('Iğdır & Çankaya', { separator: '_' }); // 'igdir_cankaya'
 * slugify('React 19 & TypeScript!', { strict: true }); // 'react-19-typescript'
 * ```
 */
export function slugify(text: string, options: SlugifyOptions = {}): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    separator = '-',
    lowercase = true,
    remove,
    strict = false,
    trim = true,
  } = options;

  let result = text;

  // Custom remove pattern applied first if specified
  if (remove) {
    result = result.replace(remove, '');
  }

  // Transliterate Turkish characters
  result = replaceTurkishChars(result, lowercase);

  // Apply lowercase if requested
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Strict mode: remove anything that is not alphanumeric or whitespace
  if (strict) {
    result = result.replace(/[^a-zA-Z0-9\s-_]/g, '');
  }

  // Replace whitespace and underscores with the designated separator
  result = result.replace(/[\s_]+/g, separator);

  // Collapse consecutive separators into a single separator
  if (separator) {
    const escapedSep = escapeRegExp(separator);
    const multiSepRegex = new RegExp(`${escapedSep}+`, 'g');
    result = result.replace(multiSepRegex, separator);
  }

  // Trim leading and trailing separators
  if (trim && separator) {
    const escapedSep = escapeRegExp(separator);
    const trimRegex = new RegExp(`^${escapedSep}+|${escapedSep}+$`, 'g');
    result = result.replace(trimRegex, '');
  }

  return result;
}

export default slugify;
