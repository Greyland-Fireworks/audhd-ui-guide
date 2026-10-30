import { renderActivity } from './activity.js';
import { recordEvent } from './events.js';
import { guideNote, restoreGuideNotes, setGuideNotes } from './guide-notes.js';
import { renderRequestSettings, requestSettingsSummary } from './request-settings.js';
import { renderRecovery, recoverySummary } from './recovery.js';
import { notes, notebooks } from './notes-state.js';
import { renderNotes, renderNote, noteDestinations, noteWorkSummary } from './notes.js';
import { renderNotebookSettings, renderWorkspaceSettings, renderTransfer, notesToolsSummary } from './notes-tools.js';
import { renderSchedule, scheduleDestinations, scheduleSummary, renderDayTimeline, updateCalendarPresentation } from './schedule.js';
import { getCalendarEvents, localDate, rooms } from './schedule-state.js';
import { renderWork, workDestinations, workSummary } from './work.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const people = [
  { id: 'mira', name: 'Mira', role: 'reader', reason: 'Reviews completed work', version: 1 },
  { id: 'sam', name: 'Sam', role: 'editor', reason: 'Maintains shared notes', version: 1 },
];
const roleName = role => role === 'editor' ? 'Editor' : 'Reader';
const roleDescription = role => role === 'editor' ? 'Can read and edit notes' : 'Can read notes; cannot edit them';

