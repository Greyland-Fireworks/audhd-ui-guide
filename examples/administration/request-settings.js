import { recordEvent } from './events.js';
import { guideNote, restoreGuideNotes } from './guide-notes.js';

// AUDHD-06, 09 / GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision:
// preserve the numeric draft and chosen unit across routes. Changing an input
// unit intentionally changes the proposed duration; it is not a display preference.
const draft = { enabled: true, capacity: '60', amount: '5', unit: 'seconds' };
const factors = { seconds: 1000, minutes: 60000, hours: 3600000 };
let saved = { enabled: true, capacity: 60, intervalMs: 5000 };
let savedVersion = 1;
let error = '';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration = milliseconds => `${milliseconds / 1000} seconds`;
function milliseconds(amount, unit) {
  // AUDHD-11 / GUIDE.md#audhd-11-keep-controls-readable-and-operable:
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
  const policy = values();
  if (draft.enabled && error && policy.error) return { text: 'Request limits: Correct the invalid value', href: `#settings/requests/${policy.field}`, hasProblem: true };
  const changed = draft.enabled !== saved.enabled || (draft.enabled && (policy.error || policy.capacity !== saved.capacity || policy.intervalMs !== saved.intervalMs));
  return changed ? { text: 'Request limits: Review unsaved changes', href: `#settings/requests/${draft.enabled ? 'request-capacity' : 'limit-enabled'}` } : null;
}

