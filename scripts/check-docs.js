import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, dirname, extname, relative } from 'node:path';
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
    if(!target.startsWith(root) || relative(root,target).split(/[\\/]/).includes('scratchpad')) { failures.push(`${relative(root,path)}: non-public link ${link}`);continue; }
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
const guide=content.get(resolve('GUIDE.md'));
assert.equal([...guide.matchAll(/^### AUDHD-\d{2} /gm)].length,13,'Stable 13 rule IDs');
for(const file of ['EVALUATION_INPUTS.md','EVALUATION_RUBRIC.md']) assert.equal([...content.get(resolve(file)).matchAll(/^## E\d{2} /gm)].length,35,`${file}: 35 authored scenarios`);
if(failures.length) { console.error(failures.join('\n'));process.exitCode=1; }
else console.log(`PASS: ${markdown.length} public Markdown files, relative links/anchors, 13 rules, 35 evaluation cases and source boundaries.`);
