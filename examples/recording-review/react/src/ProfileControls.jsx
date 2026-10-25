import { useEffect, useRef, useState } from 'react';
import { createImportWorkflow } from 'audhd-ui-framework/import-workflow';
import { recordingCapabilities, capabilityMessage, importMessage } from '../../shared/profile-capabilities.js';

export default function ProfileControls({ profile, onApply }) {
  const [state, setState] = useState({ state: 'idle', preview: null, error: null });
  const [message, setMessage] = useState('');
  const input = useRef(null), workflow = useRef(null);
  const { preview, error } = state;
  useEffect(() => {
    // Create on each setup so StrictMode's setup/cleanup cycle stays usable.
    const controller = createImportWorkflow({ capabilities: recordingCapabilities });
    workflow.current = controller;
    setState(controller.getSnapshot());
    const unsubscribe = controller.subscribe(next => { setState(next); setMessage(importMessage(next)); });
    return () => { unsubscribe(); controller.dispose(); };
  }, []);
  function read(event) {
    const file = event.target.files[0];
    event.target.value = '';
    if (file) void workflow.current.importText(() => file.text());
    else workflow.current.cancel();
  }
  function cancel() {
    workflow.current.cancel(); input.current.value = ''; input.current.focus();
  }
  function exportProfile() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(profile, null, 2) + '\n'], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'audhd-preferences.local.json';
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Preference download requested. Reviews and navigation history are not included.');
  }
  return <section className="profile-controls" aria-labelledby="profile-heading">
    <h3 id="profile-heading">Portable preferences</h3>
    <p>Files are read on this device. Apply replaces this session’s preference profile, not your reviews. Unsupported choices remain in exports. Reloading resets the demo.</p>
    <label>Import preferences<input ref={input} type="file" accept="application/json,.json" onChange={read} /></label>
    {error && <p role="alert">{error} Nothing applied.</p>}
    <p role="status">{message}</p>
    {preview && <div className="profile-preview">
      <h4>Application preview</h4>
      <p>Profile scope: {preview.profile.scope}. This demo loads one profile; it does not discover other user or project files.</p>
      <ul>{preview.rows.filter(row => row.value !== null || row.declared).map(row => <li key={row.path}><strong>{row.path}</strong>: <code>{JSON.stringify(row.value)}</code> — {capabilityMessage(row)}</li>)}</ul>
      {/* Keep this button mounted after applying so keyboard focus stays here. */}
      <button type="button" onClick={() => { onApply(workflow.current.getSnapshot().preview.profile); setMessage('Preferences applied for this session. Unsupported choices were retained for export, not applied.'); }}>Apply for this session</button>

    </div>}
    {(state.state === 'reading' || state.state === 'ready') && <button type="button" onClick={cancel}>Cancel import</button>}
    <button type="button" onClick={exportProfile}>Export preferences</button>
  </section>;
}
