import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Disclosure, DisclosurePanel, Heading, Tabs, TabList, Tab, TabPanel } from 'react-aria-components';
import { recordings, reviewStatuses, copy, contextualHelp } from '../../shared/fixtures.js';
import { pages, workspaceSections, recordViews } from '../../shared/navigation.js';
import palettes from '../../../skins/palette-data.json';
import ContextHelp from './ContextHelp.jsx';
import ProfileControls from './ProfileControls.jsx';
import { emptyProfile } from '../../../../preferences/profile.js';
import { routeFromHash, recordingHref } from './navigation.js';
import { createReviewState, editReview, filterRecordings, resolveSave, reviewFeedback, sameReview, startSave } from './review-state.js';

export default function App() {
  // Keep task state above the conditional list/disclosure content: hiding a card
  // must not discard its draft. selectedId is the source of truth for the card,
  // detail identity, current action and connector; keyboard focus is separate.
  // See ../../SPEC.md (REF-03-06) and
  // ../../SPEC.md for the design contract.
  const [state, setState] = useState(createReviewState);
  const [route, setRoute] = useState(() => routeFromHash(location.hash));
  const [selectedId, setSelectedId] = useState(() => routeFromHash(location.hash).id || recordings[0].id);
  const [viewById, setViewById] = useState(() => {
    const initial = routeFromHash(location.hash);
    return initial.id ? { [initial.id]: initial.view } : {};
  });
  const [query, setQuery] = useState('');
  const [textSize, setTextSize] = useState('standard');
  const [spacing, setSpacing] = useState('comfortable');
  // Appearance has its own state. Never key/remount the workspace by skin:
  // drafts, pending saves, selected records and navigation must survive changes.
  const [profile, setProfile] = useState(emptyProfile);
  const [appearance, setAppearance] = useState('skin:guillermo');
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const skin = appearance.startsWith('skin:') ? appearance.slice(5) : appearance === 'light' || (appearance === 'system' && !systemDark) ? 'paperwhite' : 'guillermo';
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function remember(group, key, value) {
    setProfile(current => ({ ...current, [group]: { ...current[group], [key]: value } }));
  }
  // Apply presentation only: no review reducer action, routing or focus request.
  // Unknown skins and unsupported numeric scales retain their effective value;
  // the imported request remains intact in the separate exportable profile.
  function applyProfile(next) {
    setProfile(next);
    const value = next.display.appearance;
    if (!value) setAppearance('skin:guillermo');
    else if (value.mode !== 'skin') setAppearance(value.mode);
    else if (palettes.some(p => p.id === value.id)) setAppearance(`skin:${value.id}`);
    setTextStyle(next.display.text_style || 'system');
    if ([null, 1, 1.25].includes(next.display.text_scale)) setTextSize(next.display.text_scale === 1.25 ? 'larger' : 'standard');
    setSpacing(next.layout.density || 'comfortable');
    setHelpExpanded(next.support.help_detail === 'expanded');
  }
  const [textStyle, setTextStyle] = useState('system');
  useLayoutEffect(() => {
    document.documentElement.dataset.skin = skin;
    document.documentElement.dataset.type = textStyle;
  }, [skin, textStyle]);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [focusRequest, setFocusRequest] = useState(null);
  const reviewHeading = useRef(null);
  const demoHeading = useRef(null);
  const searchInput = useRef(null);
  const pageHeading = useRef(null);
  const pointerTarget = useRef(null);
  function fromPointer(event) {
    // Firefox may give keyboard-generated clicks a nonzero detail. Only a
    // preceding pointer event on this trigger establishes pointer navigation.
    const result = pointerTarget.current === event.currentTarget;
    pointerTarget.current = null;
    return result;
  }
  const record = recordings.find(item => item.id === selectedId);
  const review = state.reviews[selectedId];
  const results = filterRecordings(query);
  const dirty = !sameReview(review.draft, review.saved);
  const feedback = reviewFeedback(review);
  const pendingRecords = recordings.filter(item => state.reviews[item.id].pending);
  const view = viewById[selectedId] || 'review';
  const isRecordings = route.page === 'recording' || route.page === 'recordings';
  const pageTitle = route.page === 'recording' ? 'Recording review desk' : route.page === 'workspace' ? 'All pages' : pages[route.page]?.title || 'Page unavailable';
  // Resolve ancestry from the same static page records used by the index, so
  // labels and parent links have one owner. Local views do not become parents.
  const breadcrumbs = [];
  for (let page = pages[isRecordings ? 'recordings' : route.page] || pages.workspace; page; page = pages[page.parentId]) breadcrumbs.unshift(page);
  if (route.page === 'recording') breadcrumbs.push({ title: record.name, href: recordingHref(selectedId, view) });
  if (route.page === 'missing') breadcrumbs.push({ title: 'Page unavailable' });

  // Hash destinations support direct links and Back/Forward without a routing
  // dependency. Each framework owns these transitions. Root-owned drafts remain
  // intact while pages unmount; only location (never draft text) enters history.
  function applyLocation(hash, focus = true, pointer = false) {
    const next = routeFromHash(hash);
    setRoute(next);
    if (next.id) {
      setSelectedId(next.id);
      setViewById(current => ({ ...current, [next.id]: next.view }));
    }
    if (focus) setFocusRequest({ target: next.page === 'recording' ? 'review' : 'page', pointer });
  }
  function navigate(hash, focus = true, pointer = false) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    applyLocation(hash, focus, pointer);
  }
  function followLink(event) {
    // Keep ordinary modified-click/open-in-new-tab behavior for real links.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(event.currentTarget.hash, true, fromPointer(event));
  }
  function toTop(event) {
    event.preventDefault();
    if (pageHeading.current) { pageHeading.current.dataset.navigationInput = fromPointer(event) ? 'pointer' : 'keyboard'; pageHeading.current.focus(); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  useEffect(() => {
    if (!location.hash) history.replaceState(null, '', recordingHref(recordings[0].id));
    const restore = () => applyLocation(location.hash);
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, []);
  useEffect(() => { document.title = `${pageTitle} · React reference`; }, [pageTitle]);

  // Move focus only for an explicit action, after React updates the named target.
  // Deriving this effect from selection alone would also risk initial autofocus.
  // Presentation changes and background responses must not request review focus.
  useLayoutEffect(() => {
    if (focusRequest?.target === 'review' || focusRequest?.target === 'page') {
      const heading = focusRequest.target === 'review' ? reviewHeading.current : pageHeading.current;
      // Programmatic heading focus differs across browser heuristics. Preserve
      // orientation for both inputs, but explicitly distinguish deliberate keys
      // from pointer clicks. Control focus styles remain native/focus-visible.
      if (heading) { heading.dataset.navigationInput = focusRequest.pointer ? 'pointer' : 'keyboard'; heading.focus(); }
    }
    if (focusRequest?.target === 'demo') demoHeading.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  function selectRecording(id, pointer) {
    // Selecting the current ID is intentional: "Reviewing" remains a shortcut
    // back to its open heading, especially when the panels are vertically stacked.
    navigate(recordingHref(id, viewById[id] || 'review'), true, pointer);
  }

  function resolve(id, attemptId, outcome, event) {
    // A focused simulator button disappears after resolution. Give that deliberate
    // action a surviving destination, without scrolling to the page top. A response
    // triggered while the editor is focused must leave the editor alone. The broader
    // competing-focus edge case is still recorded in ../../SPEC.md.
    const removingFocusedButton = event.currentTarget === document.activeElement;
    setState(current => resolveSave(current, id, attemptId, outcome));
    if (removingFocusedButton) setFocusRequest({ target: 'demo' });
  }

  return (
    <main onPointerDownCapture={event => { pointerTarget.current = event.target.closest('a,button'); }} onKeyDownCapture={() => { pointerTarget.current = null; }} className="review-app" data-text-size={textSize} data-spacing={spacing}>
      <a className="skip-link" href="#page-heading" onClick={toTop}>Skip navigation</a>
      {/* Breadcrumbs express canonical page ancestry; the local Review/Details
          view is not an invented parent. Both copies receive this same path. */}
      <div className="navigation-top">
        <Breadcrumbs items={breadcrumbs} position="top" onNavigate={followLink} />
        <a href={pages.workspace.href} onClick={followLink}>All pages</a>
      </div>
      <nav aria-label="Workspace sections" className="workspace-navigation">
        {workspaceSections.map(id => <a key={id} href={id === 'recordings' ? recordingHref(selectedId, view) : pages[id].href}
          aria-current={(id === 'recordings' ? isRecordings : route.page === id) ? 'true' : undefined} onClick={followLink}>{pages[id].title}</a>)}
      </nav>
      <header className="page-header">
        <p className="eyebrow">Reference workspace</p>
        <h1 id="page-heading" tabIndex={-1} ref={pageHeading}>{pageTitle}</h1>
        <p>{route.page === 'recording' ? 'Review a recording and save your assessment.' : pages[route.page]?.summary || 'This address does not name a page in this reference. Use All pages to find a destination.'}</p>
      </header>

      {/* Retention is essential task context, so it stays visible outside optional
          help. The simulated Saved state must not imply persistence across reload. */}
      <p className="demo-boundary">{copy.boundary}</p>

      {/* Preferences have a real destination. They still change only presentation,
          not review state. The same help Boolean controls the timing disclosure. */}
      {route.page === 'preferences' && <section className="preferences-panel panel" aria-labelledby="preferences-heading">
        <h2 id="preferences-heading">Display options</h2>
        <ProfileControls profile={profile} onApply={applyProfile} />
        <div className="disclosure-body">
          <p className="muted">Temporary choices for this session. Light and dark skins are equally supported. Changing appearance keeps your work in place; reloading resets this demo. Skin headings use locally available fonts with fallbacks.</p>
          <div className="display-fields">
            <div className="display-choice">
              <div className="field-heading"><label htmlFor="skin-choice">Appearance</label><ContextHelp topic="skin" text={contextualHelp.skin} textSize={textSize} /></div>
              <select id="skin-choice" value={appearance} onChange={event => { const value = event.target.value; setAppearance(value); remember('display', 'appearance', value.startsWith('skin:') ? { mode: 'skin', id: value.slice(5) } : { mode: value }); }}>
                <option value="light">Light — Paperwhite</option><option value="dark">Dark — Guillermo</option><option value="system">Follow system</option>
                {palettes.map(palette => <option key={palette.id} value={`skin:${palette.id}`}>{palette.name} ({palette.mode})</option>)}
              </select>
            </div>
            <div className="display-choice">
              <div className="field-heading"><label htmlFor="text-style-choice">Text style</label><ContextHelp topic="text style" text={contextualHelp.textStyle} textSize={textSize} /></div>
              <select id="text-style-choice" value={textStyle} onChange={event => { setTextStyle(event.target.value); remember('display', 'text_style', event.target.value); }}>
                <option value="system">System</option><option value="expressive">Skin headings</option><option value="serif">Serif</option><option value="mono">Monospace</option>
              </select>
            </div>
            <label>Text size
              <select value={textSize} onChange={event => { setTextSize(event.target.value); remember('display', 'text_scale', event.target.value === 'larger' ? 1.25 : 1); }}>
                <option value="standard">Standard</option><option value="larger">Larger</option>
              </select>
            </label>
            <label>Spacing
              <select value={spacing} onChange={event => { setSpacing(event.target.value); remember('layout', 'density', event.target.value); }}>
                <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
              </select>
            </label>
            <label>Detailed help
              <select value={helpExpanded ? 'expanded' : 'collapsed'} onChange={event => { setHelpExpanded(event.target.value === 'expanded'); remember('support', 'help_detail', event.target.value === 'expanded' ? 'expanded' : 'concise'); }}>
                <option value="collapsed">Collapsed</option><option value="expanded">Expanded</option>
              </select>
            </label>
          </div>
        </div>
      </section>}

      {route.page === 'workspace' && <section className="page-directory panel" aria-labelledby="directory-heading">
        <h2 id="directory-heading">Workspace pages</h2>
        {/* Nest recordings under their actual parent, matching the breadcrumb
            path. Indentation and list semantics express the same relationship. */}
        <ul>{workspaceSections.map(id => <li key={id}>
          <a href={pages[id].href} onClick={followLink}>{pages[id].title}</a><p>{pages[id].summary}</p>
          {id === 'recordings' && <>
            <p id="directory-recordings-label" className="directory-group-label">Individual recordings:</p>
            <ul aria-labelledby="directory-recordings-label">{recordings.map(item => <li key={item.id}><a href={recordingHref(item.id, viewById[item.id] || 'review')} onClick={followLink}>{item.name}</a><p>{item.id} · Map: {item.map} · Seed: {item.seed}</p></li>)}</ul>
          </>}
        </li>)}</ul>
      </section>}

      {/* Source precedes details in DOM order at every width. CSS can stack these
          regions without creating a second form or reordering keyboard navigation.
          Named sections make the same grouping available beyond visual borders. */}
      {isRecordings && <div className={route.page === 'recording' ? 'workspace' : 'library-layout'}>
        <section className="recordings-panel panel" aria-labelledby="recordings-heading">
          <h2 id="recordings-heading">Recordings</h2>
          <div className="field">
            <label htmlFor="recording-search">Find a recording</label>
            <p id="search-help" className="muted">{copy.searchHelp}</p>
            <input id="recording-search" ref={searchInput} type="search" value={query}
              aria-describedby="search-help" onChange={event => setQuery(event.target.value)} />
          </div>
          {/* The colon introduces actual children; aria-labelledby on the list
              carries the association beyond punctuation. Zero results do not
              introduce nonexistent cards. The polite count reports search scope,
              not a change to the still-open recording or its draft. */}
          <div className="results-toolbar">
            <p id="recording-count" role="status" aria-live="polite">{results.length} {results.length === 1 ? 'recording' : 'recordings'}{results.length > 0 ? ':' : ''}</p>
            {query && <button type="button" onClick={() => { setQuery(''); searchInput.current.focus(); }}>Clear search</button>}
          </div>
          {/* Filtering never silently selects a replacement. Explain why details
              can remain visible even when their source card is absent. */}
          {route.page === 'recording' && !results.some(item => item.id === selectedId) && <p className="notice">Current recording is outside these search results.</p>}
          {results.length === 0 && <p>No recordings match this search</p>}
          <ul className="recording-list" aria-labelledby="recording-count">
            {results.map(item => (
              <li key={item.id} className={route.page === 'recording' && item.id === selectedId ? 'current-record' : ''}>
                <div className="record-identity"><strong className="record-title">{item.name}</strong>{route.page === 'recording' && item.id === selectedId && <span className="current-label">Current recording</span>}</div>
                <p className="record-id">{item.id} · <time dateTime={item.date}>{item.date}</time></p>
                <p className="muted">Map: {item.map} · Seed: {item.seed}</p>
                {/* This is navigation to a review, not a toggle or listbox option.
                    "Reviewing" and aria-current expose the already-open state;
                    aria-controls names the target. Keep it enabled so returning
                    to the same review is useful without resetting its contents. */}
                <button type="button" aria-current={route.page === 'recording' && item.id === selectedId ? 'true' : undefined} aria-controls={route.page === 'recording' ? 'review-panel' : undefined}
                  onClick={event => selectRecording(item.id, fromPointer(event))}>{route.page === 'recording' && item.id === selectedId ? 'Reviewing' : 'Review'} {item.name}</button>
                {/* The arrow supplements repeated identity/current text and the
                    control association; it is not another focus stop or accessible
                    name. CSS points it right when adjacent, down when stacked.
                    Render only for the current source, never an unrelated result. */}
                {route.page === 'recording' && item.id === selectedId && <span className="relationship-cue" aria-hidden="true">
                  <span className="relationship-label">Details below</span>
                  <svg viewBox="0 0 32 24"><path d="M2 12h26m-7-7 7 7-7 7" /></svg>
                </span>}
              </li>
            ))}
          </ul>
        </section>

        {/* Repeat the name and stable ID so the relationship survives scrolling,
            filtering and loss of color. CSS shares the source card's surface and
            title accent. tabindex=-1 permits deliberate heading focus without
            adding a noninteractive heading to the ordinary tab sequence. */}
        {route.page === 'recording' && <section id="review-panel" className="review-panel panel" aria-labelledby="review-heading">
          <div className="review-header">
            <p className="eyebrow">Current recording · {record.date}</p>
            <h2 id="review-heading" tabIndex={-1} ref={reviewHeading}>{record.name} <span className="record-id">{record.id}</span></h2>
          </div>
          <section aria-labelledby="timing-heading" className="timing-section">
            <h3 id="timing-heading">Timing</h3>
            {/* Definition-list terms, concise meanings and values express the
                relationship without inventing a chart. Essential explanations
                remain visible when detailed help is closed; UTC-05:00 is specific
                to these January fixtures, not a live timezone calculation. */}
            <dl className="timing-facts">
              <div><dt>Time zone</dt><dd><span className="meaning">Used for recording timestamps</span><strong>America/New_York · UTC−05:00</strong></dd></div>
              <div><dt>Simulation duration</dt><dd><span className="meaning">Time elapsed inside the simulation</span><strong>{record.simulation}</strong></dd></div>
              <div><dt>Execution time</dt><dd><span className="meaning">Real elapsed time, including recorded pauses</span><strong>{record.execution}</strong></dd></div>
            </dl>
            {/* React Aria supplies this controlled disclosure's interaction and
                semantics. The app owns its expansion preference. Keep the trigger
                in the heading and use the library slot/panel composition directly;
                a tooltip would not suit this persistent, multi-sentence help. */}
            <Disclosure isExpanded={helpExpanded} onExpandedChange={setHelpExpanded} className="timing-help">
              <Heading level={4}><Button slot="trigger" className="help-trigger"><span aria-hidden="true">{helpExpanded ? '−' : '+'}</span> About these timings</Button></Heading>
              <DisclosurePanel><p>{copy.timingHelp}</p></DisclosurePanel>
            </Disclosure>
          </section>

          {/* A named form separates editable assessment from recording facts within
              the same context. Native fields cover this small task. Persistent
              labels and associated descriptions do not vanish when typing, unlike
              placeholder-only help. Submission captures a snapshot; it does not
              navigate away or claim that a pending request has already succeeded. */}
          <form className="review-form" aria-labelledby="assessment-heading" onSubmit={event => {
            event.preventDefault();
            setState(current => startSave(current, selectedId));
          }}>
            {/* Local tabs belong inside this recording, not beside workspace
                navigation. Manual activation keeps arrow-key focus independent of
                the selected view. Feedback/Save stay outside hidden panels, and
                React state owns the draft even when a TabPanel unmounts. */}
            <h3 id="assessment-heading" className="local-view-label">Recording workspace</h3>
            <Tabs selectedKey={view} onSelectionChange={key => navigate(recordingHref(selectedId, key), false)} keyboardActivation="manual">
              <TabList aria-label="Recording views" className="record-tabs">
                {recordViews.map(item => <Tab id={item.id} key={item.id}>{item.title}</Tab>)}
              </TabList>
              <TabPanel id="review" className="record-tab-panel">
                <h4>Your review</h4>
                <div className="field">
                  <div className="field-heading"><label htmlFor="review-status">Review status</label><ContextHelp topic="review status" kind="question" text={contextualHelp.reviewStatus} textSize={textSize} /></div>
                  <p id="status-help" className="muted">Your assessment of this recording.</p>
                  <select id="review-status" aria-describedby="status-help" value={review.draft.status}
                    onChange={event => setState(current => editReview(current, selectedId, 'status', event.target.value))}>
                    {reviewStatuses.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="review-note">Review note</label>
                  <p id="note-help" className="muted">Record what you found or what needs follow-up.</p>
                  <textarea id="review-note" rows={5} aria-describedby="note-help" value={review.draft.note}
                    onChange={event => setState(current => editReview(current, selectedId, 'note', event.target.value))} />
                </div>
              </TabPanel>
              <TabPanel id="details" className="record-tab-panel">
                <h4>Recording metadata</h4>
                <dl className="record-metadata">
                  <div><dt>Recorded date</dt><dd>{record.date}</dd></div>
                  <div><dt>Map</dt><dd>{record.map}</dd></div>
                  <div><dt>Seed</dt><dd>{record.seed}</dd></div>
                </dl>
                <p className="muted">{copy.metadataHelp}</p>
              </TabPanel>
            </Tabs>
            {/* Keep scope, actual result and disabled reason beside Save. Only the
                duplicate save is blocked while pending: the note remains editable,
                and feedback distinguishes newer edits from the submitted snapshot.
                Neither a spinner nor button color is sufficient evidence of saving. */}
            <div className="save-area">
              <p id="save-scope" className="muted">Saves the status and note for {record.id} in this demo only. Reloading resets it.</p>
              <p id="save-feedback" className={`save-feedback ${review.outcome === 'failed' && dirty ? 'error' : ''}`}>{feedback}</p>
              <div className="save-actions">
                <button className="primary" type="submit" disabled={!!review.pending || !dirty} aria-describedby="save-scope save-feedback save-reason">Save review</button>
                <ContextHelp topic="demo saving" kind="warning" text={contextualHelp.demoSave} textSize={textSize} />
                <p id="save-reason" className="muted">{review.pending ? 'Save in progress.' : !dirty && review.savedRevision > 0 ? 'No unsaved changes.' : ''}</p>
              </div>
            </div>
          </form>
        </section>}
      </div>}

      {/* Deliberate test controls make delays/failures reproducible without timers.
          Keep them separate from the real task and label the simulation honestly.
          Attempt groups identify the originating record, even after selection moves.
          The surviving heading is the focus fallback when a resolver is removed. */}
      {route.page === 'recording' && <details className="demo-controls">
        <summary><h2 tabIndex={-1} ref={demoHeading}>Demo save controls</h2></summary>
        <div className="disclosure-body">
          <p className="muted">Saves wait here until you complete or fail them. These controls simulate a response; they do not store anything beyond this page.</p>
          {pendingRecords.length === 0 && <p>No saves waiting.</p>}
          <ul className="pending-list">
            {pendingRecords.map(item => {
              const attempt = state.reviews[item.id].pending;
              return <li key={attempt.attemptId}>
                <h3 id={`attempt-${attempt.attemptId}`}>{item.name} · {item.id} · Attempt {attempt.attemptId}</h3>
                <div className="resolver-actions" role="group" aria-labelledby={`attempt-${attempt.attemptId}`}>
                  <button type="button" onClick={event => resolve(item.id, attempt.attemptId, 'saved', event)}>Complete save</button>
                  <button type="button" onClick={event => resolve(item.id, attempt.attemptId, 'failed', event)}>Fail save</button>
                </div>
              </li>;
            })}
          </ul>
        </div>
      </details>}
      {/* One persistent region reports scoped save events, not every keystroke.
          It supplements visible feedback; actual screen-reader announcement
          usefulness remains pending in the acceptance record. */}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</div>
      {/* Footer links reuse the same destinations; they are not a second tablist
          competing to own the local panels. Nothing is fixed over the editor. */}
      <footer className="page-footer">
        <Breadcrumbs items={breadcrumbs} position="bottom" onNavigate={followLink} />
        <div className="footer-actions">
          <details className="footer-sections"><summary>Sections</summary>
            <nav aria-label="Footer sections">
              <a href={pages.workspace.href} onClick={followLink}>All pages</a>
              <a href={pages.recordings.href} onClick={followLink}>All recordings</a>
              <a href={pages.preferences.href} onClick={followLink}>Workspace preferences</a>
              {route.page === 'recording' && recordViews.map(item => <a key={item.id} href={recordingHref(selectedId, item.id)} aria-current={item.id === view ? 'true' : undefined} onClick={followLink}>{item.title}</a>)}
            </nav>
          </details>
          <a href="#page-heading" onClick={toTop}>Back to top</a>
        </div>
        <p>React reference · React Aria is provisional · Fictional recordings</p>
      </footer>
    </main>
  );
}

function Breadcrumbs({ items, position, onNavigate }) {
  return <nav className="breadcrumbs" aria-label={`Breadcrumbs ${position}`}><ol>
    {items.map((item, index) => <li key={item.title}>
      {index > 0 && <span aria-hidden="true" className="breadcrumb-separator">›</span>}
      {index === items.length - 1 ? <span aria-current="page">{item.title}</span> : <a href={item.href} onClick={onNavigate}>{item.title}</a>}
    </li>)}
  </ol></nav>;
}
