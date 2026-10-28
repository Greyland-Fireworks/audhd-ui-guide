import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, relative, isAbsolute } from 'node:path';
import assert from 'node:assert/strict';

const root=process.cwd(), skip=new Set(['.git','scratchpad','node_modules','dist','test-results','playwright-report','output','.playwright-cli','__pycache__']);
async function files(dir) {
  const list=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    if(skip.has(entry.name) || (entry.name.startsWith('.') && entry.name!=='.github')) continue;
    const path=resolve(dir,entry.name);
    if(entry.isDirectory()) list.push(...await files(path)); else list.push(path);
  }
  return list;
}
const publicFiles=await files(root), markdown=publicFiles.filter(path=>extname(path)==='.md');
const content=new Map(await Promise.all(markdown.map(async path=>[path,await readFile(path,'utf8')])));
function anchors(text) {
  const set=new Set(), seen=new Map();
  for(const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base=match[1].toLowerCase().replace(/<[^>]+>/g,'').replace(/[^\p{L}\p{N}_\-\s]/gu,'').replace(/\s/g,'-');
    const count=seen.get(base)||0;seen.set(base,count+1);set.add(count?`${base}-${count}`:base);
  }
  for(const match of text.matchAll(/\bid=["']([^"']+)["']/g)) set.add(match[1]);
  return set;
}
const failures=[];
for(const [path,text] of content) {
  for(const match of text.matchAll(/\[[^\]\n]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const link=match[1].replace(/^<|>$/g,'');
    if(/^(https?:|mailto:)/.test(link)) continue;
    const [file,hash]=link.split('#');
    const target=file?resolve(dirname(path),decodeURIComponent(file)):path;
    const targetPath=relative(root,target), targetParts=targetPath.split(/[\\/]/);
    if(isAbsolute(targetPath) || targetParts[0]==='..' || targetParts.includes('scratchpad')) { failures.push(`${relative(root,path)}: non-public link ${link}`);continue; }
    try { await stat(target); } catch { failures.push(`${relative(root,path)}: missing ${link}`);continue; }
    if(hash && content.has(target) && !anchors(content.get(target)).has(decodeURIComponent(hash))) failures.push(`${relative(root,path)}: missing anchor ${link}`);
  }
  if(/\b[UCD]:[\\/]/.test(text)) failures.push(`${relative(root,path)}: local absolute path`);
}
for(const path of publicFiles.filter(p=>/\.(js|jsx|svelte|css|html)$/.test(p))) {
  const text=await readFile(path,'utf8');
  // Documentation checker itself names the excluded source directory.
  if(!path.endsWith('check-docs.js') && /(?:from\s+['"]|href=['"]|src=['"])[^'"\n]*scratchpad/.test(text)) failures.push(`${relative(root,path)}: runtime dependency on private research`);
}
// Compare identities, not just totals: a duplicate must not hide a missing ID.
function checkNumberedIds(file, pattern, prefix, count) {
  const text=content.get(resolve(root,file));
  assert.notEqual(text,undefined,`${file}: missing required document`);
  const actual=[...text.matchAll(pattern)].map(match=>match[1]);
  const expected=Array.from({length:count},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}`);
  assert.deepEqual(actual,expected,`${file}: expected ${prefix}01 through ${expected.at(-1)} in order, without duplicates`);
}
checkNumberedIds('GUIDE.md',/^### (AUDHD-\d{2}) /gm,'AUDHD-',13);
const evaluationFiles=['EVALUATION_INPUTS.md','EVALUATION_RUBRIC.md'];
const evaluationCount=evaluationFiles.filter(file=>content.has(resolve(file))).length;
assert([0,2].includes(evaluationCount),'Evaluation inputs and rubric must be present together');
for(const file of evaluationFiles) {
  if(content.has(resolve(file))) checkNumberedIds(file,/^## (E\d{2}) /gm,'E',39);
}
checkNumberedIds('references/ui-readiness-checks.md',/<span id="(check-\d{2})">/g,'check-',50);
if(failures.length) { console.error(failures.join('\n'));process.exitCode=1; }
else console.log(`PASS: ${markdown.length} public Markdown files, relative links/anchors, 13 rules, 50 readiness checks, ${evaluationCount ? '39 evaluation cases' : 'repository-only evaluations'} and source boundaries.`);