// AUDHD-01/02/03: one registry owns location, navigation and recognition-based
// discovery. A task's conceptual parent need not match its historical URL:
// Request limits belongs to Exports, while old #settings/requests links survive.
// See ../../GUIDE.md#authoritative-navigation-and-repeated-orientation.
const pages = [
  { path: 'overview', label: 'Overview', group: 'Workspace' },
  { path: 'notes', label: 'Notes', group: 'Notes' },
  { path: 'notes/new', label: 'New note', parent: 'notes', group: 'Notes' },
  { path: 'notebooks', label: 'Notebooks', parent: 'notes', group: 'Notes' },
  { path: 'notes/archive', label: 'Archived notes', parent: 'notes', group: 'Notes' },
  { path: 'notes/trash', label: 'Trash', parent: 'notes', group: 'Notes' },
  { path: 'administration', label: 'Administration', group: 'Administration', alias: 'people' },
  { path: 'people', label: 'Users & access', parent: 'administration', group: 'Administration' },
  ...people.map(p => ({ path: `people/${p.id}`, label: `${p.name}: permissions`, parent: 'people', group: 'Users', record: true, targets: ['role', 'reason', 'verify', 'restore-check'] })),
  { path: 'workspace-settings', label: 'Workspace settings', parent: 'administration', group: 'Administration', targets: ['maxNoteLength','defaultNotebookId'] },
  { path: 'exports', label: 'Note transfers', parent: 'administration', group: 'Administration', alias: 'transfer' },
  { path: 'transfer', label: 'Import & export notes', parent: 'exports', group: 'Exports' },
  { path: 'recovery', label: 'Request a notes export', parent: 'exports', group: 'Exports' },
  { path: 'settings/requests', label: 'Request limits', parent: 'exports', group: 'Exports', targets: ['request-capacity', 'request-amount', 'limit-enabled'] },
  { path: 'activity', label: 'Activity & logs', parent: 'administration', group: 'Administration', alias: 'activity/warnings' },
  { path: 'activity/warnings', label: 'Warnings', parent: 'activity', group: 'Activity' },
  { path: 'activity/all', label: 'All events', parent: 'activity', group: 'Activity' },
  { path: 'directory', label: 'All pages', group: 'Workspace' },
  { path: 'appearance', label: 'Appearance', group: 'Preferences' },
  { path: 'settings', label: 'Capability examples', group: 'Guide demonstrations', teaching: true },
];
// AUDHD-01/03/10: the directory includes current records, not just initial
// fixtures. IDs stay stable across renames; every user-authored label is escaped
// at the HTML boundary. One ancestor walk drives breadcrumbs and discovery.
function syncNotePages() {
  for(let i=pages.length-1;i>=0;i--) if(pages[i].dynamic) pages.splice(i,1);
  pages.push(...noteDestinations().map(page=>({...page,dynamic:true})));
  // AUDHD-01/02: domains contribute their actual destinations to the same
  // registry as notes. The shell never guesses a child from a URL prefix.
  // Insert the task domains before administration, leaving Appearance last.
  const domains = [...scheduleDestinations().map(page=>({...page,domain:'schedule'})), ...workDestinations().map(page=>({...page,domain:'work'}))];
  pages.splice(pages.findIndex(page=>page.path==='people'), 0, ...domains.map(page=>({...page,dynamic:true})));
  pages.find(page=>page.path==='notebooks').targets=[...notebooks.map(book=>book.id),'new'].flatMap(id=>['name','description'].map(field=>`${id}/${field}`));
  pages.find(page=>page.path==='transfer').targets=['import-notes-file','import-copies','download-notes'];
  pages.find(page=>page.path==='notes/new').targets=['title','body','notebookId'];
}
const ancestors = page => {
  const chain=[];
  for(let parent=page?.parent;parent;) {const item=pages.find(p=>p.path===parent);if(!item)break;chain.unshift(item);parent=item.parent;}
  return chain;
};
const pageFor = path => {
  // Recognize only real destinations and declared control links. A mistyped
  // child URL must not silently pretend to be a valid parent page.
  const match = pages.find(p => path === p.path || p.targets?.some(target => path === `${p.path}/${target}`));
  return match?.alias ? pages.find(p => p.path === match.alias) : match;
};
const href = page => `#${page.path}`;
const heading = (title, description) => `<div class="task-heading"><h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</div>`;
let directoryQuery = '', menuOpen = false;
const branches = new Map();
const narrow = matchMedia('(width < 64rem)');
function showMenu() {
  $('#menu-toggle').hidden = !narrow.matches;
  $('#menu-toggle').setAttribute('aria-expanded', String(menuOpen));
  $('#workspace-nav').hidden = narrow.matches && !menuOpen;
  // AUDHD-05/11: teaching controls are optional chrome. On a phone they belong
  // in the complete section menu, leaving the first viewport for actual work.
  // Move the existing button, never clone it or reset its pressed state.
  const guide = $('#guide-toggle'), host = $('#guide-menu-host');
  const wasFocused = document.activeElement === guide;
  const parent = narrow.matches ? host : $('.workspace-header');
  if (guide.parentElement !== parent) parent.append(guide);
  host.hidden = !narrow.matches || !menuOpen;
  if (wasFocused) (narrow.matches && !menuOpen ? $('#menu-toggle') : guide).focus();
}
$('#menu-toggle').onclick = () => { menuOpen = !menuOpen; showMenu(); };
$('#workspace-nav').addEventListener('click', event => {
  const toggle = event.target.closest('[data-branch]');
  if (toggle) {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    branches.set(toggle.dataset.branch, open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ${toggle.dataset.label} pages`);
    document.getElementById(toggle.getAttribute('aria-controls')).hidden = !open;
  }
  if (event.target.closest('a')) {
    if (narrow.matches) { menuOpen = false; showMenu(); }
    $('#main').focus();
  }
});
// The narrow section menu also owns Guide notes; Escape must work from either
// area and return focus to the visible trigger after the menu is hidden.
$('.sidebar').addEventListener('keydown', event => {
  if (event.key === 'Escape' && narrow.matches) { menuOpen = false; showMenu(); $('#menu-toggle').focus(); }
});
narrow.addEventListener('change', () => {
  // AUDHD-05/11: reflow can hide the focused navigation item. Return to the
  // named menu trigger instead of leaving keyboard focus on an invisible link.
  const focusInMenu = $('#workspace-nav').contains(document.activeElement);
  menuOpen = false; showMenu();
  if (narrow.matches && focusInMenu) $('#menu-toggle').focus();
  const path = $('#breadcrumb-path');
  if (path) {
    const focusedAncestor = path.contains(document.activeElement);
    const toggle = $('#breadcrumb-toggle');
    const focusedToggle = document.activeElement === toggle;
    path.hidden = narrow.matches;
    toggle.hidden = !narrow.matches;
    toggle.setAttribute('aria-expanded', 'false');
    if (narrow.matches && focusedAncestor) toggle.focus();
    if (!narrow.matches && focusedToggle) $('#breadcrumbs > a').focus();
  }
});
function navigation(path) {
  const current = pageFor(path);
  const chain = ancestors(current);
  const activeRoot = chain[0] || current;
  // AUDHD-01/03/05: automatic expansion follows only the current ancestry.
  // Store explicit toggle choices separately; otherwise visiting several tasks
  // leaves every old branch open and obscures the current location. A manually
  // collapsed current branch keeps its location text and all breadcrumb links.
  const item = page => {
    const children = pages.filter(p => p.parent === page.path && !p.record);
    const open = branches.has(page.path) ? branches.get(page.path) : chain.includes(page) || page === current;
    return `<div class="nav-group" ${activeRoot?.path === page.path ? 'data-active="true"' : ''}>
      <div class="nav-parent"><a href="${href(page)}" data-nav="${page.path}" ${chain.includes(page) ? 'data-ancestor="true"' : ''} ${current?.path === page.path ? 'aria-current="page"' : ''}><span>${escape(page.label)}</span><span class="nav-count" data-count="${page.path}" aria-hidden="true" hidden></span></a>
      ${children.length ? `<button type="button" data-branch="${page.path}" data-label="${page.label}" aria-label="${open ? 'Hide' : 'Show'} ${page.label} pages" aria-expanded="${open}" aria-controls="nav-${page.path}"></button>` : ''}</div>
      ${children.length ? `<ul class="nav-children" id="nav-${page.path}" ${open ? '' : 'hidden'}>${children.map(child => `<li>${item(child)}</li>`).join('')}</ul>` : ''}
      ${children.length && activeRoot?.path === page.path && current !== activeRoot ? `<span class="nav-location">Current: ${escape(current.label)}</span>` : ''}</div>`;
  };
  const order = ['overview','calendar','work','notes','administration','directory','appearance'];
  $('#workspace-nav').innerHTML = pages.filter(p => !p.parent && !p.teaching).sort((a,b)=>order.indexOf(a.path)-order.indexOf(b.path)).map(item).join('');
  menuOpen = false;
  $('#menu-toggle').textContent = `Sections · ${(current?.record ? activeRoot : current)?.label || 'Destination not found'}`;
  showMenu();
  breadcrumbs(current);
}
function breadcrumbs(current) {
  // AUDHD-01/02: Harbor Team Hub is the home destination, not a decorative label.
  // Overview is that same page, so it must not appear as its own child. Native
  // hash links use the existing history/focus path and preserve task drafts.
  const home = pages.find(page => page.path === 'overview');
  const atHome = current === home;
  const chain = ancestors(current);
  // AUDHD-01/05/11: long record ancestry must not consume a phone's first
  // viewport at enlarged text sizes. Home stays visible; a disclosure button
  // retains every ancestor link. The task heading identifies the current page.
  const trail = `${chain.map(parent=>`<span aria-hidden="true">/</span><a href="${href(parent)}">${escape(parent.label)}</a>`).join('')}<span aria-hidden="true">/</span><span aria-current="page">${escape(current?.label || 'Destination not found')}</span>`;
  $('#breadcrumbs').innerHTML = `<a href="${href(home)}" ${atHome ? 'aria-current="page"' : ''}>Harbor Team Hub</a>${atHome ? '' : `<button id="breadcrumb-toggle" type="button" aria-label="Page path" aria-controls="breadcrumb-path" aria-expanded="false" ${narrow.matches ? '' : 'hidden'}>Path</button><span id="breadcrumb-path" ${narrow.matches ? 'hidden' : ''}>${trail}</span>`}`;
  if (!atHome) $('#breadcrumb-toggle').onclick = event => {
    const path = $('#breadcrumb-path');
    path.hidden = !path.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!path.hidden));
  };
  document.title = `${current?.label || 'Destination not found'} · Harbor Team Hub demo`;
}

// AUDHD-06/07/10: records are the saved simulation, drafts are independent per
// person, and outcomes refer to a saved version. Route rendering is a view of
// these owners, never a reset. No browser storage or real authorization exists.
const drafts = new Map(), outcomes = new Map();
const invalid = new Set(), unavailableChecks = new Set();
let query = '', saveCount = 0;
const draftFor = person => {
  if (!drafts.has(person.id)) drafts.set(person.id, { role: person.role, reason: person.reason });
  return drafts.get(person.id);
};
const changed = person => {
  const draft = drafts.get(person.id);
  return Boolean(draft && (draft.role !== person.role || draft.reason !== person.reason));
};
const hasVerifiedSavedVersion = person => Boolean(outcomes.get(person.id)?.verified && outcomes.get(person.id).version === person.version);
function checkStatus(person) {
  // AUDHD-04/07: missing evidence is review work, not a detected access breach.
  // An unavailable checker is a warning about the check, not a failed save.
  // The same description is used on both account lists and the detail page.
  if (hasVerifiedSavedVersion(person)) return { level: 'success', title: 'Check passed', text: `Reading allowed; editing ${person.role === 'editor' ? 'allowed' : 'denied'}. This matches the saved role.`, target: 'verify', action: 'Recheck saved access' };
  if (outcomes.get(person.id)?.verified === false) return {
    level: 'warning', title: 'Warning · Check unavailable', text: 'The check could not run. Saved access is unchanged; no permission failure has been established.',
    target: unavailableChecks.has(person.id) ? 'restore-check' : 'verify', action: unavailableChecks.has(person.id) ? 'Restore access check' : 'Retry access check',
  };
  return { level: 'review', title: 'Review · Access check needed', text: 'Reading and editing have not been tested for this saved role.', target: 'verify', action: 'Check saved access' };
}
function attention(person) {
  // Count each account once even if it has both a draft and an unchecked save.
  // All states remain visible on its card; the strongest next step is primary.
  if (invalid.has(person.id)) return { level: 'error', target: 'reason', action: 'Enter a reason', title: 'Error · Change not saved', text: 'A reason is required before this change can be saved.' };
  const check = checkStatus(person);
  if (check.level === 'warning') return check;
  if (changed(person)) return { level: 'review', target: 'role', action: 'Review changes', title: 'Review · Unsaved change', text: `Proposed role: ${roleName(draftFor(person).role)}. The saved role still applies.` };
  if (!hasVerifiedSavedVersion(person)) return check;
  return null;
}
function updateNavigationAttention() {
  // AUDHD-04/07/08: a problem count is not a population or unfinished-work
  // count. Unchecked roles and ordinary drafts remain visible in their task,
  // but only observed errors/warnings raise the Overview indicator. Count each
  // affected account once, independently of filters and historical log events.
  // Patch the badge/name only; replacing navigation would lose keyboard focus.
  const accounts = people.filter(p => ['error', 'warning'].includes(attention(p)?.level)).length;
  const policy = requestSettingsSummary(), recovery = recoverySummary();
  const notesWork = noteWorkSummary(), toolWork = notesToolsSummary();
  const hubWork = [...scheduleSummary(),...workSummary()];
  const problems = accounts + Number(Boolean(policy?.hasProblem)) + Number(Boolean(recovery?.hasProblem)) + [...notesWork,...toolWork,...hubWork].filter(item=>item.hasProblem).length;
  const adminProblems = accounts + Number(Boolean(policy?.hasProblem)) + Number(Boolean(recovery?.hasProblem)) + toolWork.filter(item=>item.hasProblem && !item.href.startsWith('#notebooks')).length;
  const counts = { overview: problems, notes: notes.filter(note=>note.status==='active').length, people: people.length, administration:adminProblems, calendar:scheduleSummary().filter(item=>item.hasProblem).length, work:workSummary().filter(item=>item.hasProblem).length, exports: Number(Boolean(policy?.hasProblem)) + Number(Boolean(recovery?.hasProblem)) + toolWork.filter(item=>item.hasProblem && item.href.startsWith('#transfer')).length };
  for (const [path, count] of Object.entries(counts)) {
    const link = $(`[data-nav="${path}"]`), badge = $(`[data-count="${path}"]`);
    if (!link || !badge) continue;
    badge.textContent = count;
    badge.hidden = count === 0;
    const problemCount = ['overview','calendar','work','administration','exports'].includes(path);
    badge.dataset.kind = problemCount ? 'problem' : 'count';
    const description = path === 'people' ? `${count} configured user accounts` : path === 'notes' ? `${count} active notes`
      : problemCount ? `${count} ${count === 1 ? 'item' : 'items'} with a problem`
      : `${count} ${count === 1 ? 'item needs' : 'items need'} attention`;
    link.setAttribute('aria-label', `${pages.find(p => p.path === path).label}${count ? ` — ${description}` : ''}`);
    badge.title = description;
  }
}
function pending() {
  updateNavigationAttention();
  const person = people.find(p => location.hash.split('/')[1] === p.id);
  if (person && $('#draft-status')) {
    $('#proposed-role').textContent = roleName(draftFor(person).role);
    $('#proposed-access').textContent = roleDescription(draftFor(person).role);
    $('#comparison-state').textContent = changed(person) ? 'Proposed · not saved' : 'Same as saved';
    $('#draft-status').textContent = changed(person) ? `Unsaved changes. Checking permissions still checks the saved ${roleName(person.role)} access.` : 'No unsaved changes.';
    $('#reset').disabled = !changed(person); $('#save').disabled = !changed(person);
    $('#check-next').textContent = hasVerifiedSavedVersion(person)
      ? changed(person) ? 'The saved role passed. Your unsaved changes still need review and saving.' : 'No further action is needed for this saved role.'
      : '';
  }
}
function accountCard(person, headingLevel = 2) {
  const check = checkStatus(person), next = attention(person);
  const draftIssue = invalid.has(person.id) ? { level: 'error', text: 'Change not saved: enter a reason.' }
    : changed(person) ? { level: 'review', text: `Unsaved change: proposed role ${roleName(draftFor(person).role)}. Saved access is unchanged.` } : null;
  const checkIsPrimary = next && ['verify','restore-check'].includes(next.target);
  // AUDHD-02/07/09 / GUIDE.md#status-first-operational-overviews: identity,
  // saved role, check evidence and actions share one outline. The filtered
  // user list keeps the remedy attached to its account, never in a remote panel.
  // Links reveal the actual owning controls; visiting a card never runs a check.
  return `<li class="person-card ui-panel" id="account-${person.id}">
    <h${headingLevel}><a href="#people/${person.id}">${person.name}</a></h${headingLevel}>
    <p class="account-role"><span>Saved role: <strong>${roleName(person.role)}</strong></span><span>${roleDescription(person.role)}</span></p>
    <div class="account-status" data-level="${check.level}"><strong>${check.title}</strong><p>${check.text}</p></div>
    ${draftIssue ? `<p class="account-status" data-level="${draftIssue.level}">${draftIssue.text}</p>` : ''}
    <div class="account-actions actions">
      ${next && !checkIsPrimary && next.target !== 'role' ? `<a class="task-link ui-action" href="#people/${person.id}/${next.target}" aria-label="${next.action} for ${person.name}">${next.action}</a>` : ''}
      <a class="task-link ${checkIsPrimary ? 'ui-action' : ''}" href="#people/${person.id}/${check.target}" aria-label="${check.action} for ${person.name}">${check.action}</a>
      <a class="task-link ${next?.target === 'role' ? 'ui-action' : ''}" href="#people/${person.id}/role" aria-label="Change ${person.name}’s role">Change role</a>
    </div></li>`;
}
function accountAttentionSummary() {
  const accounts = people.filter(attention);
  const hasProblem = accounts.some(p => ['error','warning'].includes(attention(p).level));
  return `<section class="attention-summary" aria-labelledby="attention-title">
    <h2 id="attention-title">${accounts.length ? `${accounts.length} ${accounts.length === 1 ? 'account needs' : 'accounts need'} attention` : 'All saved access checks passed'}</h2>
    <p>${accounts.length ? hasProblem ? 'Review the marked issues below. Each account has an action for its current issue.' : 'Review work: check saved access or finish unsaved changes. An unchecked role is not a confirmed access failure.' : 'No unsaved account changes. Reading and editing match each saved role.'}</p>
    ${accounts.length ? `<ul class="attention-links">${accounts.map(p => { const state = attention(p); return `<li><a href="#people/${p.id}/${state.target}">${p.name}: ${state.action}</a></li>`; }).join('')}</ul>` : ''}
  </section>`;
}
const accountScope = () => `<details class="context-help account-scope"><summary>ⓘ What does “configured account” mean?</summary><p>Each listed account has a saved role in this demo. This is not a count of users currently signed in or awaiting activation; those states are not modeled here. Users &amp; access shows the total account count. Overview shows a warning count only for current problems; unchecked roles and unsaved drafts remain listed here as review work.</p></details>`;
// AUDHD-01/04/07/09: coordination is the home task. A problem row combines
// subject, consequence and a route to the remedy. Drafts and unchecked evidence
// stay separate, so the home screen never teaches that "not checked" means broken.
function overviewItems() {
  const accountWork = people.map(person => {
    const item = attention(person);
    return item && { ...item, text: item.text, label: `${person.name}: ${item.action}`, href: `#people/${person.id}/${item.target}`, administration: true, hasProblem: ['error','warning'].includes(item.level) };
  }).filter(Boolean);
  const settings = requestSettingsSummary();
  return [...scheduleSummary(), ...workSummary(), ...noteWorkSummary(), ...notesToolsSummary().map(item=>({...item,administration:true})), ...accountWork, settings && {...settings,administration:true}].filter(Boolean);
}
function overview() {
  const items = overviewItems();
  const problems = items.filter(item=>item.hasProblem);
  const resume = items.filter(item=>!item.hasProblem && !item.administration);
  const admin = items.filter(item=>!item.hasProblem && item.administration);
  const today = localDate();
  const scheduled = getCalendarEvents().filter(event=>event.status==='scheduled').sort((a,b)=>`${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  const events = scheduled.filter(event=>event.date===today);
  const now = new Date();
  const next = scheduled.find(event=>new Date(`${event.date}T${event.endTime}`)>now);
  // AUDHD-01/08: make the next commitment readable without reconstructing a
  // small timeline mark. The schedule remains the authority; canceled/past
  // events cannot masquerade as an upcoming meeting. No attendance is inferred.
  const nextMeeting = next ? `<div class="hub-next-meeting"><span>${new Date(`${next.date}T${next.startTime}`)<=now ? 'Scheduled now' : 'Next meeting'}</span><h3><a href="#meeting/${next.id}">${escape(next.title)}</a></h3><p><time datetime="${next.date}T${next.startTime}">${escape(new Date(`${next.date}T${next.startTime}`).toLocaleDateString([], {weekday:'short',month:'short',day:'numeric'}))} · ${next.startTime}–${next.endTime}</time> <strong>${(new Date(`${next.date}T${next.endTime}`)-new Date(`${next.date}T${next.startTime}`))/60000} minutes</strong></p><p>${escape(rooms.find(room=>room.id===next.roomId)?.name || 'Room unavailable')}</p></div>` : '<p>No upcoming meetings are scheduled.</p>';
  const row = item => `<li class="hub-work-item ${item.hasProblem?'hub-problem':''}"><span class="work-symbol" aria-hidden="true">${item.hasProblem?'!':'↪'}</span><div>${item.actionLabel ? `<strong>${escape(item.label || item.text)}</strong>${item.meta ? `<span class="hub-owner">${escape(item.meta)}</span>`:''}<p>${escape(item.text)}</p><a href="${item.href}">${escape(item.actionLabel)}</a>` : `<a href="${item.href}">${escape(item.label || item.text)}</a>${item.label && item.text ? `<p>${escape(item.text)}</p>`:''}`}</div></li>`;
  $('#main').innerHTML = heading('Team overview', 'Coordinate the Harbor project team’s meetings, notes and follow-up work.') + `
    <div class="hub-day-heading"><time datetime="${today}">${escape(new Date(`${today}T12:00`).toLocaleDateString([], {weekday:'long',month:'long',day:'numeric'}))}</time><span>${events.length} scheduled ${events.length===1?'meeting':'meetings'} today · ${escape(Intl.DateTimeFormat().resolvedOptions().timeZone)}</span></div>
    <div class="hub-overview-grid">
      <section class="ui-panel hub-today" aria-labelledby="today-title"><div class="panel-heading"><h2 id="today-title">Today’s meetings</h2><a href="#calendar/week">Open week calendar</a></div>
        ${nextMeeting}${renderDayTimeline(today,events,{compact:true,showHeading:false})}
      </section>
      <div class="hub-work-stack">
        <section class="ui-panel" aria-labelledby="problem-title"><h2 id="problem-title">Problems to resolve</h2><ul class="hub-work-list" id="hub-problems">${problems.map(row).join('') || '<li>No current problems.</li>'}</ul><div id="recovery-problem"></div></section>
        <section class="ui-panel" aria-labelledby="resume-title"><h2 id="resume-title">Ready to continue</h2><ul class="hub-work-list" id="hub-resume">${resume.map(row).join('') || '<li>No unfinished coordination work.</li>'}</ul></section>
      </div>
    </div>
    ${guideNote('overview-design', 'Let layout explain time and priorities', '<p>The timeline places meetings by their actual start and duration. Empty space means available time, not missing content. The adjacent queues separate observed problems from drafts and unchecked evidence; each row links to the owning task. These are fictional session records, not live organizational data.</p><p>The sidebar’s warning counts exclude unchecked access and routine drafts. The home page does not repeat the account directory or embed independent workflows. Appearance and view changes never mutate the records summarized here.</p>', ['AUDHD-01','AUDHD-02','AUDHD-04','AUDHD-07','AUDHD-08','AUDHD-09','AUDHD-12'])}`;
  const adminSection = document.createElement('section');
  adminSection.className = 'hub-administration';
  adminSection.setAttribute('aria-labelledby','admin-review-title');
  adminSection.innerHTML = `<h2 id="admin-review-title">Administration review</h2><p class="muted">Routine checks and unfinished settings. An unchecked permission is not a confirmed failure.</p><ul class="hub-work-list" id="hub-admin">${admin.map(row).join('') || '<li>No routine administration work.</li>'}</ul><div id="recovery-summary"></div>`;
  $('.hub-overview-grid').after(adminSection);
  updateRecoverySummary();
}
function updateRecoverySummary() {
  updateNavigationAttention();
  const region = $('#recovery-summary'), problemRegion = $('#recovery-problem');
  if (!region || !problemRegion) return;
  const recovery = recoverySummary();
  // AUDHD-05/06: keep the receipt's actual link when its classification changes.
  // Moving a focused node can drop browser focus; restore that same link without
  // scrolling or replacing the surrounding timeline and other pending work.
  let row = region.firstElementChild || problemRegion.firstElementChild;
  const focused = row?.contains(document.activeElement);
  if (recovery?.needsAttention || recovery?.hasProblem) {
    const target = recovery.hasProblem ? problemRegion : region;
    target.hidden = false;
    if (!row) { row = document.createElement('p'); row.className = 'status'; row.innerHTML = '<a href="#recovery"></a>'; }
    row.querySelector('a').textContent = recovery.text;
    if (row.parentElement !== target) target.append(row);
    if (focused) row.querySelector('a').focus({preventScroll:true});
  } else row?.remove();
  region.hidden = !recovery?.needsAttention || Boolean(recovery?.hasProblem);
  problemRegion.hidden = !recovery?.hasProblem;
}
function recordList() {
  const matches = people.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  $('#people-count').textContent = `${matches.length} of ${people.length} configured accounts shown`;
  $('#records').innerHTML = matches.map(person => accountCard(person)).join('') || '<li class="ui-panel">No matching users. Clear the filter to see everyone; drafts are retained.</li>';
}
function peoplePage() {
  $('#main').innerHTML = heading('Users & access', 'Check or change access to the Harbor project team’s meeting notes and decisions.') + `
    ${accountAttentionSummary()}
    <div class="filter-bar"><label for="search">Filter users<input id="search" type="search" value="${escape(query)}" placeholder="For example, Mira"></label><button id="clear">Clear filter</button><span id="people-count" role="status"></span></div><ul class="card-grid people-cards" id="records"></ul>
    ${accountScope()}
    ${guideNote('people-design', 'Browse before searching', '<p>Every account is listed on entry. Each card puts its saved role, check status and direct action together. The summary and sidebar counts cover all accounts, even when this list is filtered. Filtering is retained on return; appearance changes and inspecting another account never discard a draft.</p>', ['AUDHD-02','AUDHD-03','AUDHD-05','AUDHD-07','AUDHD-10'])}`;
  recordList();
  $('#search').oninput = event => { query = event.target.value; recordList(); };
  $('#clear').onclick = () => { query = ''; $('#search').value = ''; recordList(); $('#search').focus(); };
}
function showErrors(person) {
  $('#errors').innerHTML = invalid.has(person.id) ? '<p class="error">Not saved. <a href="#reason" id="error-link">Enter a reason for this permission change.</a></p>' : '';
  $('#reason').setAttribute('aria-invalid', String(invalid.has(person.id)));
  if ($('#error-link')) $('#error-link').onclick = event => { event.preventDefault(); $('#reason').focus(); };
}
function updateVerification(person) {
  const outcome = outcomes.get(person.id);
  const state = checkStatus(person);
  const passed = hasVerifiedSavedVersion(person);
  $('#check-status').dataset.level = state.level;
  $('#check-title').textContent = state.title;
  $('#outcome').textContent = outcome?.text || `${roleName(person.role)} access is saved. Check whether reading and editing match that saved choice.`;
  $('#permission-results').innerHTML = passed ? `<dl class="permission-results"><div><dt>Read notes</dt><dd>Allowed</dd></div><div><dt>Edit notes</dt><dd>${person.role === 'editor' ? 'Allowed' : 'Denied'}</dd></div></dl>` : '';
  $('#check-receipt').innerHTML = outcome ? `Check ${outcome.attempt} · <time datetime="${outcome.checkedAt}">${new Date(outcome.checkedAt).toLocaleTimeString()}</time> · Simulated permissions only` : '';
  $('#check-return').hidden = !passed;
  $('#restore-check').hidden = !unavailableChecks.has(person.id);
  $('#verify').textContent = passed ? 'Check again' : outcome ? 'Retry access check' : 'Check saved access';
  $('#verify').classList.toggle('ui-action', !passed && !unavailableChecks.has(person.id));
}
function verify(person) {
  // AUDHD-06/07/12: this is an independent read-only check of the saved role.
  // It cannot persist a newer draft, increment the save count or certify a real
  // service. See ../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable.
  const failed = unavailableChecks.has(person.id);
  const attempt = (outcomes.get(person.id)?.attempt || 0) + 1;
  outcomes.set(person.id, { version: person.version, verified: !failed, attempt, checkedAt: new Date().toISOString(), text: failed
    ? `${roleName(person.role)} access remains saved. The simulated permission check is unavailable. Restore the check service below, then retry; no second save is needed.`
    : `${person.name} can read notes${person.role === 'editor' ? ' and edit them' : ' but cannot edit them'}. These permissions match the saved ${roleName(person.role)} role.` });
  recordEvent({ level: failed ? 'warning' : 'info', subject: person.id, version: person.version,
    description: failed ? `${person.name}’s saved access could not be checked.` : `${person.name}’s saved ${roleName(person.role)} access passed its check.`,
    action: failed ? 'Saved access is unchanged. Restore the simulated check service and retry the permission check.' : 'Reading is allowed; editing is ' + (person.role === 'editor' ? 'allowed.' : 'denied.'),
    href: `#people/${person.id}/${failed ? 'restore-check' : 'verify'}`, actionLabel: failed ? 'Restore access check' : 'Review saved access' });
  updateVerification(person);
  pending();
  // AUDHD-05/07/09: an explicit check ends at its visible result, not at an
  // unchanged trigger. Focus the named outcome and reveal its local next step;
  // repeat checks receive a fresh receipt even when the permissions are equal.
  // This synchronous simulation needs no invented loading delay. Ordinary
  // edits, appearance changes and restoring a checker never move focus here.
  $('#check-title').focus({ preventScroll: true });
  $('#check-status').scrollIntoView({ block: 'nearest' });
}
function detail(person) {
  const draft = draftFor(person);
  $('#main').innerHTML = `<a class="back-link" href="#people">← Back to users</a>` + heading(`${person.name}: permissions`, 'Choose whether this user can read or edit the Harbor project team’s meeting notes and decisions.') + `
    <!-- AUDHD-04/06: aligned saved/proposed panels separate effect from intention.
         Input handlers update only the proposed text, retaining control identity. -->
    <div class="access-comparison" aria-label="Compare saved and proposed access"><section><h2>Saved access</h2><strong id="saved-role">${roleName(person.role)}</strong><p>${roleDescription(person.role)}</p></section><section><h2 id="comparison-state">Proposed · not saved</h2><strong id="proposed-role">${roleName(draft.role)}</strong><p id="proposed-access">${roleDescription(draft.role)}</p></section></div>
    <form class="ui-panel" novalidate aria-label="Edit this person's permissions"><h2>Change access</h2><div id="errors" role="alert"></div>
      <fieldset class="role-fieldset"><legend>Access to shared notes</legend><div class="role-choices" id="role">${['reader','editor'].map(role => `<label class="role-choice"><input type="radio" name="role" value="${role}" ${draft.role === role ? 'checked' : ''}><span><strong>${roleName(role)}</strong><span>${roleDescription(role)}</span></span></label>`).join('')}</div></fieldset>
      <label for="reason">Reason for change<input id="reason" value="${escape(draft.reason)}" aria-describedby="reason-help errors" required></label>
      <p id="reason-help">Explain why this person needs the access. Example: “Mira will update the meeting notes.” Required in this practice task.</p>
      <details class="context-help" data-guide-key="access-help"><summary>ⓘ About these access choices</summary><ul><li>Reader lets someone consult the notes without changing them.</li><li>Editor also lets them change the notes. Choose it when they need to contribute.</li><li>Neither role lets this person manage accounts. Your unsaved selection has no effect until you save it.</li></ul></details>
      <p id="draft-status" role="status"></p><div class="actions"><button id="save" type="submit" class="ui-action">Save permissions</button><button id="reset" type="button">Discard this person’s changes</button></div><p class="muted">Saved for this visit only. Refreshing the page resets even saved changes.</p>
      ${guideNote('access-design', 'Explain the choice where it is made', '<p>The role cards are native radio buttons, so only one access level can be selected. Scope, consequences and ordinary help share the form’s outline. Discard applies to this person only; it cannot erase another draft.</p>', ['AUDHD-02','AUDHD-04','AUDHD-09','AUDHD-13'])}
    </form>
    <section class="ui-panel access-verification" aria-labelledby="verification"><h2 id="verification">Check ${person.name}’s saved access</h2><p>${person.name}’s saved role: <strong>${roleName(person.role)}</strong>. Test whether reading and editing match this role. Any newer unsaved choice stays separate.</p>
      <div class="actions"><button id="verify" class="ui-action">Check saved access</button><button id="restore-check" class="ui-action" type="button" hidden>Restore simulated check service</button></div>
      <div id="check-status" class="account-status" role="region" aria-labelledby="check-title"><h3 id="check-title" tabindex="-1" aria-describedby="outcome"></h3><p id="outcome"></p><div id="permission-results"></div><p id="check-receipt" class="muted"></p><p id="check-next"></p><a id="check-return" class="task-link ui-action" href="#people" hidden>Back to users</a></div>
      ${guideNote('verification-design', 'Save and check are separate operations', `<p>Each check belongs to the saved version. A new save invalidates the previous result, while a verification retry never saves or changes your draft.</p><p id="writes">Simulated saves: ${saveCount}</p><p>These results demonstrate the simulation’s role rules, not authorization against a production service.</p><label class="inline"><input type="checkbox" id="fail-check" ${unavailableChecks.has(person.id) ? 'checked' : ''}>Simulate permission service unavailable</label>`, ['AUDHD-06','AUDHD-07','AUDHD-12'])}
    </section>`;
  $('#fail-check').onchange = event => {
    if (event.target.checked) unavailableChecks.add(person.id); else unavailableChecks.delete(person.id);
    updateVerification(person);
  };
  $('#restore-check').onclick = () => {
    unavailableChecks.delete(person.id); $('#fail-check').checked = false;
    updateVerification(person); $('#verify').focus();
    $('#announcement').textContent = 'Simulated check service restored. Retry the permission check; your saved access and draft are unchanged.';
  };
  showErrors(person); updateVerification(person); pending();
  for (const input of document.querySelectorAll('[name="role"],#reason')) input.oninput = event => {
    draft[event.target.name === 'role' ? 'role' : 'reason'] = event.target.value;
    if (event.target.id === 'reason' && draft.reason.trim()) { invalid.delete(person.id); showErrors(person); }
    pending();
  };
  $('#reset').onclick = () => {
    drafts.delete(person.id); invalid.delete(person.id); detail(person); restoreGuideNotes($('#main'));
    $('[name="role"]:checked').focus();
    $('#announcement').textContent = `${person.name}’s draft discarded. Saved access and other drafts are unchanged.`;
  };
  $('form').onsubmit = event => {
    event.preventDefault();
    if (!changed(person)) return;
    if (!draft.reason.trim()) { invalid.add(person.id); showErrors(person); pending(); $('#error-link').focus(); return; }
    // Saving is the only permission mutation. Invalidate prior evidence before
    // presenting a fresh check action, and retain every other person's draft.
    person.role = draft.role; person.reason = draft.reason; person.version++; saveCount++;
    invalid.delete(person.id); outcomes.delete(person.id);
    recordEvent({ description: `${person.name}’s ${roleName(person.role)} access was saved.`, subject: person.id, version: person.version, action: 'The saved access still needs its permission check.', href: `#people/${person.id}/verify`, actionLabel: 'Check saved access' });
    detail(person); restoreGuideNotes($('#main')); $('#verify').focus();
  };
  $('#verify').onclick = () => verify(person);
}
function directory() {
  $('#main').innerHTML = heading('All pages', 'Browse the workspace by task. Every destination is available without searching.') + `
    <div class="filter-bar"><label for="page-filter">Filter pages<input id="page-filter" type="search" value="${escape(directoryQuery)}" placeholder="For example, permissions"></label><button id="clear-pages">Clear filter</button><span id="directory-count" role="status"></span></div><div id="page-directory" class="card-grid"></div>
    ${guideNote('directory-design', 'A browsable hierarchy', '<p>Each card is a task family. Child pages are indented under their parent; only siblings are alphabetized. Filtering retains the matching page’s ancestry instead of returning a disconnected label. Cards reflow in document order without sideways navigation.</p>', ['AUDHD-01','AUDHD-02','AUDHD-03','AUDHD-11'])}`;
  function list() {
    const term = directoryQuery.trim().toLowerCase();
    const matches = new Set(pages.filter(p => {
      return `${p.label} ${p.group} ${ancestors(p).map(item=>item.label).join(' ')}`.toLowerCase().includes(term);
    }).map(p => p.path));
    // AUDHD-02/03: retain ancestors when a child matches, not unrelated siblings.
    // Parent-first ordering is more informative than globally sorting every link.
    const visible = new Set(matches);
    for (const p of pages) if (matches.has(p.path)) for(const parent of ancestors(p)) visible.add(parent.path);
    const ordered = items => [...items].sort((a,b) => a.label.localeCompare(b.label));
    const link = p => `<a href="${href(p)}">${escape(p.label)}</a>`;
    const children = root => ordered(pages.filter(p => p.parent === root.path && visible.has(p.path)));
    const tree = page => `<li>${link(page)}${children(page).length ? `<ul class="directory-children">${children(page).map(tree).join('')}</ul>` : ''}</li>`;
    const groupNames = [...new Set(pages.filter(p => visible.has(p.path) && !p.parent).map(p => p.group))];
    $('#page-directory').innerHTML = groupNames.map(group => {
      const roots = ordered(pages.filter(p => p.group === group && !p.parent && visible.has(p.path)));
      if (roots.length === 1 && children(roots[0]).length) return `<section class="directory-card ui-panel"><h2>${link(roots[0])}</h2><ul class="directory-children">${children(roots[0]).map(tree).join('')}</ul></section>`;
      return `<section class="directory-card ui-panel"><h2>${group}</h2><ul>${roots.map(tree).join('')}</ul></section>`;
    }).join('') || '<p class="ui-panel">No matching pages. Clear the filter to restore the complete directory.</p>';
    $('#directory-count').textContent = term ? `${matches.size} matching destinations · parent context retained` : `${pages.length} destinations`;
  }
  $('#page-filter').oninput = event => { directoryQuery = event.target.value; list(); };
  $('#clear-pages').onclick = () => { directoryQuery = ''; $('#page-filter').value = ''; list(); $('#page-filter').focus(); };
  list();
}
function capabilities() {
  const verified = people.filter(hasVerifiedSavedVersion).length;
  $('#main').innerHTML = heading('Capability examples', 'Guide demonstration: different limits need different explanations.') + `<div class="card-grid">
    <section class="ui-panel"><h2>Available here</h2><p>Permission checks are implemented in this simulation. ${verified} of ${people.length} saved records verified.</p><a href="#people">Choose a user</a></section>
    <section class="ui-panel"><h2>Missing prerequisite</h2><p>In a product with an implemented email connector, name the missing mail service or credential and explain how to connect it. This demo has no email connector; adding credentials would not enable delivery.</p></section>
    <section class="ui-panel"><h2>Saved, not yet checked</h2><p>A saved access change can await a separate permission check. An unavailable check does not mean the save failed.</p></section>
    <section class="ui-panel"><h2>Not implemented</h2><p>Bulk account import and durable storage are not built here. These are implementation boundaries, not browser permission restrictions. Refreshing the page restores the sample people.</p></section></div>
    ${guideNote('capabilities-design', 'Name the actual boundary', '<p>Available, missing a prerequisite, awaiting evidence and not implemented are different states. These examples illustrate truthful wording; they do not supply an importer or mail integration.</p>', ['AUDHD-04','AUDHD-07','AUDHD-12'])}`;
}
let overviewCleanup = () => {};
function render() {
  overviewCleanup();
  syncNotePages();
  const path = location.hash.slice(1) || 'overview';
  const current = pageFor(path);
  $('#announcement').textContent = '';
  // AUDHD-05/10: appearance controls keep their actual DOM and radio focus.
  // Task views reconstruct from their owning draft/state, not from defaults.
  $('#appearance-host').append($('#appearance-controls'));
  navigation(path);
  if (current?.path === 'overview') {
    overview();
    // AUDHD-05/08/11: time and label fitting are presentation updates only.
    // Patch the mounted timeline without replacing links, focus or task state.
    const timeline = $('.hub-today');
    const refreshTimeline = () => updateCalendarPresentation(timeline);
    const observer = new ResizeObserver(refreshTimeline);
    observer.observe(timeline);
    const clock = setInterval(refreshTimeline, 60000);
    refreshTimeline();
    overviewCleanup = () => { observer.disconnect(); clearInterval(clock); };
  }
  else if (current?.domain === 'schedule') renderSchedule($('#main'),path,hubChanged);
  else if (current?.domain === 'work') renderWork($('#main'),path,hubChanged);
  else if (current?.path === 'notes/new') renderNote($('#main'),null,false,notesChanged);
  else if (current?.noteId) renderNote($('#main'),current.noteId,path.endsWith('/history'),notesChanged);
  else if (current?.path === 'notes' || current?.notebookId || ['notes/archive','notes/trash'].includes(current?.path)) renderNotes($('#main'),current);
  else if (current?.path === 'notebooks') renderNotebookSettings($('#main'),notesChanged);
  else if (current?.path === 'workspace-settings') renderWorkspaceSettings($('#main'),notesChanged);
  else if (current?.path === 'transfer') renderTransfer($('#main'),notesChanged);
  else if (current?.path === 'settings/requests') renderRequestSettings($('#main'), updateNavigationAttention);
  else if (current?.path === 'settings') capabilities();
  else if (current?.path === 'directory') directory();
  else if (current?.parent === 'activity') renderActivity($('#main'), current.path.split('/')[1]);
  else if (current?.path === 'recovery') renderRecovery($('#main'), updateRecoverySummary);
  else if (current?.path === 'appearance') {
    $('#main').innerHTML = heading('Appearance', 'Choose a complete look. Changing skins keeps your tasks and drafts intact.') + guideNote('appearance-design', 'Compare complete looks', '<p>Each skin combines the kit’s colors and typography. This demo follows the user’s request for complete looks without separate text or system-appearance options. The outlined swatches sample page, surface, text, action, active accent and focus colors; they do not show every color token. The Current badge identifies the chosen skin. Browser accessibility overrides still apply.</p>', ['AUDHD-05','AUDHD-08','AUDHD-10','AUDHD-11']);
    $('#main').append($('#appearance-controls'));
  } else if (current?.path === 'people') peoplePage();
  else if (current?.record) detail(people.find(p => p.id === current.path.split('/')[1]));
  else $('#main').innerHTML = heading('Destination not found', 'Your drafts are retained.') + '<a href="#directory">Browse all pages</a>';
  pending(); restoreGuideNotes($('#main'));
}
function hubChanged() {
  // AUDHD-05/10: a save can rename a record. Patch orientation and counts;
  // re-rendering main here would replace edited fields or steal result focus.
  syncNotePages();
  updateNavigationAttention();
  const current=pageFor(location.hash.slice(1));
  if(current) breadcrumbs(current);
}
function notesChanged() {
  syncNotePages();
  updateNavigationAttention();
  // Save can rename a record without changing its URL or rebuilding its form.
  const current=pageFor(location.hash.slice(1));
  if(current?.noteId) {
    breadcrumbs(current);
    const note=notes.find(item=>item.id===current.noteId);
    $('#main h1').textContent=current.noteHistory ? `${note.title}: saved versions` : current.label;
    $('#main .task-heading p').textContent=`${notebooks.find(book=>book.id===note.notebookId)?.name || 'Notebook unavailable'} · ${note.status==='active'?'Active note':note.status==='trash'?'In Trash':'Archived note'}`;
    // A saved move changes ancestry, not the draft controls. Patch the cues so
    // the current notebook stays truthful without disturbing keyboard focus.
    const chain=ancestors(current);
    for(const link of document.querySelectorAll('.nav-children a')) link.toggleAttribute('data-ancestor',chain.some(parent=>link.hash===href(parent)));
    const location=$('.nav-group[data-active] .nav-location');
    if(location)location.textContent=`Current: ${current.label}`;
    $('#menu-toggle').textContent=`Sections · ${(chain[0] || current).label}`;
  }
}
function routeFocus(previous = '') {
  const target = location.hash.split('/')[2];
  let control = target === 'role' ? $('[name="role"]:checked') : ['reason','verify','restore-check','request-capacity','request-amount','limit-enabled'].includes(target) && $(`#${target}`);
  if(location.hash.startsWith('#note/') && ['title','body','notebookId'].includes(target)) control=$(`#note-${target}`);
  if(location.hash.startsWith('#notes/new/') && ['title','body','notebookId'].includes(target)) control=$(`#note-${target}`);
  if(location.hash.startsWith('#notebooks/')) {
    const [,id,field]=location.hash.split('/');
    control=$(`form[data-notebook="${CSS.escape(id)}"] [name="${CSS.escape(field || '')}"]`);
  }
  if(location.hash.startsWith('#workspace-settings/')) control=$(`#workspace-settings-form [name="${CSS.escape(location.hash.split('/')[1])}"]`);
  if(location.hash.startsWith('#transfer/')) control=$(`#${CSS.escape(location.hash.split('/')[1])}`);
  const current=pageFor(location.hash.slice(1));
  if(current?.domain) {
    const suffix=location.hash.slice(1).slice(current.path.length+1);
    // Registry targets map to module-owned controls. Resolve the fieldset ID
    // before a repeated checkbox name, so dependency links focus the group.
    const prefix=current.domain==='schedule'?'meeting':current.path.startsWith('request')?'request':'task';
    control=suffix && ($('#main').querySelector(`#${CSS.escape(`${prefix}-${suffix}`)}`) || $('#main').querySelector(`[name="${CSS.escape(suffix)}"]`));
  }
  // A restored check no longer needs its recovery control. Old recovery links
  // still land on the next useful action, without performing it automatically.
  if (target === 'restore-check' && control?.hidden) control = $('#verify');
  // A disabled timing/quantity control cannot accept focus. Show its enabling
  // choice instead, so a saved direct link remains useful after state changes.
  if (control?.disabled) control = $('#restore-note') || $('#limit-enabled');
  const previousRecord = previous.split('/').slice(0, 2).join('/');
  const returnLink = location.hash === '#people' && [...document.querySelectorAll('#records h2 a')].find(link => link.hash === previousRecord);
  // AUDHD-05/11: explicit status links focus the real control, and Back to
  // people restores the matching row. If filtering excluded it, main is the
  // predictable fallback; do not erase the filter just to find a focus target.
  const noteReturn = previous.startsWith('#note/') && [...document.querySelectorAll('#notebook-list a')].find(link=>link.hash===previousRecord);
  const destination = control || returnLink || noteReturn;
  if (destination) {
    // AUDHD-03/05: a control link must reveal all enclosing disclosures, even
    // when the URL is already current. Focus on a hidden field is no recovery.
    for(let parent=destination.parentElement;parent;parent=parent.parentElement) if(parent.matches('details')) parent.open=true;
    destination.focus();
    // A targeted check can sit far below the record heading. Reveal its local
    // name/role with the action so the user never checks an unidentified account.
    if (['verify','restore-check'].includes(destination.id)) destination.closest('.access-verification')?.scrollIntoView({block:'start'});
  }
  else {
    // AUDHD-05/09: a new task starts with its breadcrumb and title in view.
    // Focusing main with default scrolling would hide the ancestor links just
    // as the user arrives. Direct control links still reveal their exact target.
    $('#main').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
$('.skip-link').onclick = event => { event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView({block:'start'}); };
$('#guide-toggle').onclick = () => setGuideNotes($('#guide-toggle').getAttribute('aria-pressed') !== 'true');
window.addEventListener('hashchange', event => { render(); routeFocus(new URL(event.oldURL).hash); });
// Reusing an already-current deep link does not emit hashchange. It must still
// reveal focus at its named control, without rebuilding or clearing the draft.
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link && link.hash === location.hash) { event.preventDefault(); routeFocus(); }
});
render();
if (location.hash.includes('/')) routeFocus();

let skin = 'guillermo';
try {
  const response = await fetch('../../packages/audhd-ui-framework/palette-data.json');
  if (!response.ok) throw Error('Palette registry could not be loaded');
  const palettes = await response.json();
  // AUDHD-08/10/11 (GUIDE.md#adaptable-appearance): this demo deliberately
  // offers complete looks, per the user's preference. Canonical expressive
  // typography pairs the skin's display heading with its body font. The kit's
  // independent type APIs remain available to other consumers. Each preview
  // owns its tokens; it must not inherit the currently selected skin's fonts.
  // Only the sample has local tokens. The outer selection border uses the host
  // skin, while an explicit Current badge disambiguates selection from swatches.
  // Native radios stay keyboard-accessible even though their dots are hidden.
  $('#palettes').innerHTML = palettes.map(p => `<label class="palette">
    <input type="radio" name="skin" value="${p.id}" aria-label="${escape(p.name)} (${escape(p.mode)})" ${p.id === skin ? 'checked' : ''}>
    <span class="palette-preview" data-audhd-ui data-skin="${p.id}" data-type="expressive" aria-hidden="true">
      <span class="preview-heading">${escape(p.name)}</span>
      <span class="preview-text-row"><span class="preview-copy">Body Text</span><strong class="palette-current">✓ Current</strong></span>
      <span class="preview-panel"><span class="preview-active">Notes</span><span class="preview-action">Open notes</span></span>
      <span class="preview-colors">${['page','surface','text','action','active-accent','focus'].map(token=>`<i style="background:var(--ui-${token})"></i>`).join('')}</span>
    </span>
  </label>`).join('');
  // AUDHD-05/07: preview content is illustrative, not a second set of controls.
  // Selection changes attributes and a live summary only. Keep radio identity,
  // keyboard focus and gallery position stable; never rebuild task forms or
  // reorder this collection around the newly selected item.
  $('#palettes').onchange = event => {
    skin = event.target.value;
    document.documentElement.dataset.skin = skin;
    const selected = palettes.find(p => p.id === skin);
    $('#appearance-status').innerHTML = `Current skin: <strong>${escape(selected.name)}</strong> · ${selected.mode === 'dark' ? 'Dark' : 'Light'}`;
  };
} catch (error) { $('#appearance-status').textContent = `${error.message}. Serve this example over HTTP. The default skin and administration tasks remain available.`; }
