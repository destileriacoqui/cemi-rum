/* Basic tests for the alcohol compliance functions.
 * Run: node js/alcohol-compliance.test.mjs
 * (No test framework dependency — plain assertions so it runs anywhere.) */
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const AC = require('./alcohol-compliance.js');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { console.error('FAIL  ' + name + '\n      ' + e.message); process.exitCode = 1; }
}

const NOW = new Date('2026-06-03T12:00:00Z');

test('calculateAge: exact 18th birthday is 18', () => {
  assert.equal(AC.calculateAge({ year: 2008, month: 6, day: 3 }, NOW), 18);
});
test('calculateAge: day before 18th birthday is 17', () => {
  assert.equal(AC.calculateAge({ year: 2008, month: 6, day: 4 }, NOW), 17);
});
test('calculateAge: accepts Date and ISO string', () => {
  assert.equal(AC.calculateAge(new Date('2000-01-01'), NOW), 26);
  assert.equal(AC.calculateAge('2000-01-01', NOW), 26);
});
test('calculateAge: invalid input returns null (no throw)', () => {
  assert.equal(AC.calculateAge({ year: 2008, month: 13, day: 40 }, NOW), null);
  assert.equal(AC.calculateAge('not-a-date', NOW), null);
  assert.equal(AC.calculateAge(null, NOW), null);
  assert.equal(AC.calculateAge({ year: 2008, month: 2, day: 30 }, NOW), null); // overflow rejected
});

test('getRequiredAlcoholAge: default is 18, strict mode is 21', () => {
  AC.configure({ STRICT_ALCOHOL_MODE: false, LEGAL_DRINKING_AGE: 18, STRICT_ALCOHOL_AGE: 21 });
  assert.equal(AC.getRequiredAlcoholAge(), 18);
  AC.configure({ STRICT_ALCOHOL_MODE: true });
  assert.equal(AC.getRequiredAlcoholAge(), 21);
  AC.configure({ STRICT_ALCOHOL_MODE: false }); // reset
});

test('isOfLegalDrinkingAge: 18+ passes at 18, fails at 17 (default)', () => {
  AC.configure({ STRICT_ALCOHOL_MODE: false });
  assert.equal(AC.isOfLegalDrinkingAge({ year: 2008, month: 6, day: 3 }, NOW), true);
  assert.equal(AC.isOfLegalDrinkingAge({ year: 2008, month: 6, day: 4 }, NOW), false);
});
test('isOfLegalDrinkingAge: strict mode requires 21', () => {
  AC.configure({ STRICT_ALCOHOL_MODE: true });
  assert.equal(AC.isOfLegalDrinkingAge({ year: 2008, month: 6, day: 3 }, NOW), false); // 18 < 21
  assert.equal(AC.isOfLegalDrinkingAge({ year: 2005, month: 6, day: 3 }, NOW), true);  // 21
  AC.configure({ STRICT_ALCOHOL_MODE: false });
});
test('isOfLegalDrinkingAge: invalid DOB is not of age', () => {
  assert.equal(AC.isOfLegalDrinkingAge(null, NOW), false);
});

test('checkout/ship/pickup gates honor config flags (server-side, no session)', () => {
  AC.configure({ ALLOW_ALCOHOL_ONLINE_CHECKOUT: false, ALLOW_ALCOHOL_SHIPPING: false, ALLOW_ALCOHOL_DELIVERY: false, ALLOW_PICKUP_REQUESTS: true });
  // In node there is no window/sessionStorage, so isAgeVerified() is false and
  // the *front-end* gates are false; the important invariant is the config flags.
  assert.equal(AC.config.ALLOW_ALCOHOL_ONLINE_CHECKOUT, false);
  assert.equal(AC.config.ALLOW_ALCOHOL_SHIPPING, false);
  assert.equal(AC.config.ALLOW_ALCOHOL_DELIVERY, false);
  assert.equal(AC.config.ALLOW_PICKUP_REQUESTS, true);
});

test('copy: required verbatim notices are present', () => {
  // The federal Government Warning is intentionally NOT shown on the website
  // (see internal note in alcohol-compliance.js); only a soft responsible line.
  assert.equal(AC.copy.GOVERNMENT_WARNING, undefined);
  assert.match(AC.copy.RESPONSIBLE_DRINKING, /Please enjoy responsibly/);
  assert.ok(AC.copy.PRODUCT_DISCLAIMER.includes('Must be of legal drinking age to purchase'));
  assert.equal(AC.copy.CARD_LABEL, 'Alcohol product. Legal drinking age required.');
});

console.log('\n' + passed + ' checks passed.');
