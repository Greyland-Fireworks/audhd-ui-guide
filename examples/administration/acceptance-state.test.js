import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initial, validate, canHide } from './acceptance-state.js';
import { identity, now } from '../../tests/review/fixtures.js';
test('compatibility entry rejects legacy promotion', () => { const legacy = { build: identity.build, gates: [] }; assert.ok(validate(legacy, identity, now).issue); assert.equal(canHide(legacy, identity, now), false); assert.equal(initial(identity, now).schemaVersion, 2); });
