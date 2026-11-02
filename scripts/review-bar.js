import { gates, guidance, assess, canHide, verifyPriorMilestone, resultFields } from './review-core.js';

export async function mountReviewBar(host, { resourceBase = import.meta.url, projectRoot = new URL('../', import.meta.url) } = {}) {
  let identity, unavailableSince = 0;
  const interruptionKey = `audhd-review-interruption:${new URL(host.dataset.record, resourceBase).pathname}`;
  try { unavailableSince = Number(sessionStorage.getItem(interruptionKey)) || 0; }
  catch { unavailableSince = Infinity; }
  function interrupted() {
    unavailableSince = Math.max(unavailableSince, Date.now());
    try { sessionStorage.setItem(interruptionKey, String(unavailableSince)); }
    catch { unavailableSince = Infinity; }
  }
  const pending = () => ({ gates: gates.map(([id, name]) => ({ id, name, status: 'Pending', checks: [] })) });
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  const summary = node('summary', '');
  const label = node('span', 'Build review · '); label.className = 'acceptance-label'; summary.append(label);
  summary.title = guidance;
  summary.setAttribute('aria-describedby', 'acceptance-guidance');
  const lights = node('span', ''); lights.className = 'acceptance-lights';
  summary.append(lights);
  const qualifiers = node('span', ''); qualifiers.className = 'acceptance-qualifiers'; summary.append(qualifiers);
  const help = node('p', guidance); help.id = 'acceptance-guidance';
  const explanation = node('p', 'These lights report recorded review evidence, not a guarantee of quality. Open this panel to identify unfinished checks. High effort must be selected in your coding agent; this dashboard cannot change it.');
  const status = node('p', 'Loading review evidence…');
  const rows = node('ol', '');
  host.append(summary, help, explanation, status, rows);
  let signature, requestId = 0, lastRecord = pending(), lastWarning = '';
  async function refresh() {
    const request = ++requestId;
    host.setAttribute('aria-busy', 'true');
    let record, nextIdentity, interruptedRead = false, warning = '';
    const get = async url => {
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error('Review evidence unavailable.');
      return response;
    };
    try {
      nextIdentity = await (await get(new URL(host.dataset.identity, resourceBase))).json();
      record = await (await get(new URL(host.dataset.record, resourceBase))).json();
      const artifacts = new Map();
      for (const check of record.checks || []) for (const [kind, evidence] of Object.entries(check.evidence || {})) {
        try {
          for (const artifact of evidence.artifacts || []) {
            if (/^(?:[a-z]+:|[\\/])|(?:^|[\\/])\.\.(?:[\\/]|$)/i.test(artifact.path)) throw new Error('Unsafe artifact path.');
            if (!artifacts.has(artifact.path)) {
              const bytes = await (await get(new URL(artifact.path, projectRoot))).arrayBuffer();
              if (bytes.byteLength > 8_000_000) throw new Error('Evidence artifact exceeds display limit.');
              const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(n => n.toString(16).padStart(2, '0')).join('');
              artifacts.set(artifact.path, { hash, bytes });
            }
            if (artifacts.get(artifact.path).hash !== artifact.sha256) throw new Error('Artifact changed.');
          }
          if (kind === 'automated') {
            const result = JSON.parse(new TextDecoder().decode(artifacts.get(evidence.resultPath)?.bytes));
            for (const key of resultFields) if (JSON.stringify(result[key]) !== JSON.stringify(evidence[key])) throw new Error('Structured result mismatch.');
          }
          if (evidence.timing === 'reassessed') verifyPriorMilestone(evidence, JSON.parse(new TextDecoder().decode(artifacts.get(evidence.priorMilestone.artifactPath)?.bytes)));
        } catch (error) { evidence.invalidReason = error.message; interruptedRead = true; }
      }
      record = assess(record, nextIdentity);
      if (record.issue) throw new Error(record.issue);
    } catch {
      record = pending(); interruptedRead = true;
      warning = 'Current evidence unavailable or invalid. All gates remain unverified. Run review init/status for this build.';
    }
    if (request !== requestId) return;
    identity = nextIdentity;
    if (interruptedRead) interrupted();
    if (record.allPassedAt && Date.parse(record.allPassedAt) <= unavailableSince) {
      record.allPassedAt = null;
      warning = 'Evidence was unavailable. Run review status and reassess before starting a new completion interval.';
    }
    render(record, warning);
    host.setAttribute('aria-busy', 'false');
  }
  function render(record, warning = '') {
    lastRecord = record; lastWarning = warning;
    const hidden = identity && canHide(record, identity);
    // Do not remove the user's focused or expanded evidence while they read it.
    host.hidden = hidden && !host.open && !host.contains(document.activeElement);
    const next = JSON.stringify([record, warning]);
    if (next === signature) return;
    signature = next;
    const methods = [...new Set((record.checks || []).flatMap(c => Object.values(c.evidence || {}).map(e => e.method)))];
    qualifiers.textContent = !record.gates.some(g => g.status === 'Pass') ? 'Unverified' : `${methods.join(' + ') || 'Review unverified'} · ${identity?.contract?.verificationScope || 'Scope unverified'} · Unverified: ${identity?.contract?.unverified?.join('; ') || 'no additional areas declared'}`;
    summary.setAttribute('aria-label', `Build review: ${record.gates.map(gate => `${gate.id} ${gate.status}`).join(', ')}. ${qualifiers.textContent}`);
    status.textContent = warning || `Build: ${identity?.build || 'unverified'}. ${record.gates.filter(gate => gate.status === 'Pass').length}/5 milestones passed.`;
    lights.replaceChildren(); rows.replaceChildren();
    for (const [index, [id, label, required]] of gates.entries()) {
      const gate = record.gates[index];
      const light = node('span', gate.status === 'Pass' ? '●' : '○');
      const letter = node('span', ` ${id}`); letter.className = 'acceptance-letter'; light.append(letter);
      light.setAttribute('role', 'img');
      light.setAttribute('aria-label', `${label}: ${gate.status}`);
      light.dataset.status = gate.status; lights.append(light);
      const row = node('li', `${label} — ${gate.status}. `);
      const checks = node('ul', '');
      for (const id of required) {
        const check = gate.checks?.find(item => item.id === id);
        const methods = Object.values(check?.evidence || {}).map(e => `${e.method}: ${e.reviewer || e.runner}; ${e.status} — ${e.observation}`).join('; ');
        checks.append(node('li', `${check?.name || id}: ${check?.status || 'Pending'} — ${check?.issue || methods || 'Run the configured assertion and/or record the required rendered review.'}`));
      }
      row.append(checks); rows.append(row);
    }
  }
  render(pending(), 'Loading review evidence…');
  await refresh();
  const timer = setInterval(refresh, 30_000);
  const visible = () => { if (!document.hidden) refresh(); };
  const closed = () => { if (!host.open) render(lastRecord, lastWarning); };
  const blurred = () => queueMicrotask(() => { if (!host.contains(document.activeElement)) render(lastRecord, lastWarning); });
  document.addEventListener('visibilitychange', visible);
  host.addEventListener('toggle', closed);
  host.addEventListener('focusout', blurred);
  return () => { ++requestId; clearInterval(timer); document.removeEventListener('visibilitychange', visible); host.removeEventListener('toggle', closed); host.removeEventListener('focusout', blurred); };
  }
