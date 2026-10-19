import { useRef, useState } from 'react';
import { parseProfile } from '../../../../preferences/profile.js';
import { inspectProfile } from '../../shared/profile-capabilities.js';

export default function ProfileControls({ profile, onApply }) {
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const input = useRef(null);
  const request = useRef(0);
  async function read(event) {
    const file = event.target.files[0];
    event.target.value = '';
    const token = ++request.current;
    setPreview(null); setError(''); setMessage('');
    if (!file) return;
    try {
      const value = parseProfile(await file.text());
      if (token !== request.current) return;
      setPreview(inspectProfile(value));
      setMessage(value.schema_version === 1 ? 'Version 1 converted to a version 2 preview. Original file unchanged.' : 'Preferences ready to preview. Nothing applied yet.');
    } catch (failure) { if (token === request.current) setError(failure.message); }
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
      <ul>{preview.rows.filter(row => row.value !== 'null' || row.supported).map(row => <li key={row.path}><strong>{row.path}</strong>: <code>{row.value}</code> — {row.message}</li>)}</ul>
      {/* Keep this button mounted after applying so keyboard focus stays here. */}
      <button type="button" onClick={() => { onApply(preview.profile); setMessage('Preferences applied for this session. Unsupported choices were retained for export, not applied.'); }}>Apply for this session</button>
      <button type="button" onClick={() => { ++request.current; setPreview(null); setMessage('Import cancelled. Current preferences unchanged.'); input.current.value = ''; input.current.focus(); }}>Cancel import</button>
    </div>}
    <button type="button" onClick={exportProfile}>Export preferences</button>
  </section>;
}
