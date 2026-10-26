const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const people = [
  { id: 'mira', name: 'Mira', role: 'reader', reason: 'Reviews completed work', version: 1 },
  { id: 'sam', name: 'Sam', role: 'editor', reason: 'Maintains shared notes', version: 1 },
];
const drafts = new Map();
const outcomes = new Map();
const invalid = new Set();
const unavailableChecks = new Set();
let query = '', saveCount = 0;
const draftFor = person => {
  if (!drafts.has(person.id)) drafts.set(person.id, { role: person.role, reason: person.reason });
  return drafts.get(person.id);
};
const changed = person => {
  const draft = drafts.get(person.id);
  return Boolean(draft && (draft.role !== person.role || draft.reason !== person.reason));
};
function pending() {
  const count = people.filter(changed).length;
  $('#pending').textContent = count ? `· ${count} unsaved` : '';
  const person = people.find(person => location.hash === `#people/${person.id}`);
  if (person && $('#draft-status')) {
    $('#draft-status').textContent = changed(person) ? 'Unsaved changes for this person. Verification still checks the saved version.' : 'No unsaved changes for this person.';
    $('#reset').disabled = !changed(person);
    $('#save').disabled = !changed(person);
  }
}
function recordList() {
  const matches = people.filter(person => person.name.toLowerCase().includes(query.toLowerCase()));
  $('#records').innerHTML = matches.map(person => `<li><a href="#people/${person.id}">${person.name}</a> · ${person.role}${changed(person) ? ' · Unsaved changes' : ''}${invalid.has(person.id) ? ' · Needs a reason' : ''}</li>`).join('') || '<li>No matching people. Clear the search to see everyone; drafts are retained.</li>';
}
function showErrors(person) {
  $('#errors').innerHTML = invalid.has(person.id) ? '<p class="error">Not saved. <a href="#reason" id="error-link">Enter a reason for this permission change.</a></p>' : '';
  $('#reason').setAttribute('aria-invalid',String(invalid.has(person.id)));
  if ($('#error-link')) $('#error-link').onclick = event => { event.preventDefault(); $('#reason').focus(); };
}
function verify(person) {
  // A read-only check of the saved simulation; it never calls save or changes a draft.
  if (unavailableChecks.has(person.id)) {
    outcomes.set(person.id, {version:person.version, verified:false, text:`Saved version ${person.version}. Verification pending: the simulated permission service is unavailable. Turn off the failure control and retry verification; no second save is needed.`});
  } else {
    outcomes.set(person.id, {version:person.version, verified:true, text:`Verified saved version ${person.version} in simulation: reading allowed; editing ${person.role === 'editor' ? 'allowed' : 'denied'}. Production integration and durable persistence remain unverified.`});
  }
  $('#outcome').textContent = outcomes.get(person.id).text;
}
function detail(person) {
  const draft = draftFor(person);
  $('#main').innerHTML = `<a href="#people">Back to people</a><p>People / ${person.name}</p><h2>${person.name}: permissions</h2>
    <p>Change access to shared notes for this person. Reader can view; Editor can view and change notes. Neither role manages accounts.</p>
    <p>Saved version ${person.version}: <strong id="saved-role">${person.role}</strong>. Reading is allowed; editing is ${person.role === 'editor' ? 'allowed' : 'denied'}.</p>
    <p id="draft-status" role="status"></p>
    <form class="ui-panel" novalidate aria-label="Edit this person's permissions"><div id="errors" role="alert"></div>
    <label for="role">Role</label><select id="role"><option value="reader">Reader · view notes</option><option value="editor">Editor · view and edit notes</option></select>
    <label>Reason for change<input id="reason" value="${escape(draft.reason)}" aria-describedby="reason-help errors"></label>
    <p id="reason-help">Required so a returning teammate understands the decision. This example keeps it only in memory.</p>
    <div class="actions"><button id="save" type="submit" class="ui-action">Save permissions in simulation</button><button id="reset" type="button">Reset this draft to saved values</button></div></form>
    <section aria-labelledby="verification"><h3 id="verification">Verify saved permissions</h3>
    <p>Check the saved role, independently of any newer unsaved draft.</p>
    <p id="outcome" class="status" role="status">${escape(outcomes.get(person.id)?.text || `Saved version ${person.version}; verification pending. Inspect the saved role, then run its permission check.`)}</p>
    <button id="verify">Verify saved permissions</button><p id="writes">Simulated saves: ${saveCount}</p></section>
    <details><summary>Try a verification failure</summary><label class="inline"><input type="checkbox" id="fail-check">Simulate permission service unavailable</label><p>A failed check leaves the saved change and any newer draft intact.</p></details>`;
  $('#role').value = draft.role;
  $('#fail-check').checked = unavailableChecks.has(person.id);
  $('#fail-check').onchange = event => {
    if (event.target.checked) unavailableChecks.add(person.id);
    else unavailableChecks.delete(person.id);
  };
  showErrors(person);
  pending();
  for (const id of ['role','reason']) $(`#${id}`).oninput = event => {
    draft[id] = event.target.value;
    if (id === 'reason' && draft.reason.trim()) { invalid.delete(person.id); showErrors(person); }
    pending();
  };
  $('#reset').onclick = () => {
    drafts.delete(person.id); invalid.delete(person.id); detail(person); $('#role').focus();
    $('#announcement').textContent = `${person.name}'s draft reset. Saved permissions and other drafts are unchanged.`;
  };
  $('form').onsubmit = event => {
    event.preventDefault();
    if (!changed(person)) return;
    if (!draft.reason.trim()) {
      invalid.add(person.id); showErrors(person);
      $('#error-link').focus();
      return;
    }
    person.role = draft.role; person.reason = draft.reason; person.version++; saveCount++;
    invalid.delete(person.id);
    outcomes.delete(person.id);
    detail(person);
    $('#verify').focus();
  };
  $('#verify').onclick = () => verify(person);
}
function settings() {
  const verified = people.filter(person => outcomes.get(person.id)?.verified && outcomes.get(person.id).version === person.version).length;
  $('#main').innerHTML = `<h2>Workspace settings</h2><p>Common decisions first; technical reference stays available below.</p>
    <section class="ui-panel"><h3>Who can edit notes?</h3><p><strong>Available in simulation. ${verified} of ${people.length} saved records verified.</strong> Inspect a person’s saved role and its allowed and denied actions. New saves require a new check; drafts do not change a saved result.</p><a href="#people">Choose a person</a></section>
    <section class="ui-panel"><h3>Example: a missing mail service</h3><p><strong>Illustrative dependency state.</strong> In a product with an implemented email connector, say which mail service or credential is missing and how to connect it before testing the intended recipient. This demonstration has no email implementation; connecting a service alone would not enable delivery here.</p></section>
    <details><summary>Advanced operations and implementation boundaries</summary>
    <h3>Saved configuration awaiting verification</h3><p><strong>Configurable, verification pending.</strong> After saving a role, its permission check is a separate action. A failed check is not a failed save.</p>
    <h3>Storage location</h3><p><strong>Outside this demonstration's scope.</strong> Data lives in memory and reload restores the fictional records. Durable storage is not implemented here; this is not evidence of a browser or permission restriction. In a real restricted environment, name the actual boundary and permitted alternative.</p>
    <h3>Bulk account import</h3><p><strong>Not implemented.</strong> There is no importer here. This is an implementation gap, not a dependency or permission restriction.</p></details>`;
}
function render() {
  const [route, id] = (location.hash.slice(1) || 'people').split('/');
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === `#${route}`) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
  if (route === 'settings') settings();
  else if (route === 'people' && !id) {
    $('#main').innerHTML = `<h2>People</h2><p>Select a person to inspect and change their permissions.</p><label>Find a person<input id="search" type="search" value="${escape(query)}"></label><button id="clear">Clear search</button><ul class="records" id="records"></ul>`;
    recordList();
    $('#search').oninput = event => { query = event.target.value; recordList(); };
    $('#clear').onclick = () => { query = ''; $('#search').value = ''; recordList(); $('#search').focus(); };
  } else {
    const person = route === 'people' && people.find(person => person.id === id);
    if (person) detail(person);
    else $('#main').innerHTML = '<h2>Destination not found</h2><p>Your drafts are retained.</p><a href="#people">Return to people</a>';
  }
  pending();
}
$('a[href="#main"]').onclick = event => { event.preventDefault(); $('#main').focus(); };
window.addEventListener('hashchange', event => {
  const previous = new URL(event.oldURL).hash;
  render();
  const returnLink = location.hash === '#people' && [...document.querySelectorAll('#records a')].find(link=>link.hash===previous);
  (returnLink || $('#main')).focus();
});
render();
const media = matchMedia('(prefers-color-scheme: dark)');
let skin = 'guillermo';
function applySkin() {
  const systemSkin = media.matches ? 'guillermo' : 'paperwhite';
  document.documentElement.dataset.skin = skin === 'system' ? systemSkin : skin;
  document.querySelector('[data-system-preview]')?.setAttribute('data-skin',systemSkin);
}
media.addEventListener('change',applySkin);
$('#type').onchange = event => document.documentElement.dataset.type = event.target.value;
try {
  const response = await fetch('../../packages/audhd-ui-framework/palette-data.json');
  if (!response.ok) throw Error('Palette registry could not be loaded');
  const palettes = [{id:'system',name:'System appearance',mode:'follows device'},...await response.json()];
  $('#palettes').innerHTML = palettes.map(p => `<label class="palette" data-audhd-ui data-skin="${p.id === 'system' ? (media.matches ? 'guillermo' : 'paperwhite') : p.id}" ${p.id === 'system' ? 'data-system-preview' : ''}><span><input type="radio" name="skin" value="${p.id}" aria-label="${escape(p.name)} (${escape(p.mode)})" ${p.id === skin ? 'checked' : ''}> ${p.name}</span><small>${p.mode}</small><span class="swatches" aria-hidden="true"><i style="background:var(--ui-page)"></i><i style="background:var(--ui-action)"></i><i style="background:var(--ui-active-accent)"></i></span><span aria-hidden="true">Readable text · <span style="background:var(--ui-action);color:var(--ui-on-action)">Action</span> · <span style="background:var(--ui-active-surface);color:var(--ui-active-accent)">Selected</span></span></label>`).join('');
  $('#palettes').onchange = event => { skin = event.target.value; applySkin(); $('#appearance-status').textContent = `${palettes.find(p=>p.id===skin).name} selected. Drafts and navigation retained.`; };
} catch (error) { $('#appearance-status').textContent = `${error.message}. Serve this example over HTTP. The default skin and administration tasks remain available.`; }