export function renderRequestSettings(container, onChange = () => {}) {
  container.innerHTML = `<h1 class="task-heading">Request limits</h1>
    <p>Choose how quickly one application can request note exports.</p>
    <p class="simulation-boundary">This policy is saved only in memory. It does not limit this demo’s requests or control a live service; reloading resets it.</p>
    <form id="request-form" novalidate>
    <fieldset class="ui-panel"><legend>Requests from one application</legend>
      <label class="inline"><input id="limit-enabled" type="checkbox" ${draft.enabled ? 'checked' : ''}>Limit export requests</label>
      <p>When off, this policy imposes no limit. Other service limits would still apply.</p>
      <div class="coupled-fields">
        <label for="request-capacity">Requests available at once<input id="request-capacity" type="number" min="1" max="10000" step="1" value="${escape(draft.capacity)}" aria-describedby="capacity-help request-errors"></label>
        <p id="capacity-help">An application can use up to this many accumulated requests without waiting. Example: 60. The simulation accepts whole numbers from 1 to 10,000.</p>
        <div class="quantity-unit"><div><label for="request-amount">Time to allow one more request</label><input id="request-amount" type="number" step="any" value="${escape(draft.amount)}" aria-describedby="timing-help request-errors"></div>
        <div><label for="request-unit">Time unit</label><select id="request-unit" aria-describedby="timing-help"><option value="seconds">Seconds</option><option value="minutes">Minutes</option><option value="hours">Hours</option></select></div></div>
        <p id="timing-help">One request becomes available after this time, up to the limit above. Examples: 0.5 seconds or 2 minutes; a blank time is incomplete. Choose the unit instead of typing a suffix. Changing the unit changes the proposed duration.</p>
      </div>
      <p id="request-preview" class="status" aria-live="polite"></p>
      <figure id="request-illustration" class="allowance-illustration" aria-labelledby="allowance-caption"><figcaption id="allowance-caption">How the proposed allowance recovers</figcaption><ol class="allowance-steps" id="allowance-steps"></ol><p>Illustration: assumes the full allowance is used immediately, then no more requests are made. This is not measured server activity.</p></figure>
      <details class="context-help" data-guide-key="request-help"><summary aria-label="About request limits" title="About request limits"><span aria-hidden="true">ⓘ</span><span> How to choose</span></summary>
        <ul><li>Use a limit when one busy application could delay exports for everyone else. Keep it off when another service already enforces the policy you need.</li>
        <li>With 60 available requests and 5 seconds to allow one more, a full allowance permits 60 immediately. If all are used, the application can make one more after 5 seconds. This is not 60 requests every 5 seconds.</li>
        <li>A larger allowance permits a bigger initial rush. A shorter time permits more requests over time. Neither value tells you what real hardware can handle.</li>
        <li>The simulation supports decimal times from 1 millisecond through 24 hours, at whole-millisecond precision. Examples: 0.5 seconds or 2 minutes. A blank time is incomplete, not zero or an automatic default.</li>
        <li>These are demonstration defaults, not production recommendations. Measure the service's response times and rejected requests before choosing a production limit.</li></ul>
      </details>
      <p id="request-errors" class="error" role="alert"></p>
      <div class="actions"><button type="submit" class="ui-action">Save request limits</button></div>
      <p id="request-saved" role="status"></p>
    </fieldset></form>
    ${guideNote('request-policy-notes', 'Why these controls stay together', '<p>The available-request count and the time to allow one more request describe one policy. A shared boundary and a combined preview explain their relationship. Local help remains available with Guide notes off; implementation commentary does not occupy the working form.</p><p>Saving records this policy in memory and adds a session activity entry. It does not apply a rate limit to the export-request simulation or certify production behavior.</p>', ['AUDHD-04', 'AUDHD-08', 'AUDHD-09', 'AUDHD-12'])}`;
  const get = id => container.querySelector(`#${id}`);
  restoreGuideNotes(container);
  get('request-unit').value = draft.unit;
  function update() {
    const policy = values();
    const proposedTime = `${draft.amount} ${draft.unit}${draft.unit === 'seconds' ? '' : ` (${duration(policy.intervalMs)})`}`;
    get('request-preview').textContent = !draft.enabled ? 'Draft: no request limit. The values are retained for when you turn it on again.' : policy.error || `Draft: ${proposedTime}. Up to ${policy.capacity} requests immediately when the allowance is full; then one more becomes available after this time, up to ${policy.capacity}.`;
    // AUDHD-04/08/09: connected states explain the coupled quantity/time
    // controls. This is a static calculation from the draft, not a live meter,
    // and never claims the whole allowance returns after one interval.
    get('request-illustration').hidden = !draft.enabled || Boolean(policy.error);
    if (draft.enabled && !policy.error) get('allowance-steps').innerHTML = [
      ['Full allowance', policy.capacity, 'available requests'],
      ['All used at once', 0, 'available requests'],
      [`After ${duration(policy.intervalMs)}`, 1, 'available request'],
      [`After ${duration(policy.intervalMs*2)}`, Math.min(2,policy.capacity), policy.capacity===1?'available request (full)':'available requests'],
    ].map(([label,count,unit])=>`<li><span>${label}</span><strong>${count}</strong><span>${unit}</span></li>`).join('');
    get('request-saved').textContent = saved.enabled ? `Saved in simulation: ${saved.capacity} available requests; one more every ${duration(saved.intervalMs)}. No live service has applied or verified this policy.` : 'Saved in simulation: no request limit. No live service has applied or verified this policy.';
    get('request-errors').textContent = error;
    for (const id of ['request-capacity', 'request-amount']) get(id).setAttribute('aria-invalid', String(Boolean(draft.enabled && error && policy.field === id)));
    for (const id of ['request-capacity', 'request-amount', 'request-unit']) get(id).disabled = !draft.enabled;
    // Keep the shell's attention badge current without rebuilding task controls
    // or moving focus when a draft, validation result or save changes.
    onChange();
  }
  for (const [id, key] of [['limit-enabled', 'enabled'], ['request-capacity', 'capacity'], ['request-amount', 'amount'], ['request-unit', 'unit']]) {
    get(id).addEventListener('input', event => { draft[key] = key === 'enabled' ? event.target.checked : event.target.value; error = ''; update(); });
  }
  get('request-form').onsubmit = event => {
    event.preventDefault();
    const policy = values();
    if (draft.enabled && policy.error) { error = policy.error; update(); get(policy.field).focus(); return; }
    // AUDHD-06 / GUIDE.md#audhd-06-make-saving-and-recovery-understandable:
    // turning off does not coerce or destroy an unfinished numeric draft.
    saved = draft.enabled ? policy : { ...saved, enabled: false };
    savedVersion += 1;
    recordEvent({ description: saved.enabled ? `Saved export request limits: ${saved.capacity} requests available; one more every ${duration(saved.intervalMs)}. No live service was changed.` : 'Saved export request limits as off. No live service was changed.', subject: 'Export request limits', version: savedVersion });
    error = ''; update();
  };
  update();
}
