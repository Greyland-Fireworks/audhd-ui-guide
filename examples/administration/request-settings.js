import { recordEvent } from './events.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';
import { requestPolicy } from './request-policy.js';
import { configurationAllowed, advanceScenarioTime, subscribeScenario, registerScenarioOwner } from './scenario-state.js';

// AUDHD-06, 09 / ../../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision:
// preserve the numeric draft and chosen unit across routes. Changing an input
// unit intentionally changes the proposed duration; it is not a display preference.
const draft = { enabled: true, capacity: '60', amount: '5', unit: 'seconds' };
const factors = { seconds: 1000, minutes: 60000, hours: 3600000 };
let error = '';
let receipt = '';
let updateMountedView = () => {};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = milliseconds => `${milliseconds / 1000} seconds`;
function milliseconds(amount, unit) {
  // AUDHD-11 / ../../GUIDE.md#audhd-11-keep-controls-readable-and-operable:
  // decimal arithmetic avoids rejecting valid values such as 0.017 minutes
  // because binary floating-point multiplication produced 1019.9999999999999.
  if (!/^\d+(?:\.\d+)?$/.test(amount) || amount.length > 30) return null;
  const [whole, fraction = ''] = amount.split('.');
  const numerator = BigInt(whole + fraction) * BigInt(factors[unit]);
  const denominator = 10n ** BigInt(fraction.length);
  if (numerator % denominator !== 0n) return null;
  const result = numerator / denominator;
  return result >= 1n && result <= 86400000n ? Number(result) : null;
}
function values() {
  const capacity = Number(draft.capacity);
  const intervalMs = milliseconds(draft.amount.trim(), draft.unit);
  if (!draft.capacity.trim() || !Number.isInteger(capacity) || capacity < 1 || capacity > 10000) return { field: 'request-capacity', error: 'Enter 1 to 10,000 whole requests.' };
  if (intervalMs === null) return { field: 'request-amount', error: 'Enter a decimal time from 1 millisecond to 24 hours, in whole milliseconds. For example, 0.5 seconds or 2 minutes. Exponents are not supported.' };
  return { enabled: draft.enabled, capacity, intervalMs };
}
export function requestSettingsSummary() {
  const saved = requestPolicy.snapshot();
  const policy = values();
  if (draft.enabled && error && policy.error) return { text: 'Request limits: Correct the invalid value', href: `#settings/requests/${policy.field}`, hasProblem: true };
  const changed = draft.enabled !== saved.enabled || (draft.enabled && (policy.error || policy.capacity !== saved.capacity || policy.intervalMs !== saved.intervalMs));
  return changed ? { text: 'Request limits: Review unsaved changes', href: `#settings/requests/${draft.enabled ? 'request-capacity' : 'limit-enabled'}` } : null;
}

export function resetRequestSettings() {
  Object.assign(draft, { enabled: true, capacity: '60', amount: '5', unit: 'seconds' });
  error = ''; receipt = '';
}
registerScenarioOwner('export-request-settings', { reset: resetRequestSettings });
subscribeScenario(({ type }) => { if (['permission', 'clock'].includes(type)) updateMountedView(); });

