import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrduText,
  toWesternDigits,
  toEasternDigits,
  stripUrduDiacritics
} from '../src/urdu.js';

test('toWesternDigits converts Eastern numerals to Western ASCII digits', () => {
  assert.equal(toWesternDigits('گلبرگ ۳'), 'گلبرگ 3');
  assert.equal(toWesternDigits('۱۲۳۴۵۶۷۸۹۰'), '1234567890');
  // @ts-expect-error test non-string defensive handling
  assert.equal(toWesternDigits(null), '');
});

test('toEasternDigits converts Western digits to Eastern Arabic numerals', () => {
  assert.equal(toEasternDigits('Gulberg 3'), 'Gulberg ۳');
  assert.equal(toEasternDigits('0123456789'), '۰۱۲۳۴۵۶۷۸۹');
  // @ts-expect-error test non-string defensive handling
  assert.equal(toEasternDigits(undefined), '');
});

test('stripUrduDiacritics removes Aerab / Tashkeel', () => {
  assert.equal(stripUrduDiacritics('لَاہَوْر'), 'لاہور');
  // @ts-expect-error test non-string defensive handling
  assert.equal(stripUrduDiacritics(123), '');
});

test('normalizeUrduText normalizes Arabic letter variants, numerals, and whitespace', () => {
  // Arabic Yeh (ي) -> Urdu Yeh (ی)
  assert.equal(normalizeUrduText('کراچی '), 'کراچی');
  // Arabic Kaf (ك) -> Urdu Keheh (ک)
  assert.equal(normalizeUrduText('كراچى'), 'کراچی');
  // Arabic Heh (ه) -> Urdu Goal Heh (ہ)
  assert.equal(normalizeUrduText('لاھوره'), 'لاھورہ');
  // Eastern numeral normalized to Western for unified token matching
  assert.equal(normalizeUrduText('گلبرگ ۳'), 'گلبرگ 3');
  // Multiple whitespace collapsing and trimming
  assert.equal(normalizeUrduText('  گلبرگ    ۳  '), 'گلبرگ 3');
  // @ts-expect-error test non-string defensive handling
  assert.equal(normalizeUrduText(undefined), '');
});
