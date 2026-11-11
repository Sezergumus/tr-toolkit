# tr-toolkit

> 🇹🇷 Ultra-fast, zero-dependency, production-ready Turkish language processing, validation, formatting, and text manipulation toolkit for Node.js and the browser.

[![npm version](https://img.shields.io/npm/v/tr-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/tr-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-success.svg?style=flat-square)](package.json)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg?style=flat-square)](vitest.config.ts)
[![Dual Bundle](https://img.shields.io/badge/bundle-ESM%20%2B%20CJS-purple.svg?style=flat-square)](package.json)

---

## Highlights

- ⚡ **Zero Runtime Dependencies**: Extremely lightweight with minimal install footprint and attack surface.
- 🌳 **Tree-Shakeable & Dual ESM/CJS**: Ship only what you import using modular subpath exports (`/slugify`, `/validators`, `/number-to-words`, `/currency`, `/profanity`).
- 🛡️ **Fully Typed**: 100% written in modern TypeScript with thorough `.d.ts` declaration files and inline documentation.
- 🎯 **100% Test Coverage**: Rigorously verified with Vitest against all edge cases, official mathematical algorithms, and Turkish grammatical rules.
- 🌐 **Isomorphic & Universal**: Runs smoothly in Node.js, modern browsers, Bun, Deno, Edge runtimes, Cloudflare Workers, and Serverless environments.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Subpath Imports](#subpath-imports)
- [Modules & API Reference](#modules--api-reference)
  - [1. Turkish Slugify](#1-turkish-slugify)
  - [2. Validators & Formatters](#2-validators--formatters)
    - [TCKN (National ID)](#tckn-national-id)
    - [VKN (Tax Number)](#vkn-tax-number)
    - [IBAN (Bank Account)](#iban-bank-account)
    - [License Plate](#license-plate)
    - [Phone Numbers](#phone-numbers)
  - [3. Number to Words](#3-number-to-words)
  - [4. Turkish Currency Formatter & Parser](#4-turkish-currency-formatter--parser)
  - [5. Profanity Masker & Filter](#5-profanity-masker--filter)
- [TypeScript Types](#typescript-types)
- [Build & Testing](#build--testing)
- [License](#license)

---

## Installation

Install using your favorite package manager:

```bash
# npm
npm install tr-toolkit

# pnpm
pnpm add tr-toolkit

# yarn
yarn add tr-toolkit

# bun
bun add tr-toolkit
```

---

## Quick Start

You can import all utilities from the root entry point:

```ts
import {
  slugify,
  validateTCKN,
  formatIBAN,
  numberToWords,
  formatCurrency,
  cleanProfanity,
} from 'tr-toolkit';

// Turkish-aware slug
console.log(slugify('Şemsi Paşa Pasajında Güzel Bir Gün!', { strict: true }));
// -> "semsi-pasa-pasajinda-guzel-bir-gun"

// TCKN official checksum validation
console.log(validateTCKN('10000000146')); // -> true

// Bank IBAN formatting
console.log(formatIBAN('TR330006100519786457841326'));
// -> "TR33 0006 1005 1978 6457 8413 26"

// Number to Turkish words
console.log(numberToWords(1250.5, { currency: true }));
// -> "bin iki yüz elli Türk Lirası elli Kuruş"

// Turkish currency formatting
console.log(formatCurrency(1250.5));
// -> "1.250,50 ₺"

// Profanity masking
console.log(cleanProfanity('Siktir git buradan'));
// -> "****** git buradan"
```

---

## Subpath Imports

`tr-toolkit` provides dedicated subpath exports so your bundler (Vite, Rollup, Webpack, esbuild) only includes the exact features your application uses:

```ts
// Only import slugify (adds < 1 KB to your frontend bundle)
import { slugify, turkishToLower } from 'tr-toolkit/slugify';

// Only import official Turkish validators
import { validateTCKN, validateIBAN, formatPhone } from 'tr-toolkit/validators';

// Only import number to words converter
import { numberToWords } from 'tr-toolkit/number-to-words';

// Only import currency formatter
import { formatCurrency, parseCurrency } from 'tr-toolkit/currency';

// Only import profanity filter
import { cleanProfanity, hasProfanity } from 'tr-toolkit/profanity';
```

---

## Modules & API Reference

### 1. Turkish Slugify

Standard slugify libraries often fail on Turkish characters (e.g., turning `ı` into empty spaces or handling `İ` / `I` incorrectly). `tr-toolkit` accurately maps all Turkish diacritics according to phonetic rules.

```ts
import {
  slugify,
  replaceTurkishChars,
  turkishToLower,
  turkishToUpper,
} from 'tr-toolkit/slugify';

// Default slugification
slugify('Şemsi Paşa Pasajı');
// -> 'semsi-pasa-pasaji'

// Capital I and dotted İ handling
slugify('Iğdır ve İstanbul');
// -> 'igdir-ve-istanbul'

// Circumflex letters (â, î, û)
slugify('Kâzım ve Rüyâ');
// -> 'kazim-ve-ruya'

// Custom options
slugify('React 19 & TypeScript!', {
  separator: '_',
  strict: true,
});
// -> 'react_19_typescript'

// Case conversion respecting Turkish dotted/dotless I rules
turkishToLower('İSTANBUL'); // 'istanbul'
turkishToLower('ISPARTA');  // 'ısparta'
turkishToUpper('istanbul'); // 'İSTANBUL'
turkishToUpper('ısparta');  // 'ISPARTA'

// Direct transliteration to ASCII
replaceTurkishChars('ÖçŞğÜı'); // 'OcSgUi'
```

#### `SlugifyOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `separator` | `string` | `'-'` | Word separator string |
| `lowercase` | `boolean` | `true` | Convert output to lowercase |
| `remove` | `RegExp` | `undefined` | Custom regex to remove unwanted characters |
| `strict` | `boolean` | `false` | Strip all non-alphanumeric characters except separator |
| `trim` | `boolean` | `true` | Trim leading and trailing separators |

---

### 2. Validators & Formatters

#### TCKN (National ID)

Validates Turkish Republic 11-digit Personal Identification Numbers using official checksum validation rules (odd/even sum relations and 10th & 11th digit checks).

```ts
import { validateTCKN, maskTCKN } from 'tr-toolkit/validators';

validateTCKN('10000000146'); // true
validateTCKN('01234567890'); // false (cannot start with 0)
validateTCKN('12345678901'); // false (invalid checksum)

// Mask for display privacy
maskTCKN('10000000146');       // '10*******46'
maskTCKN('10000000146', '•');  // '10•••••••46'
```

#### VKN (Tax Number)

Validates 10-digit Turkish Tax Identification Numbers (Vergi Kimlik Numarası) using the official modulo 10/9 calculation.

```ts
import { validateVKN, maskVKN } from 'tr-toolkit/validators';

validateVKN('1234567890'); // true (valid checksum)
validateVKN('1234567891'); // false

// Mask for display
maskVKN('1234567890'); // '12******90'
```

#### IBAN (Bank Account)

Validates 26-character Turkish IBANs starting with `TR` using the international ISO 7064 Modulo 97-10 algorithm.

```ts
import { validateIBAN, formatIBAN, maskIBAN } from 'tr-toolkit/validators';

validateIBAN('TR330006100519786457841326'); // boolean
validateIBAN('TR33 0006 1005 1978 6457 8413 26'); // whitespace-insensitive

// Format into 4-character blocks
formatIBAN('TR330006100519786457841326');
// -> 'TR33 0006 1005 1978 6457 8413 26'

// Mask bank account for security
maskIBAN('TR330006100519786457841326');
// -> 'TR33 0006 **** **** **** **** 26'
```

#### License Plate

Validates Turkish vehicle license plates (provinces 01 to 81) against official civilian and commercial formats. Includes full 81 province city lookup!

```ts
import {
  validatePlate,
  formatPlate,
  getPlateCity,
  TURKISH_PROVINCES,
} from 'tr-toolkit/validators';

validatePlate('34 ABC 123'); // true
validatePlate('06 A 1234');   // true
validatePlate('35 AB 1234');  // true
validatePlate('82 ABC 123');  // false (invalid province 82)

// Format plate with standard spacing
formatPlate('34abc123'); // '34 ABC 123'
formatPlate('06a1234');  // '06 A 1234'

// Find city from plate or code
getPlateCity('34 ABC 123'); // 'İstanbul'
getPlateCity('06');         // 'Ankara'
getPlateCity('35');         // 'İzmir'
```

#### Phone Numbers

Validates, formats, and masks Turkish mobile, landline, and service telephone numbers.

```ts
import {
  validatePhone,
  formatPhone,
  maskPhone,
  normalizePhone,
} from 'tr-toolkit/validators';

// Validates mobile, landline (0212), and 0850/444 numbers
validatePhone('0532 123 45 67');      // true
validatePhone('+90 532 123 45 67');   // true
validatePhone('0212 123 45 67');      // true (landline)

// Restrict exclusively to mobile GSM numbers
validatePhone('0212 123 45 67', { mobileOnly: true }); // false
validatePhone('0532 123 45 67', { mobileOnly: true }); // true

// Formatting
formatPhone('5321234567');                   // '0532 123 45 67' (national)
formatPhone('5321234567', 'international');  // '+90 532 123 45 67'
formatPhone('5321234567', 'e164');           // '+905321234567'

// Masking
maskPhone('0532 123 45 67'); // '0532 *** ** 67'
maskPhone('5321234567', '•'); // '0532 ••• •• 67'
```

---

### 3. Number to Words

Converts integers and floating point values up to trillions into grammatically sound Turkish text. Correctly respects Turkish linguistic rules (e.g. 100 is "yüz", not "bir yüz"; 1,000 is "bin", not "bir bin"; but 1,000,000 is "bir milyon").

```ts
import { numberToWords } from 'tr-toolkit/number-to-words';

numberToWords(0);          // 'sıfır'
numberToWords(42);         // 'kırk iki'
numberToWords(100);        // 'yüz'
numberToWords(1000);       // 'bin'
numberToWords(1250);       // 'bin iki yüz elli'
numberToWords(1000000);    // 'bir milyon'
numberToWords(-42);        // 'eksi kırk iki'

// Decimals
numberToWords(12.5);       // 'on iki virgül beş'
numberToWords('0.05');     // 'sıfır virgül sıfır beş'

// Financial / Currency mode
numberToWords(1250.5, { currency: true });
// -> 'bin iki yüz elli Türk Lirası elli Kuruş'

numberToWords(100, {
  currency: true,
  currencyUnit: 'TL',
  centsUnit: 'kr',
});
// -> 'yüz TL'

// Casing options
numberToWords(1250, { case: 'upper' }); // 'BİN İKİ YÜZ ELLİ'
numberToWords(1250, { case: 'words' }); // 'Bin İki Yüz Elli'
numberToWords(1250, { case: 'first' }); // 'Bin iki yüz elli'
```

#### `NumberToWordsOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `currency` | `boolean` | `false` | Enable currency wording (Lira / Kuruş) |
| `currencyUnit` | `string` | `'Türk Lirası'` | Major unit name |
| `centsUnit` | `string` | `'Kuruş'` | Minor fractional unit name |
| `case` | `'lower' \| 'first' \| 'words' \| 'upper'` | `'lower'` | Output casing style |
| `decimalWord` | `string` | `'virgül'` | Word used for non-currency decimal separator |

---

### 4. Turkish Currency Formatter & Parser

Converts numbers to the official Turkish currency formatting standard (period `.` for thousands, comma `,` for decimals, followed by `₺` symbol).

```ts
import { formatCurrency, parseCurrency } from 'tr-toolkit/currency';

// Default formatting
formatCurrency(1250.5); // '1.250,50 ₺'
formatCurrency(0);      // '0,00 ₺'
formatCurrency(-1250.5); // '-1.250,50 ₺'

// Symbol position & spacing
formatCurrency(1250.5, { position: 'before', space: false }); // '₺1.250,50'
formatCurrency(1250.5, { position: 'before', space: true });  // '₺ 1.250,50'
formatCurrency(1250.5, { symbol: 'TRY' });                    // '1.250,50 TRY'

// Decimal precision
formatCurrency(1250, { decimals: 0 }); // '1.250 ₺'

// Compact mode for dashboards and charts
formatCurrency(1500, { compact: true });          // '1,5B ₺'
formatCurrency(1200000, { compact: true });       // '1,2M ₺'
formatCurrency(2500000000, { compact: true });    // '2,5Mr ₺'
formatCurrency(1000000000000, { compact: true }); // '1T ₺'

// Parse Turkish currency strings back to numeric values
parseCurrency('1.250,50 ₺');  // 1250.5
parseCurrency('₺1.250,50');   // 1250.5
parseCurrency('-1.250,50 ₺'); // -1250.5
```

#### `CurrencyFormatOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `symbol` | `string` | `'₺'` | Currency symbol or ISO code |
| `position` | `'before' \| 'after'` | `'after'` | Symbol placement |
| `space` | `boolean` | `true` | Include space between amount and symbol |
| `decimals` | `number` | `2` | Number of decimal places |
| `compact` | `boolean` | `false` | Format large numbers compactly (e.g. `1,2M ₺`) |

---

### 5. Profanity Masker & Filter

Detects and masks Turkish profanities, insults, and vulgar slang. Designed to avoid the classic **Scunthorpe problem** by using boundary-aware token matching so legitimate Turkish words containing profane substrings (such as *Göteborg*, *tamam*, *fizik*, *kesik*, *program*) are **never** falsely censored.

```ts
import {
  hasProfanity,
  cleanProfanity,
  findProfanities,
  DEFAULT_PROFANITY_LIST,
} from 'tr-toolkit/profanity';

// Check for presence of profanity
hasProfanity('Bu adam tam bir yavşak'); // true
hasProfanity('Selam Göteborg şehrine gidiyorum'); // false (safe!)
hasProfanity('Tamam bu akşam gelir misin?'); // false (safe!)

// Handles leetspeak and case insensitivity
hasProfanity('s1kt1r git'); // true
hasProfanity('SİKTİR'); // true

// Masking with full replacement
cleanProfanity('Siktir git buradan');
// -> '****** git buradan'

// Masking keeping first and last letter
cleanProfanity('Siktir git buradan', { strategy: 'keepFirstLast' });
// -> 'S****r git buradan'

// Custom mask character
cleanProfanity('Siktir git', { maskChar: '#' });
// -> '###### git'

// Custom blacklists and whitelists
cleanProfanity('Yasak kelime bu', {
  customWords: ['yasak'],
});
// -> '***** kelime bu'

cleanProfanity('Bu boktan bir durum', {
  excludeWords: ['boktan'],
});
// -> 'Bu boktan bir durum'

// Extract all detected offensive words
findProfanities('Siktir lan yavşak ve orospu');
// -> ['Siktir', 'yavşak', 'orospu']
```

#### `ProfanityOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `maskChar` | `string` | `'*'` | Character used to replace profane letters |
| `strategy` | `'full' \| 'keepFirstLast'` | `'full'` | Full mask or keep outer letters (`s****r`) |
| `customWords` | `string[]` | `[]` | Additional words to block |
| `excludeWords` | `string[]` | `[]` | Whitelisted words that should never be masked |

---

## TypeScript Types

All interfaces and types are exported directly from their respective entry points or the root package:

```ts
import type {
  SlugifyOptions,
  PhoneValidationOptions,
  NumberToWordsOptions,
  CurrencyFormatOptions,
  ProfanityOptions,
} from 'tr-toolkit';
```

---

## Build & Testing

```bash
# Run unit tests
npm test

# Run tests with 100% coverage report
npm run test:coverage

# Typecheck
npm run typecheck

# Build dual ESM and CommonJS bundles
npm run build
```

---

## License

[MIT](LICENSE) © 2026 [Sezer Gümüş](https://github.com/Sezergumus)
