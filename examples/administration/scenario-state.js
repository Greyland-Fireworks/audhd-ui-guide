// AUDHD-06/07/10: teaching controls configure the existing in-memory owners;
// opening a disclosure never replaces data. Only an explicitly confirmed
// reset calls these owners. Incrementing the epoch also lets async work reject
// responses from the previous workspace. No backend or authentication exists.
// See ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status.
const owners = new Map(), listeners = new Set();
let fixture = 'normal', epoch = 0, readOnly = false, clockOffset = 0;
let clock = () => Date.now();
const modes = { rooms: 'normal', notebooks: 'normal' };
const publish = type => { for (const listener of listeners) listener({ type, ...scenarioState() }); };
export const scenarioState = () => ({ fixture, epoch, readOnly, modes: { ...modes }, clockOffset });
export const scenarioEpoch = () => epoch;
export const configurationAllowed = () => !readOnly;
export const dataMode = resource => modes[resource] || 'normal';
export const scenarioClockNow = () => clock() + clockOffset;
export function setScenarioClock(source = () => Date.now()) { clock = source; clockOffset = 0; }
export function advanceScenarioTime(ms) {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError('Advance time by a nonnegative number of milliseconds.');
  clockOffset += ms; publish('clock');
}
export function subscribeScenario(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function registerScenarioOwner(name, owner) {
  if (typeof owner.reset !== 'function') throw new TypeError('A scenario owner needs a reset function.');
  owners.set(name, owner);
  return () => owners.delete(name);
}
// Permission changes preserve proposals. Both the UI and each configuration
// mutation check this state; disabling a field alone cannot guard a mutation.
// AUDHD-04: ../../GUIDE.md#audhd-04-explain-effective-behavior.
export function setConfigurationReadOnly(value) { readOnly = Boolean(value); publish('permission'); }
export function setDataMode(resource, mode) {
  const allowed = resource === 'notebooks' ? ['normal', 'loading', 'failure', 'partial'] : ['normal', 'loading', 'failure'];
  if (!Object.hasOwn(modes, resource) || !allowed.includes(mode)) throw new RangeError('Unknown data scenario.');
  modes[resource] = mode; publish('data');
}
// Caller owns confirmation and focus. Resets are synchronous, in registration
// order: notes and meetings precede tasks that link to them. The final event is
// emitted only after every owner is ready, preventing half-reset renderings.
// AUDHD-13: ../../GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards.
export function replaceScenario(kind) {
  if (!['normal', 'empty', 'busy'].includes(kind)) throw new RangeError('Unknown fixture.');
  epoch += 1; fixture = kind; clockOffset = 0; readOnly = false;
  modes.rooms = 'normal'; modes.notebooks = 'normal';
  for (const owner of owners.values()) owner.reset(kind);
  publish('reset');
}
