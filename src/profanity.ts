import { replaceTurkishChars, turkishToLower } from './slugify';

/**
 * Configuration options for Turkish profanity filtering and masking.
 */
export interface ProfanityOptions {
  /**
   * Character used to mask profanity words.
   * @default '*'
   */
  maskChar?: string;

  /**
   * Additional custom words to include in the filter.
   */
  customWords?: string[];

  /**
   * Whitelist of words that should never be censored.
   */
  excludeWords?: string[];

  /**
   * Masking strategy:
   * - 'full': Replaces all letters with maskChar (e.g. '******')
   * - 'keepFirstLast': Keeps first and last letters visible (e.g. 's****r')
   * @default 'full'
   */
  strategy?: 'full' | 'keepFirstLast';
}

/**
 * Built-in list of Turkish profanities, vulgarities, and offensive slang words.
 * Standardized in lowercase Turkish.
 */
export const DEFAULT_PROFANITY_LIST: readonly string[] = [
  'amcık',
  'amcik',
  'amk',
  'aq',
  'amına',
  'amina',
  'amguard',
  'ananı',
  'anani',
  'bacını',
  'bacini',
  'bok',
  'boktan',
  'dalyarak',
  'döl',
  'dol',
  'gavat',
  'göt',
  'got',
  'götlek',
  'gotlek',
  'götoş',
  'gotos',
  'götveren',
  'gotveren',
  'haysiyetsiz',
  'ibne',
  'it',
  'kancık',
  'kancik',
  'kahpe',
  'kevaşe',
  'kevase',
  'malfatfat',
  'memeler',
  'orospu',
  'oç',
  'oc',
  'pezevenk',
  'piç',
  'pic',
  'puşt',
  'pust',
  'sik',
  'sikiş',
  'sikis',
  'sikik',
  'sikeyim',
  'sikerim',
  'siktir',
  'siktirgit',
  'siktiğimin',
  'sokuk',
  'şerefsiz',
  'serefsiz',
  'taşak',
  'tasak',
  'toshack',
  'yarak',
  'yarrak',
  'yavşak',
  'yavsak',
];

/**
 * Leetspeak normalization map.
 */
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '!': 'i',
  '3': 'e',
  '4': 'a',
  '@': 'a',
  '5': 's',
  '$': 's',
  '7': 't',
  '8': 'b',
};

/**
 * Normalizes text for profanity detection:
 * Replaces leetspeak characters and Turkish diacritics.
 */
function normalizeForComparison(word: string): string {
  let normalized = turkishToLower(word);
  normalized = normalized.replace(/[01!34@5$78]/g, (ch) => LEET_MAP[ch] ?? ch);
  normalized = replaceTurkishChars(normalized, true);
  return normalized;
}

/**
 * Escapes regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the set of profanity words to check against.
 */
function buildProfanitySet(
  customWords: string[] = [],
  excludeWords: string[] = []
): Set<string> {
  const wordsSet = new Set<string>();

  for (const word of DEFAULT_PROFANITY_LIST) {
    wordsSet.add(normalizeForComparison(word));
  }

  for (const word of customWords) {
    wordsSet.add(normalizeForComparison(word));
  }

  for (const word of excludeWords) {
    wordsSet.delete(normalizeForComparison(word));
  }

  return wordsSet;
}

/**
 * Masks a matched token according to the specified strategy.
 */
function maskWord(
  word: string,
  maskChar: string,
  strategy: 'full' | 'keepFirstLast'
): string {
  if (word.length <= 2 || strategy === 'full') {
    return maskChar.repeat(word.length);
  }

  // keepFirstLast: keep first character and last character
  const first = word[0];
  const last = word[word.length - 1];
  const middle = maskChar.repeat(word.length - 2);

  return `${first}${middle}${last}`;
}

/**
 * Checks whether a given text contains any Turkish profanity or blacklisted words.
 *
 * @param text - The text to inspect.
 * @param customWords - Optional additional words to check.
 * @returns True if profanity is detected, false otherwise.
 *
 * @example
 * ```ts
 * hasProfanity('Bu ne biçim siktir git!'); // true
 * hasProfanity('Merhaba dünya, nasılsın?'); // false
 * hasProfanity('Özel kelime!', ['özel']); // true
 * ```
 */
export function hasProfanity(text: string, customWords: string[] = []): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const profanitySet = buildProfanitySet(customWords);

  // Match words taking punctuation and whitespace boundaries into account
  // Matches consecutive alphanumeric/unicode letter characters
  const tokens = text.match(/[\p{L}\p{N}]+/gu);
  if (!tokens) {
    return false;
  }

  for (const token of tokens) {
    const normalized = normalizeForComparison(token);
    if (profanitySet.has(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Masks Turkish profanity and offensive words found in the given text.
 * Respects word boundaries to prevent false positives on legitimate words
 * (e.g. 'Göteborg', 'tamam', 'fizik', 'gösterge').
 *
 * @param text - The text to clean and mask.
 * @param options - Custom configuration options.
 * @returns Cleaned text with masked profanities.
 *
 * @example
 * ```ts
 * cleanProfanity('Siktir git buradan'); // '****** git buradan'
 * cleanProfanity('Siktir git buradan', { strategy: 'keepFirstLast' }); // 's****r git buradan'
 * cleanProfanity('Selam Göteborg!', { maskChar: '*' }); // 'Selam Göteborg!' (not falsely masked)
 * ```
 */
export function cleanProfanity(
  text: string,
  options: ProfanityOptions = {}
): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const {
    maskChar = '*',
    customWords = [],
    excludeWords = [],
    strategy = 'full',
  } = options;

  const profanitySet = buildProfanitySet(customWords, excludeWords);

  // Replace each word token if its normalized version is in the profanity set
  return text.replace(/[\p{L}\p{N}]+/gu, (token) => {
    const normalized = normalizeForComparison(token);
    if (profanitySet.has(normalized)) {
      return maskWord(token, maskChar, strategy);
    }
    return token;
  });
}

/**
 * Finds all unique profanity words detected in the input text.
 *
 * @param text - The text to search.
 * @param customWords - Optional additional words to search for.
 * @returns Array of unique detected profanity words.
 *
 * @example
 * ```ts
 * findProfanities('Bunu yapan piç kim?'); // ['piç']
 * ```
 */
export function findProfanities(
  text: string,
  customWords: string[] = []
): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const profanitySet = buildProfanitySet(customWords);
  const found = new Set<string>();

  const tokens = text.match(/[\p{L}\p{N}]+/gu);
  if (!tokens) return [];

  for (const token of tokens) {
    const normalized = normalizeForComparison(token);
    if (profanitySet.has(normalized)) {
      found.add(token);
    }
  }

  return Array.from(found);
}

export default cleanProfanity;
