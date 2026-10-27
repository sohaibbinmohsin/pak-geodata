const EASTERN_TO_WESTERN_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

const WESTERN_TO_EASTERN_DIGITS: Record<string, string> = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

export function toWesternDigits(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[۰-۹]/g, (char) => EASTERN_TO_WESTERN_DIGITS[char] || char);
}

export function toEasternDigits(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[0-9]/g, (char) => WESTERN_TO_EASTERN_DIGITS[char] || char);
}

export function stripUrduDiacritics(text: string): string {
  if (typeof text !== 'string') return '';
  // Unicode range for Arabic/Urdu diacritics / tashkeel
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

export function normalizeUrduText(text: string): string {
  if (typeof text !== 'string') return '';
  let str = stripUrduDiacritics(text);
  // Normalize Arabic Yeh (ي) & Alef Maksura (ى) to Urdu Yeh (ی)
  str = str.replace(/[\u064A\u0649]/g, '\u06CC');
  // Normalize Arabic Kaf (ك) to Urdu Keheh (ک)
  str = str.replace(/\u0643/g, '\u06A9');
  // Normalize Arabic Heh (ه) to Urdu Goal Heh (ہ)
  str = str.replace(/\u0647/g, '\u06C1');
  // Unify numerals to Western digits for robust matching
  str = toWesternDigits(str);
  // Normalize whitespace
  return str.trim().replace(/\s+/g, ' ');
}
