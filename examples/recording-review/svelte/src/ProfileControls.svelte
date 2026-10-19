<script>
  import { parseProfile } from '../../../../preferences/profile.js';
  import { inspectProfile } from '../../shared/profile-capabilities.js';
  let { profile, onApply } = $props();
  let preview = $state(null);
  let message = $state('');
  let error = $state('');
  let input;
  let generation = 0;
  async function read(event) {
    const file = event.currentTarget.files[0];
    event.currentTarget.value = '';
    const token = ++generation;
    preview = null; message = ''; error = '';
    if (!file) return;
    try {
      const parsed = parseProfile(await file.text());
      if (generation !== token) return;
      preview = inspectProfile(parsed);
      message = parsed.schema_version === 1 ? 'Version 1 converted to a version 2 preview. Original file unchanged.' : 'Preferences ready to preview. Nothing applied yet.';
    } catch (failure) { if (generation === token) error = failure.message; }
  }
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
      <ul>{#each preview.rows.filter(row => row.value !== 'null' || row.supported) as row (row.path)}<li><strong>{row.path}</strong>: <code>{row.value}</code> — {row.message}</li>{/each}</ul>
      <!-- Remain mounted after applying: applying preferences is not navigation. -->
      <button type="button" onclick={() => { onApply($state.snapshot(preview.profile)); message = 'Preferences applied for this session. Unsupported choices were retained for export, not applied.'; }}>Apply for this session</button>
      <button type="button" onclick={() => { ++generation; preview = null; message = 'Import cancelled. Current preferences unchanged.'; input.value = ''; input.focus(); }}>Cancel import</button>
    </div>
  {/if}
  <button type="button" onclick={download}>Export preferences</button>
</section>
