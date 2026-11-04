import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { reopen, definitions } from './review-core.js';
import { loadConfig, initialize, current, saveRecord, recordRendered, runCheck, checkedPath, atomic, latestMilestone } from './review-io.mjs';

export async function main(args = process.argv.slice(2)) {
  args = [...args];
  const flag = args.indexOf('--config');
  const filename = flag < 0 ? 'review.config.json' : args.splice(flag, 2)[1];
  const resultFlag = args.indexOf('--result');
  const resultFile = resultFlag < 0 ? null : args.splice(resultFlag, 2)[1];
  const milestoneFlag = args.indexOf('--milestone');
  const milestone = milestoneFlag < 0 ? null : args.splice(milestoneFlag, 2)[1];
  const context = await loadConfig(filename);
  const [command, id, file] = args;
  let result;
  if (command === 'init') result = await initialize(context);
  else if (command === 'run') {
    const ids = args.slice(1);
    if (!ids.length || new Set(ids).size !== ids.length || ids.some(id => !definitions.some(d => d.id === id && d.method !== 'rendered') || !context.config.adapters?.[id])) throw new Error('Name distinct automated check IDs with configured adapters.');
    ids.sort((a, b) => definitions.findIndex(d => d.id === a) - definitions.findIndex(d => d.id === b));
    for (const checkId of ids) {
      result = await runCheck(context, checkId);
      if (result.checks.find(c => c.id === checkId).evidence.automated.status !== 'Pass') break;
    }
    result = (await current(context)).record;
  }
  else if (command === 'milestone') result = await latestMilestone(context);
  else if (command === 'record') result = await recordRendered(context, id, file, milestone);
  else if (command === 'record-batch') {
    const entries = JSON.parse(await readFile(await checkedPath(context.root, id), 'utf8'));
    if (!Array.isArray(entries) || !entries.length || new Set(entries.map(e => e.checkId)).size !== entries.length || entries.some(e => !definitions.some(d => d.id === e.checkId && d.method !== 'automated') || typeof e.file !== 'string')) throw new Error('Use an array of distinct rendered {checkId, file} entries.');
    entries.sort((a, b) => definitions.findIndex(d => d.id === a.checkId) - definitions.findIndex(d => d.id === b.checkId));
    for (const entry of entries) result = await recordRendered(context, entry.checkId, entry.file, entry.milestone);
  }
  else if (command === 'reopen') {
    const saved = await current(context);
    result = reopen(saved.record, id, args.slice(2).join(' '));
    await saveRecord(context, result, saved.token);
  } else if (command === 'status' || command === 'report') {
    const saved = await current(context);
    result = saved.record;
    // Persist invalidation so restored evidence cannot reuse an interrupted clock.
    const original = JSON.parse(saved.raw);
    const invalid = result.gates.find(g => g.status !== 'Pass' && original.gates?.some(old => old.id === g.id && old.status === 'Pass'));
    if (invalid || (original.allPassedAt && !result.allPassedAt)) {
      result = reopen(result, invalid?.id || 'E', 'Evidence invalidated during status inspection.');
      await saveRecord(context, result, saved.token);
      result = (await current(context)).record;
    }
    if (command === 'report') return `Acceptance snapshot generated ${new Date().toISOString()}; rerun report before handoff or after changes.\nBuild ${result.build}\nScope: ${result.contract.verificationScope}\nUnverified: ${result.contract.unverified.join('; ') || 'no additional areas declared'}\n${result.gates.map(g => `${g.id} ${g.status}: ${g.checks.filter(c => !['Pass', 'Not applicable'].includes(c.status)).map(c => `${c.id} (${c.issue || c.status})`).join('; ')}`).join('\n')}\nRequested outcomes: ${result.contract.coverage.map(c => `${c.id}: ${c.outcome} (request: ${c.requestReference}; minimum proof: ${c.proof})`).join('; ')}\nRequired gaps mean unfinished work; continue authorized feasible tasks or name a concrete blocker.\nLocal evidence validation; reviewer independence and output quality are not established by this tool.`;
  } else if (command === 'inventory') {
    const { captureInventory, compareInventories } = await import('./review-inventory.mjs');
    if (id === 'capture') {
      result = await captureInventory(context.config.inventory, context.identity.build);
      await atomic(await checkedPath(context.root, file), JSON.stringify(result, null, 2));
    } else if (id === 'compare') {
      const read = async name => JSON.parse(await readFile(await checkedPath(context.root, name), 'utf8'));
      const after = await read(args[3]);
      if (after.build !== context.identity.build) throw new Error('Capture the after inventory against the current source build.');
      result = compareInventories(await read(file), after, args[4] ? await read(args[4]) : []);
      if (resultFile) {
        const structured = { checkId: 'preservation', build: context.identity.build, status: result.status, task: context.config.task, route: 'Declared inventory scope', observation: JSON.stringify(result) };
        await atomic(await checkedPath(context.root, resultFile), JSON.stringify(structured));
      }
    } else throw new Error('Use inventory capture OUTPUT or inventory compare BEFORE AFTER [AUTHORIZATIONS].');
  } else throw new Error('Use init, run CHECK [CHECK...], record CHECK FILE [--milestone PATH], record-batch MANIFEST, milestone, reopen GATE REASON, status, inventory or report.');
  return result?.schemaVersion === 2 ? (await current(context)).record : result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().then(result => {
    console.log(typeof result === 'string' ? result : result?.gates ? `Build ${result.build}\n${result.gates.map(g => `${g.id}: ${g.status}`).join(' · ')}\n${result.checks.filter(c => !['Pass', 'Not applicable'].includes(c.status)).map(c => `${c.id}: ${c.issue || c.status}`).join('\n')}` : JSON.stringify(result, null, 2));
    if (process.argv.includes('run') && result?.checks?.some(c => c.evidence?.automated && c.evidence.automated.status !== 'Pass')) process.exitCode = 1;
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
