import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveServerPort } from './port';

test('resolveServerPort respects explicitly provided values', () => {
  assert.equal(resolveServerPort('4000', 3000), 4000);
  assert.equal(resolveServerPort(5000, 3000), 5000);
});

test('resolveServerPort falls back to the default port for invalid values', () => {
  assert.equal(resolveServerPort('abc', 3000), 3000);
  assert.equal(resolveServerPort('0', 3000), 3000);
  assert.equal(resolveServerPort('-1', 3000), 3000);
});
