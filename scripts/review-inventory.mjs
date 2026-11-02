import { chromium } from '@playwright/test';

// Deliberately bounded: only declared routes and controls in an isolated browser.
// No form submission, live fault injection, arbitrary script or crawler hooks.
export async function captureInventory(config, build) {
  if (!config?.baseURL || !Array.isArray(config.states) || !config.states.length) throw new Error('Declare an inventory baseURL and route/state scope.');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const result = { schemaVersion: 1, build, states: [], capabilities: [] };
  const identifiers = new Set();
  try {
    for (const state of config.states) {
      if (!state.id || !state.route || state.synthetic !== true || !Array.isArray(state.capabilities) || !state.capabilities.length) throw new Error('Every inventory state must explicitly declare a synthetic route and capabilities.');
      const url = new URL(state.route, config.baseURL);
      if (url.origin !== new URL(config.baseURL).origin) throw new Error('Inventory route leaves the declared origin.');
      const visit = { id: state.id, route: state.route, visited: false, expected: state.capabilities.map(c => c.id) };
      result.states.push(visit);
      try { const response = await page.goto(url.href); if (response && !response.ok()) throw new Error(`Route returned HTTP ${response.status()}`); await page.locator(state.ready || 'body').waitFor(); visit.visited = true; }
      catch (e) { visit.issue = e.message; continue; }
      for (const item of state.capabilities) {
        if (!item.id || !item.selector || !Array.isArray(item.behavior) || !item.behavior.length || identifiers.has(item.id)) throw new Error('Declare unique stable capability IDs, selectors and behavior references.');
        identifiers.add(item.id);
        const control = page.locator(item.selector);
        if (await control.count() !== 1 || !await control.isVisible()) continue;
        const snapshot = await control.ariaSnapshot();
        const match = snapshot.match(/^\s*- (\w+)(?: "((?:[^"\\]|\\.)*)")?/);
        const detail = await control.evaluate(el => ({ destination: el.getAttribute('href'), form: el.form?.id || el.getAttribute('form') || null }));
        result.capabilities.push({ id: item.id, state: state.id, route: state.route, role: match?.[1] || 'unknown', name: match?.[2] || '', ...detail, behavior: item.behavior });
      }
    }
    return result;
  } finally { await context.close(); await browser.close(); }
}
export function compareInventories(before, after, authorizations = []) {
  const findings = [];
  for (const inventory of [before, after]) {
    if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.states) || !Array.isArray(inventory.capabilities)) throw new Error('Invalid capability inventory.');
    if (new Set(inventory.capabilities.map(c => c.id)).size !== inventory.capabilities.length) throw new Error('Duplicate capability identity.');
    if (!inventory.states.length || !inventory.capabilities.length) findings.push({ severity: 'incomplete', id: 'scope', issue: 'No usable route/capability scope was captured.' });
    for (const state of inventory.states) if (!state.visited) findings.push({ severity: 'incomplete', id: state.id, issue: 'Route or synthetic state was not visited.' });
  }
  for (const state of before.states) for (const id of state.expected || []) if (!before.capabilities.some(c => c.id === id)) findings.push({ severity: 'incomplete', id, issue: 'Declared baseline capability was not captured.' });
  for (const state of before.states) if (!after.states.some(s => s.id === state.id && s.visited)) findings.push({ severity: 'incomplete', id: state.id, issue: 'Required state is absent from the later scope.' });
  for (const old of before.capabilities) {
    const current = after.capabilities.find(c => c.id === old.id);
    const authorization = authorizations.find(a => a.id === old.id && typeof a.reason === 'string' && a.reason.trim() && typeof a.authorization === 'string' && a.authorization.trim());
    if (!current) findings.push({ severity: authorization ? 'authorized' : 'blocking', id: old.id, issue: 'Capability removed.', ...(authorization ? { authorization } : {}) });
    else {
      for (const key of ['destination', 'form', 'role']) if (old[key] !== current[key]) findings.push({ severity: 'blocking', id: old.id, issue: `${key} changed; verify capability preservation.`, before: old[key], after: current[key] });
      if (old.name !== current.name || old.route !== current.route || old.state !== current.state) findings.push({ severity: 'review', id: old.id, issue: 'Label or grouping changed; rendered review required.' });
      if (old.behavior.some(ref => !current.behavior.includes(ref))) findings.push({ severity: 'blocking', id: old.id, issue: 'Declared behavior reference removed.' });
    }
  }
  return { status: findings.some(f => f.severity === 'blocking') ? 'Fail' : findings.some(f => ['incomplete', 'review'].includes(f.severity)) ? 'Pending' : 'Pass', findings, note: 'Presence does not prove behavior. Execute the applicable behavioral checks and rendered review.' };
}
