<script>
  import { onMount, tick } from 'svelte';
  import { Collapsible, Tabs } from 'bits-ui';
  import { recordings, reviewStatuses, copy, contextualHelp } from '../../shared/fixtures.js';
  import { pages, workspaceSections, recordViews } from '../../shared/navigation.js';
  import palettes from '../../../skins/palette-data.json';
  import ContextHelp from './ContextHelp.svelte';
  import ProfileControls from './ProfileControls.svelte';
  import { emptyProfile } from '../../../../preferences/profile.js';
  import { parseLocation, reviewAddress } from './navigation.js';
  import { createWorkspace, feedbackFor, isDirty, matchingRecordings, requestSave, settleSave, updateDraft } from './review-workspace.js';

  // Keep task state above conditional list/disclosure content: hiding a card must
  // not discard its draft. selectedId drives the source, detail, current action
  // and connector, independently of keyboard focus. This workspace uses Svelte's
  // own reactivity, not the React state engine. See ../../SPEC.md
  // (REF-03-06) and ../../SPEC.md.
  let workspace = $state(createWorkspace());
  const initialLocation = parseLocation(location.hash);
  let route = $state(initialLocation);
  let selectedId = $state(initialLocation.id || recordings[0].id);
  let viewById = $state(initialLocation.id ? { [initialLocation.id]: initialLocation.view } : {});
  let query = $state('');
  let textSize = $state('standard');
  let spacing = $state('comfortable');
  // Presentation is independent of workspace state. Updating root attributes
  // never reconstructs drafts, pending saves, selection or the navigation tree.
  let profile = $state(emptyProfile());
  let appearance = $state('skin:guillermo');
  let systemDark = $state(matchMedia('(prefers-color-scheme: dark)').matches);
  let skin = $derived(appearance.startsWith('skin:') ? appearance.slice(5) : appearance === 'light' || (appearance === 'system' && !systemDark) ? 'paperwhite' : 'guillermo');
  onMount(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => systemDark = media.matches;
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  });
  function remember(group, key, value) { profile[group][key] = value; }
  // This adapter changes its own presentation state, never review workspace,
  // route or focus. Unsupported intent remains exportable without false claims.
  function applyProfile(next) {
    profile = next;
    const choice = next.display.appearance;
    if (choice === null) appearance = 'skin:guillermo';
    else if (choice.mode !== 'skin') appearance = choice.mode;
    else if (palettes.some(p => p.id === choice.id)) appearance = `skin:${choice.id}`;
    textStyle = next.display.text_style ?? 'system';
    if ([null, 1, 1.25].includes(next.display.text_scale)) textSize = next.display.text_scale === 1.25 ? 'larger' : 'standard';
    spacing = next.layout.density ?? 'comfortable';
    helpExpanded = next.support.help_detail === 'expanded';
  }
  let textStyle = $state('system');
  $effect(() => {
    document.documentElement.dataset.skin = skin;
    document.documentElement.dataset.type = textStyle;
  });
  let helpExpanded = $state(false);
  let reviewHeading = $state();
  let demoHeading = $state();
  let searchInput = $state();
  let pageHeading = $state();
  let pointerTarget = null;
  function fromPointer(event) {
    // Native keyboard clicks have differing detail values across browsers.
    const result = pointerTarget === event.currentTarget;
    pointerTarget = null;
    return result;
  }

  // Derive the visible view from the authoritative workspace instead of keeping
  // separate dirty/current flags that can drift after a response or search change.
  let record = $derived(recordings.find(item => item.id === selectedId));
  let current = $derived(workspace.records[selectedId]);
  let results = $derived(matchingRecordings(query));
  let dirty = $derived(isDirty(current));
  let feedback = $derived(feedbackFor(current));
  let pendingRecords = $derived(recordings.filter(item => workspace.records[item.id].attempt));

  let view = $derived(viewById[selectedId] || 'review');
  let isRecordings = $derived(route.page === 'recording' || route.page === 'recordings');
  let pageTitle = $derived(route.page === 'recording' ? 'Recording review desk' : route.page === 'workspace' ? 'All pages' : pages[route.page]?.title || 'Page unavailable');
  let breadcrumbs = $derived.by(() => {
    // Use the same titles and parent IDs as the index; no second breadcrumb map.
    const path = [pages[isRecordings ? 'recordings' : route.page] || pages.workspace];
    while (path[0].parentId) path.unshift(pages[path[0].parentId]);
    if (route.page === 'recording') path.push({ title: record.name, href: reviewAddress(selectedId, view) });
    if (route.page === 'missing') path.push({ title: 'Page unavailable' });
    return path;
  });

  // Location is shareable; draft text never enters the URL. This adapter owns its
  // transitions independently of React. Root-owned state survives page/panel
  // unmounting; Back/Forward restores location without loading another document.
  async function applyLocation(fragment, moveFocus = true, pointer = false) {
    const destination = parseLocation(fragment);
    route = destination;
    if (destination.id) {
      selectedId = destination.id;
      viewById[destination.id] = destination.view;
    }
    await tick();
    if (moveFocus) {
      const target = destination.page === 'recording' ? reviewHeading : pageHeading;
      // Keep navigation focus; explicit input origin avoids inconsistent browser
      // heading heuristics without suppressing keyboard focus on controls.
      if (target) { target.dataset.navigationInput = pointer ? 'pointer' : 'keyboard'; target.focus(); }
    }
  }
  function navigate(fragment, moveFocus = true, pointer = false) {
    if (location.hash !== fragment) history.pushState(null, '', fragment);
    return applyLocation(fragment, moveFocus, pointer);
  }
  function followLink(event) {
    // Real hrefs retain modified-click and open-in-new-tab browser behavior.
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(event.currentTarget.hash, true, fromPointer(event));
  }
  function toTop(event) {
    event.preventDefault();
    if (pageHeading) { pageHeading.dataset.navigationInput = fromPointer(event) ? 'pointer' : 'keyboard'; pageHeading.focus(); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  onMount(() => {
    if (!location.hash) history.replaceState(null, '', reviewAddress(recordings[0].id));
    const restore = () => applyLocation(location.hash);
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  });
  function selectRecording(id, pointer) {
    // The already-current action is still a useful shortcut to its heading.
    return navigate(reviewAddress(id, viewById[id] || 'review'), true, pointer);
  }

  async function clearSearch() {
    // Clear removes its own button; return focus to the surviving search field
    // after that update instead of leaving keyboard position on the document body.
    query = '';
    await tick();
    searchInput.focus();
  }

  async function resolve(id, token, succeeded, event) {
    // Recover focus only if settlement really removes the deliberately activated
    // control and leaves focus on the body. Background responses and a newer focus
    // destination should remain undisturbed. preventScroll keeps the user's place.
    const trigger = event.currentTarget;
    const hadFocus = trigger === document.activeElement;
    const changed = settleSave(workspace, id, token, succeeded);
    await tick();
    if (changed && hadFocus && !trigger.isConnected && document.activeElement === document.body) {
      demoHeading.focus({ preventScroll: true });
    }
  }
</script>

<svelte:head><title>{pageTitle} · Svelte reference</title></svelte:head>

<!-- Both copies use one canonical path. A local view is not a false ancestor. -->
{#snippet breadcrumbTrail(position)}
  <nav class="breadcrumbs" aria-label={`Breadcrumbs ${position}`}><ol>
    {#each breadcrumbs as item, index (item.title)}
      <li>
        {#if index > 0}<span aria-hidden="true" class="breadcrumb-separator">›</span>{/if}
        {#if index === breadcrumbs.length - 1}<span aria-current="page">{item.title}</span>
        {:else}<a href={item.href} onclick={followLink}>{item.title}</a>{/if}
      </li>
    {/each}
  </ol></nav>
{/snippet}

<main onpointerdowncapture={event => pointerTarget = event.target.closest('a,button')} onkeydowncapture={() => pointerTarget = null} class="review-app" data-text-size={textSize} data-spacing={spacing}>
  <a class="skip-link" href="#page-heading" onclick={toTop}>Skip navigation</a>
  <div class="navigation-top">
    {@render breadcrumbTrail('top')}
    <a href={pages.workspace.href} onclick={followLink}>All pages</a>
  </div>
  <nav aria-label="Workspace sections" class="workspace-navigation">
    {#each workspaceSections as id (id)}
      <a href={id === 'recordings' ? reviewAddress(selectedId, view) : pages[id].href}
        aria-current={(id === 'recordings' ? isRecordings : route.page === id) ? 'true' : undefined} onclick={followLink}>{pages[id].title}</a>
    {/each}
  </nav>
  <header class="page-header">
    <p class="eyebrow">Reference workspace</p>
    <h1 id="page-heading" tabindex="-1" bind:this={pageHeading}>{pageTitle}</h1>
    <p>{route.page === 'recording' ? 'Review a recording and save your assessment.' : pages[route.page]?.summary || 'This address does not name a page in this reference. Use All pages to find a destination.'}</p>
  </header>

  <!-- Retention is essential task context, so it stays visible outside optional
       help. The simulated Saved state must not imply persistence across reload. -->
  <p class="demo-boundary">{copy.boundary}</p>

  <!-- Preferences are a real destination, not an overlay. Navigation keeps the
       root-owned task state. The help setting and timing disclosure share a value. -->
  {#if route.page === 'preferences'}
  <section class="preferences-panel panel" aria-labelledby="preferences-heading">
    <h2 id="preferences-heading">Display options</h2>
    <ProfileControls profile={profile} onApply={applyProfile} />
    <div class="disclosure-body">
      <p class="muted">Temporary choices for this session. Light and dark skins are equally supported. Changing appearance keeps your work in place; reloading resets this demo. Skin headings use locally available fonts with fallbacks.</p>
      <div class="display-fields">
        <div class="display-choice">
          <div class="field-heading"><label for="skin-choice">Appearance</label><ContextHelp topic="skin" text={contextualHelp.skin} {textSize} /></div>
          <select id="skin-choice" value={appearance} onchange={event => { appearance = event.currentTarget.value; remember('display', 'appearance', appearance.startsWith('skin:') ? { mode: 'skin', id: appearance.slice(5) } : { mode: appearance }); }}>
            <option value="light">Light — Paperwhite</option><option value="dark">Dark — Guillermo</option><option value="system">Follow system</option>
            {#each palettes as palette (palette.id)}<option value={`skin:${palette.id}`}>{palette.name} ({palette.mode})</option>{/each}
          </select>
        </div>
        <div class="display-choice">
          <div class="field-heading"><label for="text-style-choice">Text style</label><ContextHelp topic="text style" text={contextualHelp.textStyle} {textSize} /></div>
          <select id="text-style-choice" value={textStyle} onchange={event => { textStyle = event.currentTarget.value; remember('display', 'text_style', textStyle); }}>
            <option value="system">System</option><option value="expressive">Skin headings</option><option value="serif">Serif</option><option value="mono">Monospace</option>
          </select>
        </div>
        <label>Text size
          <select value={textSize} onchange={event => { textSize = event.currentTarget.value; remember('display', 'text_scale', textSize === 'larger' ? 1.25 : 1); }}>
            <option value="standard">Standard</option><option value="larger">Larger</option>
          </select>
        </label>
        <label>Spacing
          <select value={spacing} onchange={event => { spacing = event.currentTarget.value; remember('layout', 'density', spacing); }}>
            <option value="comfortable">Comfortable</option><option value="compact">Compact</option>
          </select>
        </label>
        <label>Detailed help
          <select value={helpExpanded ? 'expanded' : 'collapsed'} onchange={event => { helpExpanded = event.currentTarget.value === 'expanded'; remember('support', 'help_detail', helpExpanded ? 'expanded' : 'concise'); }}>
            <option value="collapsed">Collapsed</option><option value="expanded">Expanded</option>
          </select>
        </label>
      </div>
    </div>
  </section>
  {/if}

  {#if route.page === 'workspace'}
    <section class="page-directory panel" aria-labelledby="directory-heading">
      <h2 id="directory-heading">Workspace pages</h2>
      <!-- Nested list structure and indentation agree with the real breadcrumb
           parent; the directory should not imply an unrelated flat collection. -->
      <ul>{#each workspaceSections as id (id)}<li>
        <a href={pages[id].href} onclick={followLink}>{pages[id].title}</a><p>{pages[id].summary}</p>
        {#if id === 'recordings'}
          <p id="directory-recordings-label" class="directory-group-label">Individual recordings:</p>
          <ul aria-labelledby="directory-recordings-label">{#each recordings as item (item.id)}<li><a href={reviewAddress(item.id, viewById[item.id] || 'review')} onclick={followLink}>{item.name}</a><p>{item.id} · Map: {item.map} · Seed: {item.seed}</p></li>{/each}</ul>
        {/if}
      </li>{/each}</ul>
    </section>
  {/if}

  <!-- Source precedes details in DOM order at every width. CSS stacks these same
       regions without duplicating inputs or changing keyboard reading order.
       Named sections make the grouping available beyond visual borders. -->
  {#if isRecordings}
  <div class={route.page === 'recording' ? 'workspace' : 'library-layout'}>
    <section class="recordings-panel panel" aria-labelledby="recordings-heading">
      <h2 id="recordings-heading">Recordings</h2>
      <div class="field">
        <label for="recording-search">Find a recording</label>
        <p id="search-help" class="muted">{copy.searchHelp}</p>
        <input id="recording-search" bind:this={searchInput} type="search" bind:value={query} aria-describedby="search-help" />
      </div>
      <!-- The colon introduces actual children; aria-labelledby on the list carries
           the relationship beyond punctuation. Zero results introduce no cards.
           The polite count reports search scope, not a change to the open review. -->
      <div class="results-toolbar">
        <p id="recording-count" role="status" aria-live="polite">{results.length} {results.length === 1 ? 'recording' : 'recordings'}{results.length > 0 ? ':' : ''}</p>
        {#if query}<button type="button" onclick={clearSearch}>Clear search</button>{/if}
      </div>
      <!-- Filtering never silently selects another record. Explain why details
           remain visible when their source card is outside the result set. -->
      {#if route.page === 'recording' && !results.some(item => item.id === selectedId)}
        <p class="notice">Current recording is outside these search results.</p>
      {/if}
      {#if results.length === 0}<p>No recordings match this search</p>{/if}
      <ul class="recording-list" aria-labelledby="recording-count">
        {#each results as item (item.id)}
          <li class:current-record={route.page === 'recording' && item.id === selectedId}>
            <div class="record-identity">
              <strong class="record-title">{item.name}</strong>
              {#if route.page === 'recording' && item.id === selectedId}<span class="current-label">Current recording</span>{/if}
            </div>
            <p class="record-id">{item.id} · <time datetime={item.date}>{item.date}</time></p>
            <p class="muted">Map: {item.map} · Seed: {item.seed}</p>
            <!-- This navigates to a review; it is not a toggle or listbox option.
                 Reviewing and aria-current identify the already-open state, while
                 aria-controls names the detail target. Keep the current action
                 enabled as a useful return shortcut that preserves the draft. -->
            <button type="button" aria-current={route.page === 'recording' && item.id === selectedId ? 'true' : undefined} aria-controls={route.page === 'recording' ? 'review-panel' : undefined}
              onclick={event => selectRecording(item.id, fromPointer(event))}>{route.page === 'recording' && item.id === selectedId ? 'Reviewing' : 'Review'} {item.name}</button>
            <!-- The arrow supplements identity/current text and control semantics.
                 It is not another focus stop or accessible name. CSS points right
                 when adjacent and down when stacked; no unrelated result receives
                 a connector when filtering hides the selected source. -->
            {#if route.page === 'recording' && item.id === selectedId}<span class="relationship-cue" aria-hidden="true">
              <span class="relationship-label">Details below</span>
              <svg viewBox="0 0 32 24"><path d="M2 12h26m-7-7 7 7-7 7" /></svg>
            </span>{/if}
          </li>
        {/each}
      </ul>
    </section>

    <!-- Repeat name and stable ID so the connection survives scrolling, filtering
         and loss of color. CSS matches the active card's surface and title accent.
         tabindex=-1 supports deliberate heading focus without adding a plain
         heading to the ordinary tab sequence. -->
    {#if route.page === 'recording'}
    <section id="review-panel" class="review-panel panel" aria-labelledby="review-heading">
      <div class="review-header">
        <p class="eyebrow">Current recording · {record.date}</p>
        <h2 id="review-heading" tabindex="-1" bind:this={reviewHeading}>{record.name} <span class="record-id">{record.id}</span></h2>
      </div>
      <section aria-labelledby="timing-heading" class="timing-section">
        <h3 id="timing-heading">Timing</h3>
        <!-- Terms, concise meanings and values express the relationship without an
             unnecessary chart. Essential explanations remain when help is closed.
             UTC-05:00 describes these January fixtures, not a live conversion. -->
        <dl class="timing-facts">
          <div><dt>Time zone</dt><dd><span class="meaning">Used for recording timestamps</span><strong>America/New_York · UTC−05:00</strong></dd></div>
          <div><dt>Simulation duration</dt><dd><span class="meaning">Time elapsed inside the simulation</span><strong>{record.simulation}</strong></dd></div>
          <div><dt>Execution time</dt><dd><span class="meaning">Real elapsed time, including recorded pauses</span><strong>{record.execution}</strong></dd></div>
        </dl>
        <!-- Bits supplies disclosure interaction/semantics; the app owns the bound
             expansion value. Keep the trigger in a heading and use ordinary parts.
             Persistent multi-sentence help belongs in a disclosure, not a tooltip
             that disappears as the pointer moves. No custom snippet is needed. -->
        <Collapsible.Root bind:open={helpExpanded} class="timing-help">
          <h4><Collapsible.Trigger type="button" class="help-trigger"><span aria-hidden="true">{helpExpanded ? '−' : '+'}</span> About these timings</Collapsible.Trigger></h4>
          <Collapsible.Content class="timing-help-panel"><p>{copy.timingHelp}</p></Collapsible.Content>
        </Collapsible.Root>
      </section>

      <!-- A named form separates editable assessment from recording facts within
           one active context. Native fields cover this task. Labels/descriptions
           stay available while typing; placeholders would not. Submission captures
           a snapshot without navigating away or claiming a pending save succeeded. -->
      <form class="review-form" aria-labelledby="assessment-heading" onsubmit={event => {
        event.preventDefault();
        requestSave(workspace, selectedId);
      }}>
        <!-- Bits owns tab roles and manual keyboard activation. Keep source facts
             separate from assessment fields, while identity/timing and Save remain
             outside hidden panels. State belongs to the workspace, not the panel. -->
        <h3 id="assessment-heading" class="local-view-label">Recording workspace</h3>
        <Tabs.Root value={view} onValueChange={value => navigate(reviewAddress(selectedId, value), false)} activationMode="manual">
          <Tabs.List aria-label="Recording views" class="record-tabs">
            {#each recordViews as item (item.id)}<Tabs.Trigger value={item.id}>{item.title}</Tabs.Trigger>{/each}
          </Tabs.List>
          <Tabs.Content value="review" class="record-tab-panel">
            <h4>Your review</h4>
            <div class="field">
              <div class="field-heading"><label for="review-status">Review status</label><ContextHelp topic="review status" kind="question" text={contextualHelp.reviewStatus} {textSize} /></div>
              <p id="status-help" class="muted">Your assessment of this recording.</p>
              <select id="review-status" aria-describedby="status-help" value={current.draft.status}
                onchange={event => updateDraft(workspace, selectedId, 'status', event.currentTarget.value)}>
                {#each reviewStatuses as status (status)}<option>{status}</option>{/each}
              </select>
            </div>
            <div class="field">
              <label for="review-note">Review note</label>
              <p id="note-help" class="muted">Record what you found or what needs follow-up.</p>
              <textarea id="review-note" rows="5" aria-describedby="note-help" value={current.draft.note}
                oninput={event => updateDraft(workspace, selectedId, 'note', event.currentTarget.value)}></textarea>
            </div>
          </Tabs.Content>
          <Tabs.Content value="details" class="record-tab-panel">
            <h4>Recording metadata</h4>
            <dl class="record-metadata">
              <div><dt>Recorded date</dt><dd>{record.date}</dd></div>
              <div><dt>Map</dt><dd>{record.map}</dd></div>
              <div><dt>Seed</dt><dd>{record.seed}</dd></div>
            </dl>
            <p class="muted">{copy.metadataHelp}</p>
          </Tabs.Content>
        </Tabs.Root>
        <!-- Put scope, actual result and disabled reason beside Save. Only duplicate
             saving is blocked while pending; inputs remain editable. Feedback must
             distinguish the submitted snapshot from newer work, not just display
             a spinner or a success-colored button. -->
        <div class="save-area">
          <p id="save-scope" class="muted">Saves the status and note for {record.id} in this demo only. Reloading resets it.</p>
          <p id="save-feedback" class="save-feedback" class:error={current.lastResult === 'failed' && dirty}>{feedback}</p>
          <div class="save-actions">
            <button class="primary" type="submit" disabled={!!current.attempt || !dirty} aria-describedby="save-scope save-feedback save-reason">Save review</button>
                <ContextHelp topic="demo saving" kind="warning" text={contextualHelp.demoSave} {textSize} />
            <p id="save-reason" class="muted">{current.attempt ? 'Save in progress.' : !dirty && current.version > 0 ? 'No unsaved changes.' : ''}</p>
          </div>
        </div>
      </form>
    </section>
    {/if}
  </div>
  {/if}

  <!-- Test controls make failure/delay reproducible without timers. Their separate
       disclosure keeps simulation machinery out of the ordinary review task.
       Attempt groups name the originating record after selection moves; the
       surviving heading receives focus when a focused resolver disappears. -->
  {#if route.page === 'recording'}
  <details class="demo-controls">
    <summary><h2 tabindex="-1" bind:this={demoHeading}>Demo save controls</h2></summary>
    <div class="disclosure-body">
      <p class="muted">Saves wait here until you complete or fail them. These controls simulate a response; they do not store anything beyond this page.</p>
      {#if pendingRecords.length === 0}<p>No saves waiting.</p>{/if}
      <ul class="pending-list">
        {#each pendingRecords as item (workspace.records[item.id].attempt.token)}
          {@const attempt = workspace.records[item.id].attempt}
          <li>
            <h3 id={`attempt-${attempt.token}`}>{item.name} · {item.id} · Attempt {attempt.token}</h3>
            <div class="resolver-actions" role="group" aria-labelledby={`attempt-${attempt.token}`}>
              <button type="button" onclick={event => resolve(item.id, attempt.token, true, event)}>Complete save</button>
              <button type="button" onclick={event => resolve(item.id, attempt.token, false, event)}>Fail save</button>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </details>
  {/if}
  <!-- One persistent region supplements visible feedback with scoped save events,
       not every keystroke. Actual screen-reader announcement quality is still
       pending; having these attributes is not proof that it has been verified. -->
  <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{workspace.announcement}</div>
  <!-- A compact disclosure repeats destinations without a second competing
       tablist or a fixed bar covering content. Back to top restores keyboard focus. -->
  <footer class="page-footer">
    {@render breadcrumbTrail('bottom')}
    <div class="footer-actions">
      <details class="footer-sections"><summary>Sections</summary>
        <nav aria-label="Footer sections">
          <a href={pages.workspace.href} onclick={followLink}>All pages</a>
          <a href={pages.recordings.href} onclick={followLink}>All recordings</a>
          <a href={pages.preferences.href} onclick={followLink}>Workspace preferences</a>
          {#if route.page === 'recording'}
            {#each recordViews as item (item.id)}<a href={reviewAddress(selectedId, item.id)} aria-current={item.id === view ? 'true' : undefined} onclick={followLink}>{item.title}</a>{/each}
          {/if}
        </nav>
      </details>
      <a href="#page-heading" onclick={toTop}>Back to top</a>
    </div>
    <p>Svelte 5 reference · Bits UI is provisional · Fictional recordings</p>
  </footer>
</main>
