import { replaceTurkishChars } from '../slugify';

/**
 * Official province names of Turkey indexed by 2-digit plate code (01 - 81).
 */
export const TURKISH_PROVINCES: Record<string, string> = {
  '01': 'Adana',
  '02': 'Adıyaman',
  '03': 'Afyonkarahisar',
  '04': 'Ağrı',
  '05': 'Amasya',
  '06': 'Ankara',
  '07': 'Antalya',
  '08': 'Artvin',
  '09': 'Aydın',
  '10': 'Balıkesir',
  '11': 'Bilecik',
  '12': 'Bingöl',
  '13': 'Bitlis',
  '14': 'Bolu',
  '15': 'Burdur',
  '16': 'Bursa',
  '17': 'Çanakkale',
  '18': 'Çankırı',
  '19': 'Çorum',
  '20': 'Denizli',
  '21': 'Diyarbakır',
  '22': 'Edirne',
  '23': 'Elazığ',
  '24': 'Erzincan',
  '25': 'Erzurum',
  '26': 'Eskişehir',
  '27': 'Gaziantep',
  '28': 'Giresun',
  '29': 'Gümüşhane',
  '30': 'Hakkari',
  '31': 'Hatay',
  '32': 'Isparta',
  '33': 'Mersin',
  '34': 'İstanbul',
  '35': 'İzmir',
  '36': 'Kars',
  '37': 'Kastamonu',
  '38': 'Kayseri',
  '39': 'Kırklareli',
  '40': 'Kırşehir',
  '41': 'Kocaeli',
  '42': 'Konya',
  '43': 'Kütahya',
  '44': 'Malatya',
  '45': 'Manisa',
  '46': 'Kahramanmaraş',
  '47': 'Mardin',
  '48': 'Muğla',
  '49': 'Muş',
  '50': 'Nevşehir',
  '51': 'Niğde',
  '52': 'Ordu',
  '53': 'Rize',
  '54': 'Sakarya',
  '55': 'Samsun',
  '56': 'Siirt',
  '57': 'Sinop',
  '58': 'Sivas',
  '59': 'Tekirdağ',
  '60': 'Tokat',
  '61': 'Trabzon',
  '62': 'Tunceli',
  '63': 'Şanlıurfa',
  '64': 'Uşak',
  '65': 'Van',
  '66': 'Yozgat',
  '67': 'Zonguldak',
  '68': 'Aksaray',
  '69': 'Bayburt',
  '70': 'Karaman',
  '71': 'Kırıkkale',
  '72': 'Batman',
  '73': 'Şırnak',
  '74': 'Bartın',
  '75': 'Ardahan',
  '76': 'Iğdır',
  '77': 'Yalova',
  '78': 'Karabük',
  '79': 'Kilis',
  '80': 'Osmaniye',
  '81': 'Düzce',
};

/**
 * Regex matching Turkish plate formats:
 * - Province: 01 to 81
 * - Letter & Digits:
 *   1 letter + 4 or 5 digits (e.g. 34 A 1234, 06 B 12345)
 *   2 letters + 3 or 4 digits (e.g. 34 AB 123, 06 CD 1234)
 *   3 letters + 2 or 3 digits (e.g. 34 ABC 12, 06 DEF 123)
 */
const PLATE_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])([A-Z]{1}\d{4,5}|[A-Z]{2}\d{3,4}|[A-Z]{3}\d{2,3})$/;

/**
 * Regex matching with capture groups for formatting:
 * Group 1: Province code
 * Group 2: Letters
 * Group 3: Numbers
 */
const PLATE_PARTS_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])([A-Z]{1,3})(\d{2,5})$/;

/**
 * Normalizes a plate string by removing non-alphanumeric characters,
 * transliterating any Turkish characters to ASCII, and capitalizing.
 */
function normalizePlate(plate: string): string {
  if (!plate || typeof plate !== 'string') return '';
  return replaceTurkishChars(plate.trim())
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Validates a Turkish vehicle license plate number according to official civil registration patterns.
 *
 * Supported formats:
 * - `99 X 9999` or `99 X 99999`
 * - `99 XX 999` or `99 XX 9999`
 * - `99 XXX 99` or `99 XXX 999`
 * - Province code must be between 01 and 81.
 *
 * @param plate - Raw plate string to validate.
 * @returns True if the plate follows official Turkish vehicle registration patterns.
 *
 * @example
 * ```ts
 * validatePlate('34 ABC 123'); // true
 * validatePlate('06 A 1234');   // true
 * validatePlate('82 ABC 123');  // false (invalid province code 82)
 * validatePlate('34 ÇÇ 123');   // false (Turkish special letters not used in plates)
 * ```
 */
export function validatePlate(plate: string): boolean {
  if (!plate || typeof plate !== 'string') {
    return false;
  }

  const clean = plate.replace(/[\s-]+/g, '').toUpperCase();
  return PLATE_REGEX.test(clean);
}

/**
 * Formats a Turkish vehicle license plate string into standard separated format (e.g. '34 ABC 123').
 *
 * @param plate - Raw plate string.
 * @returns Cleanly spaced plate string, or normalized string if non-standard.
 *
 * @example
 * ```ts
 * formatPlate('34abc123');  // '34 ABC 123'
 * formatPlate('06a1234');   // '06 A 1234'
 * formatPlate('34-tb-1234'); // '34 TB 1234'
 * ```
 */
export function formatPlate(plate: string): string {
  if (!plate || typeof plate !== 'string') {
    return '';
  }

  const clean = normalizePlate(plate);
  const match = clean.match(PLATE_PARTS_REGEX);

  if (match) {
    const [, province, letters, digits] = match;
    // Check if valid combination
    if (
      (letters.length === 1 && (digits.length === 4 || digits.length === 5)) ||
      (letters.length === 2 && (digits.length === 3 || digits.length === 4)) ||
      (letters.length === 3 && (digits.length === 2 || digits.length === 3))
    ) {
      return `${province} ${letters} ${digits}`;
    }
  }

  return clean;
}

/**
 * Returns the city/province name for a given Turkish plate.
 *
 * @param plate - Plate string or 2-digit province code.
 * @returns Province name (e.g. 'İstanbul', 'Ankara') or undefined if invalid.
 *
 * @example
 * ```ts
 * getPlateCity('34 ABC 123'); // 'İstanbul'
 * getPlateCity('06');          // 'Ankara'
 * ```
 */
export function getPlateCity(plate: string): string | undefined {
  if (!plate || typeof plate !== 'string') {
    return undefined;
  }

  const clean = plate.trim();
  let code = '';

  if (/^\d{1,2}$/.test(clean)) {
    code = clean.padStart(2, '0');
  } else {
    const normalized = normalizePlate(clean);
    code = normalized.slice(0, 2);
  }

  return TURKISH_PROVINCES[code];
}
