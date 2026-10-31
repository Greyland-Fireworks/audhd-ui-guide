import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

// Source comments use repository-relative Guide references even when their
// owning module is nested. Validate anchor identity without interpreting them
// as browser navigation or requiring mechanical comment counts.
const root = process.cwd();
const guide = await readFile(resolve(root, 'GUIDE.md'), 'utf8');
const anchors = new Set([...guide.matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, title]) => title.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-')));
for (const [, id] of guide.matchAll(/\bid=["']([^"']+)["']/g)) anchors.add(id);
const skipped = new Set(['node_modules', '.git', 'scratchpad', 'output', 'dist', 'test-results', 'playwright-report']);
const failures = []; let references = 0;
async function walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (skipped.has(item.name) || item.name.startsWith('.')) continue;
    const file = resolve(dir, item.name);
    if (item.isDirectory()) await walk(file);
    else if (/\.(?:m?js|jsx|svelte|css|html)$/.test(file)) {
      const text = await readFile(file, 'utf8');
      for (const [, anchor] of text.matchAll(/GUIDE\.md#([a-z0-9][a-z0-9_-]*)/g)) {
        // Template-built links are checked through their rendered destinations;
        // a literal prefix alone is not a complete anchor.
        if (text.includes(`GUIDE.md#${anchor}\${`)) continue;
        references++;
        if (!anchors.has(anchor)) failures.push(`${relative(root, file)}: missing Guide anchor ${anchor}`);
      }
      for (const [rule] of text.matchAll(/AUDHD-\d{2}/g)) if (!/^AUDHD-(?:0[1-9]|1[0-3])$/.test(rule)) failures.push(`${relative(root, file)}: unknown ${rule}`);
    }
  }
}
await walk(root);
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${references} source Guide references resolve; source rule IDs remain within AUDHD-01–13.`);
