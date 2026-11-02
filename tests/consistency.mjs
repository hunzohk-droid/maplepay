import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const start = html.indexOf('function estimateAnnualPay(gross)');
const end = html.indexOf('const amountInput =', start);
assert.ok(start >= 0 && end > start, 'Find the deployed calculation function');
const context = vm.createContext({});
vm.runInContext(html.slice(start, end), context);
const estimate = context.estimateAnnualPay;
const number = value => Number(value.replace(/[$,]/g, ''));
const rows = [...html.matchAll(/<tr>\s*<th[^>]*>\s*(\$[\d,]+)\s*<\/th>\s*<td>\s*(\$[\d,.]+)\s*<\/td>\s*<td>\s*(\$[\d,.]+)\s*<\/td>\s*<td>\s*(\$[\d,.]+)\s*<\/td>\s*<\/tr>/g)];
assert.equal(rows.length, 5, 'Check every displayed salary example');
for (const [, gross, annual, monthly, biweekly] of rows) {
  const result = estimate(number(gross));
  assert.equal(result.net, number(annual), `${gross}: annual example`);
  assert.equal(Math.round(result.net / 12 * 100) / 100, number(monthly), `${gross}: monthly example`);
  assert.equal(Math.round(result.net / 26 * 100) / 100, number(biweekly), `${gross}: biweekly example`);
}
const hourly = estimate(25 * 40 * 52);
assert.ok(html.includes('$42,035.71') && html.includes('$1,616.76'), 'Hourly example remains present');
assert.equal(hourly.net, 42035.71);
assert.equal(Math.round(hourly.net / 26 * 100) / 100, 1616.76);
assert.equal(estimate(0).net, 0);
for (const gross of [0, 3500, 20000, 52000, 60000, 74600, 85000, 100000, 300000]) {
  const result = estimate(gross);
  const deductions = [result.federal, result.bc, result.cpp, result.ei];
  assert.ok(deductions.every(value => Number.isFinite(value) && value >= 0));
  assert.ok(Math.abs(gross - result.net - deductions.reduce((a, b) => a + b, 0)) < 0.011, `Reconcile ${gross}`);
}
console.log('PASS: all five salary rows, hourly example, zero income and nine reconciliation cases.');
