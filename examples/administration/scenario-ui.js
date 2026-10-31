import { guideNote } from './guide-notes.js';
import { scenarioState, subscribeScenario, replaceScenario, setConfigurationReadOnly, setDataMode, advanceScenarioTime } from './scenario-state.js';

// AUDHD-03/10/13: teaching choices live outside the task's render subtree.
// Toggling Guide notes only hides this control surface; it neither reverses a
// failure nor clears a draft. Replacement is a separate confirmed action with
// a named loss boundary. See ../../GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards.
export function mountScenarios(container, indicator) {
  container.innerHTML = `<details class="scenario-controls"><summary>Workspace scenarios</summary>
    <p>These scenarios use fictional records and simulated services. Changing data replaces this visit’s work; changing service behavior preserves it.</p>
    <div class="scenario-fields"><label for="scenario-fixture">Workspace data<select id="scenario-fixture"><option value="normal">Normal workspace</option><option value="empty">Empty workspace</option><option value="busy">Busy workspace</option></select></label><button id="scenario-prepare" type="button">Load workspace data…</button></div>
    <div id="scenario-confirm" class="status" hidden><p id="scenario-loss"></p><div class="actions"><button id="scenario-replace" type="button">Replace workspace data</button><button id="scenario-cancel" type="button">Keep current work</button></div></div>
    <div class="scenario-fields"><label for="scenario-rooms">Room search<select id="scenario-rooms"><option value="normal">Normal response</option><option value="loading">Slow response</option><option value="failure">Service unavailable</option></select></label>
      <label for="scenario-notebooks">Notebook browsing<select id="scenario-notebooks"><option value="normal">Normal response</option><option value="loading">Slow response</option><option value="failure">Service unavailable</option><option value="partial">Partial response</option></select></label></div>
    <label class="scenario-permission"><input id="scenario-readonly" type="checkbox"> Configuration is read-only</label><p class="muted">Simulated permission: note settings, notebook configuration and export-request limits cannot be saved. Proposals stay intact. Accounts and ordinary team work remain available.</p>
    <button id="scenario-clock" type="button">Advance export-policy clock by 10 seconds</button>
    <p id="scenario-notice" role="status"></p>
  ${guideNote('scenario-design', 'Different data conditions need different remedies', '<p>Fixture replacement requires confirmation. Failure and permission switches preserve working data; recovery belongs to the ordinary task interface.</p>', ['AUDHD-03', 'AUDHD-07', 'AUDHD-13'])}</details>`;
  const $ = selector => container.querySelector(selector);
  let proposed = null;
  $('#scenario-prepare').onclick = () => {
    proposed = $('#scenario-fixture').value;
    $('#scenario-loss').textContent = `Load ${proposed} workspace data? This replaces notes, accounts, meetings, tasks and requests, including unsaved drafts, submitted requests, checks, filters and this visit’s activity. Your selected skin and Guide-note choices remain. Downloaded files are unchanged.`;
    $('#scenario-confirm').hidden = false; $('#scenario-cancel').focus();
  };
  $('#scenario-cancel').onclick = () => { proposed = null; $('#scenario-confirm').hidden = true; $('#scenario-prepare').focus(); };
  $('#scenario-replace').onclick = () => {
    if (!proposed) return;
    const kind = proposed; proposed = null;
    $('#scenario-confirm').hidden = true; replaceScenario(kind);
    $('#scenario-notice').textContent = `${kind[0].toUpperCase()+kind.slice(1)} workspace loaded. Previous visit records and drafts were replaced.`;
    $('#scenario-prepare').focus();
  };
  for (const resource of ['rooms','notebooks']) $(`#scenario-${resource}`).onchange = event => {
    setDataMode(resource,event.target.value);
    $('#scenario-notice').textContent = `The next ${resource === 'rooms' ? 'room search' : 'notebook refresh'} uses this response. Existing results and drafts are retained.`;
  };
  $('#scenario-readonly').onchange = event => {
    setConfigurationReadOnly(event.target.checked);
    $('#scenario-notice').textContent = event.target.checked ? 'Configuration saving is unavailable. Existing proposals are retained.' : 'Configuration saving is available again. Review retained proposals before saving.';
  };
  $('#scenario-clock').onclick = () => { advanceScenarioTime(10000); $('#scenario-notice').textContent = 'Export-policy clock advanced 10 seconds. No request was submitted.'; };
  const update = () => {
    const state = scenarioState();
    const labels = [`${state.fixture[0].toUpperCase()+state.fixture.slice(1)} workspace`];
    if (state.readOnly) labels.push('Configuration read-only');
    if (state.clockOffset) labels.push(`Export clock +${state.clockOffset/1000} seconds`);
    for (const resource of ['rooms','notebooks']) if (state.modes[resource] !== 'normal') labels.push(`${resource === 'rooms' ? 'Rooms' : 'Notebooks'}: ${state.modes[resource] === 'loading' ? 'slow response' : state.modes[resource]}`);
    indicator.textContent = `Demo scenario · ${labels.join(' · ')}`;
    indicator.hidden = state.fixture === 'normal' && !state.readOnly && !state.clockOffset && Object.values(state.modes).every(mode => mode === 'normal');
    $('#scenario-readonly').checked = state.readOnly;
    for (const resource of ['rooms','notebooks']) $(`#scenario-${resource}`).value = state.modes[resource];
  };
  subscribeScenario(update); update();
}
