// AUDHD-06 — ../../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable
// This isolated contract fixture has a persistent fake service and client journal.
// Harbor remains memory-only. Real services must provide atomic revision checks
// and idempotency receipts; localStorage is NOT a cross-tab transaction mechanism.
const $ = id => document.getElementById(id);
const serviceKey = 'recovery-fixture-service', journalKey = 'recovery-fixture-journal';
const initial = () => ({ record: { version: 1, text: 'Original' }, receipts: {}, mutations: 0 });
const clone = value => structuredClone(value);
let service = initial(), journal = { baseline: clone(service.record), draft: 'Original', pending: null };
let storageFault = null, readFailure = false;
let reviewedRecord = null, lastSuccessfulRead = null;
function readSucceeded() {
  lastSuccessfulRead = new Date().toISOString();
  $('freshness').textContent = `Last successful read: ${lastSuccessfulRead}`;
}
function showConflict(record) {
  reviewedRecord = clone(record);
  $('conflict').hidden = false;
  $('remote').textContent = `Newer saved record: ${record.text} (version ${record.version}). Your proposal remains unchanged.`;
}
function storage(method, ...args) {
  if (storageFault === method) throw new Error(`${method} unavailable`);
  return localStorage[method](...args);
}
function reportStorage(error) {
  // A later status message must not erase a storage warning. Recovery confirms
  // only its own operation; it cannot silently certify persistence of new edits.
  $('storage').textContent = `Browser storage unavailable: ${error.message}. Current edits remain in memory; reload recovery is not guaranteed.`;
}
function persist() {
  try { storage('setItem', journalKey, JSON.stringify(journal)); return true; }
  catch (error) { reportStorage(error); return false; }
}
try {
  service = JSON.parse(storage('getItem', serviceKey)) || initial();
  journal = JSON.parse(storage('getItem', journalKey)) || { baseline: clone(service.record), draft: service.record.text, pending: null };
} catch (error) { reportStorage(error); }
function render() {
  if ($('draft').value !== journal.draft) $('draft').value = journal.draft;
  $('saved').textContent = `Known saved record: ${journal.baseline.text} (version ${journal.baseline.version})`;
}
function loadService() { return JSON.parse(localStorage.getItem(serviceKey)) || initial(); }
function accept(operation) {
  service = loadService();
  if (service.receipts[operation.id]) return service.receipts[operation.id];
  if (service.record.version !== operation.version) throw new Error('Conflict: saved record changed. Keep your proposal and review the newer record.');
  service.record = { version: service.record.version + 1, text: operation.text };
  service.receipts[operation.id] = clone(service.record); service.mutations++;
  localStorage.setItem(serviceKey, JSON.stringify(service));
  return service.receipts[operation.id];
}
function recover() {
  if (!journal.pending) { $('status').textContent = 'No submitted change to check.'; return; }
  if (readFailure) { $('status').textContent = 'Submission outcome unavailable. Check again; do not submit another change.'; return; }
  const receipt = loadService().receipts[journal.pending.id];
  readSucceeded();
  if (!receipt) { $('status').textContent = 'No acceptance receipt found. Outcome remains unknown.'; return; }
  // AUDHD-07 — ../../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status
  // Read-only recovery adopts the accepted baseline without replacing newer text.
  // The immutable operation identity survives reload separately from that draft.
  journal.baseline = clone(receipt); journal.pending = null; persist(); render();
  $('status').textContent = 'Submitted change confirmed. Newer draft retained.';
}
$('draft').oninput = () => { journal.draft = $('draft').value; persist(); };
$('save').onclick = () => {
  if (journal.pending) { $('status').textContent = 'Check the existing submitted change first.'; return; }
  const operation = { id: crypto.randomUUID(), version: journal.baseline.version, text: journal.draft };
  journal.pending = operation;
  if (!persist()) { journal.pending = null; $('status').textContent = 'Not submitted: operation identity could not be stored.'; return; }
  try { accept(operation); recover(); } catch (error) { journal.pending = null; persist(); showConflict(loadService().record); $('status').textContent = error.message; }
};
$('recover').onclick = recover;
$('refresh').onclick = () => {
  if (readFailure) { $('status').textContent = 'Refresh unavailable. Previously loaded record retained.'; return; }
  const next = loadService().record;
  readSucceeded();
  if (journal.draft !== journal.baseline.text && next.version === journal.baseline.version) {
    $('status').textContent = 'Saved record unchanged. Your local proposal is retained.'; return;
  }
  if (journal.draft !== journal.baseline.text && next.version !== journal.baseline.version) {
    showConflict(next);
    $('status').textContent = 'Conflict: saved record changed. Your original baseline and local proposal are retained.'; return;
  }
  journal.baseline = clone(next); journal.draft = next.text; persist(); render(); $('status').textContent = 'Latest record loaded.';
};
// AUDHD-06: reconciliation changes only the reviewed baseline, never the local
// proposal or service record. Submission remains a separate deliberate action;
// its revision check rejects another writer arriving after this review.
$('reconcile').onclick = () => {
  if (!reviewedRecord || journal.pending) return;
  journal.baseline = clone(reviewedRecord); reviewedRecord = null;
  $('conflict').hidden = true; persist(); render();
  $('status').textContent = 'Newer baseline adopted. Your proposal is retained; review it and submit deliberately.';
  $('draft').focus();
};
$('clear').onclick = () => {
  try { storage('removeItem', journalKey); $('status').textContent = 'Stored draft removed. Current text remains in memory.'; }
  catch (error) { reportStorage(error); $('status').textContent = 'Stored draft was not removed.'; }
};
// Explicit test controls do not belong to the production-facing example UI.
window.fixture = {
  faults: (method, read = false) => { storageFault = method; readFailure = read; },
  otherWriter(text) { const next = loadService(); next.record = { version: next.record.version + 1, text }; localStorage.setItem(serviceKey, JSON.stringify(next)); },
  state: () => ({ journal: clone(journal), service: loadService(), lastSuccessfulRead }),
};
render();
