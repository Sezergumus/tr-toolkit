/**
 * tr-toolkit
 * Zero-dependency, high-performance Turkish language, validation, formatting, and text processing toolkit.
 *
 * @author Sezer Gümüş
 * @license MIT
 */

// Slugify & Turkish text utilities
export {
  slugify,
  replaceTurkishChars,
  turkishToLower,
  turkishToUpper,
  type SlugifyOptions,
} from './slugify';

// Validators & formatters
export {
  validateTCKN,
  maskTCKN,
  validateVKN,
  maskVKN,
  validateIBAN,
  formatIBAN,
  maskIBAN,
  validatePlate,
  formatPlate,
  getPlateCity,
  TURKISH_PROVINCES,
  validatePhone,
  formatPhone,
  maskPhone,
  normalizePhone,
  type PhoneValidationOptions,
} from './validators';

// Number to Turkish words
export {
  numberToWords,
  type NumberToWordsOptions,
} from './number-to-words';

// Currency formatting
export {
  formatCurrency,
  parseCurrency,
  type CurrencyFormatOptions,
} from './currency';

// Profanity filter & masker
export {
  cleanProfanity,
  hasProfanity,
  findProfanities,
  DEFAULT_PROFANITY_LIST,
  type ProfanityOptions,
} from './profanity';
