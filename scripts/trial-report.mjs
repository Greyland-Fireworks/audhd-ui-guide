// Repository evaluation helper; never shipped with the consumer toolkit.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const escape = value => String(value && typeof value === 'object' ? JSON.stringify(value) : value ?? 'Unknown').replaceAll('|', '\\|').replaceAll('\n', ' ');
export function trialReport(records) {
  const lines = ['# Saved implementation trials', '', 'Stages are reported separately. This report does not rank dashboard quality.', '', '| Trial / stage | Workflow timing | Functional / recovery / navigation / explanations / organization | Evidence |', '|---|---|---|---|'];
  for (const record of records) {
    if (record.schemaVersion !== 1 || !record.id || !record.prompt || !record.toolkitHash || !record.firstCompleted || !Array.isArray(record.repairs)) throw new Error('Record exact prompt, toolkit hash, first completed output and repairs separately.');
    const stages = [record.firstCompleted, ...record.repairs];
    if (record.firstCompleted.stage !== 'first-completed' || record.repairs.some(s => s.stage === 'first-completed')) throw new Error('A repair cannot replace first completed output.');
    for (const stage of stages) {
      if (!stage.build || !stage.reviewerMethod || !Array.isArray(stage.evidence) || !['timely', 'retrospective', 'unknown'].includes(stage.workflowTiming)) throw new Error('Record stage build, reviewer method, evidence and workflow timing.');
      lines.push(`| ${escape(record.id)} / ${escape(stage.stage)} / build ${escape(stage.build)} | ${escape(stage.workflowTiming)} | ${['functional', 'recovery', 'navigation', 'explanations', 'organization'].map(k => `${k}: ${escape(stage.outcomes?.[k])}`).join('; ')} | ${escape(stage.reviewerMethod)}; ${stage.evidence.map(escape).join(', ')} |`);
    }
    lines.push('', `Trial ${escape(record.id)}: toolkit ${escape(record.toolkitHash)}; model/settings ${escape(record.modelSettings)}; environment assistance ${escape(record.environmentAssistance)}.`, '', 'Exact prompt:', '', '```text', record.prompt.replaceAll('```', '` ` `'), '```', '');
  }
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(trialReport(await Promise.all(process.argv.slice(2).map(async p => JSON.parse(await readFile(p, 'utf8')))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
