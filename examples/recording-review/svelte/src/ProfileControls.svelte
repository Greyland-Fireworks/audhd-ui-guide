<script>
  import { onMount } from 'svelte';
  import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
  import { recordingCapabilities, capabilityMessage, importMessage } from '../../shared/profile-capabilities.js';
  let { profile, onApply } = $props();
  let state = $state({ state: 'idle', preview: null, error: null });
  let preview = $derived(state.preview), error = $derived(state.error);
  let message = $state('');
  let input, workflow;
  // AUDHD-07 (../../../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status).
  // The framework import-workflow.js owns stale-read suppression and preview
  // isolation. This subscription only reflects that controller. Dispose when this
  // destination unmounts so a late read cannot restore an abandoned preview;
  // applied preferences remain in App rather than in this mounted file picker.
  onMount(() => {
    workflow = createImportWorkflow({ capabilities: recordingCapabilities });
    const unsubscribe = workflow.subscribe(next => { state = next; message = importMessage(next); });
    return () => { unsubscribe(); workflow.dispose(); };
  });
  // AUDHD-06 (../../../../GUIDE.md#audhd-06-make-saving-and-recovery-understandable).
  // Clear the native picker after capturing its File so the same file can be
  // selected again after an error. Reading only prepares a preview; onApply is
  // called by the explicit Apply action, never by a completed read.
  function read(event) {
    const file = event.currentTarget.files[0];
    event.currentTarget.value = '';
    if (file) void workflow.importText(() => file.text());
    else workflow.cancel();
  }
  // AUDHD-05 (../../../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability).
  // Cancel removes its own action/preview. Return focus to the surviving picker
  // so keyboard users have a useful next step instead of focus falling to body.
  function cancel() {
    workflow.cancel(); input.value = ''; input.focus();
  }
  // AUDHD-07 (../../../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status).
  // Export the requested preference profile, including unapplied values, without
  // review data. The browser owns the destination and may cancel the download;
  // the status therefore reports a request, not confirmed durable storage.
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2) + '\n'], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'audhd-preferences.local.json';
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    message = 'Preference download requested. Reviews and navigation history are not included.';
  }
</script>

<section class="profile-controls" aria-labelledby="profile-heading">
  <h3 id="profile-heading">Portable preferences</h3>
  <p>Files are read on this device. Apply replaces this session’s preference profile, not your reviews. Unsupported choices remain in exports. Reloading resets the demo.</p>
  <label>Import preferences<input bind:this={input} type="file" accept="application/json,.json" onchange={read} /></label>
  {#if error}<p role="alert">{error} Nothing applied.</p>{/if}
  <p role="status">{message}</p>
  {#if preview}
    <div class="profile-preview">
      <h4>Application preview</h4>
      <p>Profile scope: {preview.profile.scope}. This demo loads one profile; it does not discover other user or project files.</p>
      <ul>{#each preview.rows.filter(row => row.value !== null || row.declared) as row (row.path)}<li><strong>{row.path}</strong>: <code>{JSON.stringify(row.value)}</code> — {capabilityMessage(row)}</li>{/each}</ul>
      <!-- AUDHD-05 (../../../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability).
        Remain mounted after applying: applying preferences is not navigation. -->
      <button type="button" onclick={() => { onApply(workflow.getSnapshot().preview.profile); message = 'Preferences applied for this session. Unsupported choices were retained for export, not applied.'; }}>Apply for this session</button>

    </div>
  {/if}
  {#if state.state === 'reading' || state.state === 'ready'}<button type="button" onclick={cancel}>Cancel import</button>{/if}
  <button type="button" onclick={download}>Export preferences</button>
</section>
