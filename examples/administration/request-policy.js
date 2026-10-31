import { configurationAllowed, scenarioClockNow, registerScenarioOwner } from './scenario-state.js';

export const DEFAULT_REQUEST_POLICY = Object.freeze({ enabled: true, capacity: 60, intervalMs: 5000 });

// AUDHD-04/07 / ../../GUIDE.md#audhd-04-explain-effective-behavior:
// one owner supplies both the policy display and admission decisions. The view
// cannot spend allowance, and an illustration cannot substitute for enforcement.
// An injected clock makes elapsed-time behavior testable without timed sleeps.
// This is an in-memory teaching service, not a production rate limiter.
export function createRequestPolicy({ now = () => Date.now(), canConfigure = () => true } = {}) {
  let policy = { ...DEFAULT_REQUEST_POLICY }, remaining = policy.capacity, anchor = now(), version = 1;
  function settle(at) {
    if (at < anchor) anchor = at;
    if (!policy.enabled || remaining === policy.capacity) { anchor = at; return; }
    const restored = Math.floor((at - anchor) / policy.intervalMs);
    remaining = Math.min(policy.capacity, remaining + restored);
    // A full allowance cannot bank elapsed time for an extra request later.
    anchor = remaining === policy.capacity ? at : anchor + restored * policy.intervalMs;
  }
  function snapshot() {
    const at = now(); settle(at);
    return Object.freeze({ ...policy, remaining, version, observedAt: at,
      nextEligibleAt: !policy.enabled || remaining > 0 ? at : anchor + policy.intervalMs });
  }
  function save(proposed) {
    // AUDHD-13 / ../../GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards:
    // permission is checked here as well as by disabled controls. A permission
    // change must not mutate policy or erase the view's independent draft.
    if (!canConfigure()) return { ok: false, restricted: true, error: 'Configuration is read-only in this scenario. A workspace administrator must allow configuration changes. Your proposed values are retained.' };
    if (typeof proposed.enabled !== 'boolean' || !Number.isInteger(proposed.capacity) || proposed.capacity < 1 || proposed.capacity > 10000 || !Number.isInteger(proposed.intervalMs) || proposed.intervalMs < 1 || proposed.intervalMs > 86400000) {
      return { ok: false, error: 'Use 1 to 10,000 whole requests and a time from 1 millisecond to 24 hours.' };
    }
    const at = now(); settle(at);
    const reenabling = !policy.enabled && proposed.enabled;
    const timingChanged = policy.intervalMs !== proposed.intervalMs;
    policy = { enabled: proposed.enabled, capacity: proposed.capacity, intervalMs: proposed.intervalMs };
    remaining = reenabling ? policy.capacity : Math.min(remaining, policy.capacity);
    // First settle complete periods under the OLD policy. A new interval starts
    // now; merely saving never refills allowance. Only explicit re-enabling
    // resets it, which the save receipt must disclose beside the action.
    if (reenabling || timingChanged || !policy.enabled || remaining === policy.capacity) anchor = at;
    version += 1;
    return { ok: true, resetAllowance: reenabling, intervalRestarted: timingChanged, ...snapshot() };
  }
  function consume() {
    const state = snapshot();
    if (!state.enabled) return { allowed: true, consumed: false, ...state };
    if (state.remaining === 0) return { allowed: false, consumed: false, ...state };
    remaining -= 1;
    return { allowed: true, consumed: true, ...snapshot() };
  }
  function reset() { policy = { ...DEFAULT_REQUEST_POLICY }; remaining = policy.capacity; anchor = now(); version = 1; }
  return { snapshot, save, consume, reset };
}

export const requestPolicy = createRequestPolicy({ now: scenarioClockNow, canConfigure: configurationAllowed });
registerScenarioOwner('export-request-policy', { reset: () => requestPolicy.reset() });

// AUDHD-06 / ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
// acceptance, identity deduplication and allowance consumption form one service
// boundary. UI retries cannot charge twice; a missing reply after acceptance
// still spent one allowance. Production needs equivalent atomic, durable
// service guarantees, not this browser Map. Reset invalidates pending replies.
export function createExportRequestService({ policy = requestPolicy, now = scenarioClockNow,
  delay = () => new Promise(resolve => setTimeout(resolve, 350)), onAccepted = () => {} } = {}) {
  const accepted = new Map();
  let writes = 0, epoch = 0;
  async function submit(request, failure = 'normal') {
    const started = epoch;
    await delay();
    if (started !== epoch) return { cancelled: true };
    if (accepted.has(request.id)) return accepted.get(request.id);
    if (failure === 'reject') return { rejected: true };
    if (failure === 'lost-before') throw new Error('Response unavailable before acceptance');
    const allowance = policy.consume();
    if (!allowance.allowed) return { limited: true, nextEligibleAt: allowance.nextEligibleAt, remaining: allowance.remaining };
    const record = Object.freeze({ id: request.id, name: request.name, number: ++writes, version: 1, acceptedAt: now() });
    accepted.set(request.id, record);
    onAccepted(record);
    if (failure === 'lost-after') throw new Error('Response unavailable after acceptance');
    return record;
  }
  return { submit, lookup: id => accepted.get(id), count: () => writes,
    reset() { epoch += 1; accepted.clear(); writes = 0; } };
}