export function renderRequestSettings(container, onChange = () => {}) {
  container.innerHTML = `<h1 class="task-heading">Request limits</h1>
    <p>Control how often this workspace can accept a new simulated notes-export request. Real JSON downloads and other actions are unaffected.</p>
    <form id="request-form" novalidate>
    <fieldset class="ui-panel"><legend>New export requests in this workspace</legend>
      <div class="access-comparison"><section><h2>Effective now</h2><p id="request-effective"></p><p id="request-remaining"></p><button type="button" id="refresh-allowance">Refresh allowance</button></section><section><h2>Proposed policy</h2><p id="request-preview" class="status" aria-live="polite"></p></section></div>
      <p id="request-restriction" class="status" role="status" hidden></p>
      <label class="inline"><input id="limit-enabled" type="checkbox" ${draft.enabled ? 'checked' : ''}>Limit export requests</label>
      <p>When off, new requests are accepted without using an allowance. Turning it back on resets the allowance to the configured maximum.</p>
      <div class="coupled-fields">
        <label for="request-capacity">Requests available at once<input id="request-capacity" type="number" min="1" max="10000" step="1" value="${escape(draft.capacity)}" aria-describedby="capacity-help request-errors"></label>
        <p id="capacity-help">This workspace can use up to this many accumulated requests without waiting. Example: 60. A higher maximum allows a larger initial rush; a lower maximum reduces it. Use whole numbers from 1 to 10,000.</p>
        <div class="quantity-unit"><div><label for="request-amount">Time to allow one more request</label><input id="request-amount" type="number" step="any" value="${escape(draft.amount)}" aria-describedby="timing-help request-errors"></div>
        <div><label for="request-unit">Time unit</label><select id="request-unit" aria-describedby="timing-help"><option value="seconds">Seconds</option><option value="minutes">Minutes</option><option value="hours">Hours</option></select></div></div>
        <p id="timing-help">One allowance returns after this time, up to the maximum above. Shorter times allow more requests over time. Examples: 0.5 seconds or 2 minutes; a blank time is incomplete. Choose the unit instead of typing a suffix. Changing the unit changes the proposed duration.</p>
      </div>
      <figure id="request-illustration" class="allowance-illustration" aria-labelledby="allowance-caption"><figcaption id="allowance-caption">How the proposed allowance recovers</figcaption><ol class="allowance-steps" id="allowance-steps"></ol><p>Illustration: assumes the full allowance is used immediately, then no more requests are made. This is not measured server activity.</p></figure>
      <details class="context-help" data-guide-key="request-help"><summary aria-label="About request limits" title="About request limits"><span aria-hidden="true">ⓘ</span><span> How to choose</span></summary>
        <ul><li>Use a limit to control a rush of requests for this workspace. Keep it off when you are practicing request recovery without waiting.</li>
        <li>With 60 available requests and 5 seconds to allow one more, a full allowance permits 60 immediately. If all are used, this workspace can make one more after 5 seconds. This is not 60 requests every 5 seconds.</li>
        <li>A larger allowance permits a bigger initial rush. A shorter time permits more requests over time. Neither value tells you what real hardware can handle.</li>
        <li>The simulation supports decimal times from 1 millisecond through 24 hours, at whole-millisecond precision. Examples: 0.5 seconds or 2 minutes. A blank time is incomplete, not zero or an automatic default.</li>
        <li>These are demonstration defaults, not production recommendations. Measure the service's response times and rejected requests before choosing a production limit.</li></ul>
      </details>
      <p id="request-errors" class="error" role="alert"></p>
      <div class="actions"><button id="save-request-policy" type="submit" class="ui-action">Save request limits</button><a href="#recovery">Request a notes export</a></div>
      <p>Saving takes effect immediately for new simulated requests. It does not refill an enabled allowance or change accepted requests. Refreshing this page resets the policy and requests.</p>
      <p id="request-saved" role="status"></p>
    </fieldset></form>
    ${guideNote('request-policy-notes', 'Try the policy through its actual task', '<p>The quantity and time describe one decision, so they share a boundary and a combined preview. The effective policy and remaining allowance come from the same service owner that accepts requests. The illustration only explains proposed values.</p><ol><li>Fill the practice preset, then deliberately save it.</li><li>Open “Request a notes export” and submit two requests, confirming each before starting another.</li><li>A third request must wait. Its name remains intact; advance the demonstration clock or wait, then explicitly retry.</li></ol><div class="actions"><button type="button" id="request-preset">Fill preset: 2 requests, 10 seconds</button><button type="button" id="advance-request-time">Advance demo clock by 10 seconds</button></div><p id="request-teaching-status" role="status"></p><p>The preset changes only the proposal. Advancing the clock does not submit or retry a request. Acceptance and duplicate protection are simulated in browser memory; production requires equivalent service guarantees.</p>', ['AUDHD-04', 'AUDHD-06', 'AUDHD-08', 'AUDHD-09', 'AUDHD-12'])}`;
  const get = id => container.querySelector(`#${id}`);
  restoreGuideNotes(container);
  get('request-unit').value = draft.unit;
  function update() {
    if (!get('request-form')?.isConnected) return;
    const policy = values();
    const saved = requestPolicy.snapshot();
    const allowed = configurationAllowed();
    const proposedTime = `${draft.amount} ${draft.unit}${draft.unit === 'seconds' ? '' : ` (${duration(policy.intervalMs)})`}`;
    get('request-preview').textContent = !draft.enabled ? 'Draft: no request limit. The numeric proposal is retained for when you turn it on again.' : policy.error || `Up to ${policy.capacity} requests can be accepted immediately when full. One allowance returns every ${proposedTime}, up to a maximum of ${policy.capacity}.`;
    const effectiveText = saved.enabled ? `${saved.capacity} requests maximum; one allowance returns every ${duration(saved.intervalMs)}.` : 'No request limit. Configured values are retained while enforcement is off.';
    get('request-effective').textContent = effectiveText;
    const observed = new Date(saved.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    get('request-remaining').textContent = saved.enabled ? `${saved.remaining} of ${saved.capacity} allowances available as of ${observed}.` : 'New requests do not spend allowance while the limit is off.';
    get('request-restriction').hidden = allowed;
    get('request-restriction').textContent = allowed ? '' : 'Configuration is read-only in this scenario. A workspace administrator must allow configuration changes. Your proposed values are retained.';
    // AUDHD-04/08/09: connected states explain the coupled quantity/time
    // controls. This is a static calculation from the draft, not a live meter,
    // and never claims the whole allowance returns after one interval.
    // See ../../GUIDE.md#audhd-04-explain-effective-behavior.
    get('request-illustration').hidden = !draft.enabled || Boolean(policy.error);
    if (draft.enabled && !policy.error) get('allowance-steps').innerHTML = [
      ['Full allowance', policy.capacity, 'available requests'],
      ['All used at once', 0, 'available requests'],
      [`After ${duration(policy.intervalMs)}`, 1, 'available request'],
      [`After ${duration(policy.intervalMs*2)}`, Math.min(2,policy.capacity), policy.capacity===1?'available request (full)':'available requests'],
    ].map(([label,count,unit])=>`<li><span>${label}</span><strong>${count}</strong><span>${unit}</span></li>`).join('');
    get('request-saved').textContent = receipt || `Effective for this visit: ${effectiveText}`;
    get('request-errors').textContent = error;
    for (const id of ['request-capacity', 'request-amount']) get(id).setAttribute('aria-invalid', String(Boolean(draft.enabled && error && policy.field === id)));
    for (const id of ['request-capacity', 'request-amount', 'request-unit']) get(id).disabled = !draft.enabled || !allowed;
    get('limit-enabled').disabled = !allowed;
    get('save-request-policy').disabled = !allowed;
    get('request-preset').disabled = !allowed;
    // Keep the shell's attention badge current without rebuilding task controls
    // or moving focus when a draft, validation result or save changes.
    // AUDHD-05: ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
    onChange();
  }
  // AUDHD-05/10 / ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability:
  // permission and clock changes update receipts/control availability in place.
  // They must not reconstruct controls or discard unfinished numeric/unit edits.
  updateMountedView = update;
  for (const [id, key] of [['limit-enabled', 'enabled'], ['request-capacity', 'capacity'], ['request-amount', 'amount'], ['request-unit', 'unit']]) {
    get(id).addEventListener('input', event => { draft[key] = key === 'enabled' ? event.target.checked : event.target.value; const next = values(); if (!draft.enabled || !next.error) error = ''; else if (error) error = next.error; update(); });
  }
  get('request-form').onsubmit = event => {
    event.preventDefault();
    const policy = values();
    if (draft.enabled && policy.error) { error = policy.error; update(); get(policy.field).focus(); return; }
    // AUDHD-06 / ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
    // turning off does not coerce or destroy an unfinished numeric draft.
    const current = requestPolicy.snapshot();
    const saved = requestPolicy.save(draft.enabled ? policy : { ...current, enabled: false });
    if (!saved.ok) { error = saved.error; update(); return; }
    receipt = saved.enabled ? `Saved and effective now: maximum ${saved.capacity}; one allowance every ${duration(saved.intervalMs)}. ${saved.remaining} allowances remain.${saved.resetAllowance ? ' Turning the limit back on reset the allowance to its full maximum.' : ' Saving did not refill the allowance.'}${saved.intervalRestarted ? ' The new replenishment interval starts now.' : ''}` : 'Saved and effective now: no request limit for new simulated export requests. Configured values are retained.';
    recordEvent({ description: receipt, subject: 'Export request limits', version: saved.version });
    error = ''; update();
  };
  get('refresh-allowance').onclick = update;
  get('request-preset').onclick = () => {
    Object.assign(draft, { enabled: true, capacity: '2', amount: '10', unit: 'seconds' });
    get('limit-enabled').checked = true; get('request-capacity').value = '2'; get('request-amount').value = '10'; get('request-unit').value = 'seconds';
    error = ''; update(); get('request-teaching-status').textContent = 'Preset filled, not saved. Review it, then use Save request limits.'; get('request-capacity').focus();
  };
  get('advance-request-time').onclick = () => { advanceScenarioTime(10000); update(); get('request-teaching-status').textContent = 'Demo clock advanced by 10 seconds. No request was submitted.'; };
  update();
}
