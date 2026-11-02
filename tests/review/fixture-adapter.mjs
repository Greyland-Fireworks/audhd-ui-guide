import { writeFile } from 'node:fs/promises';
const [checkId, build, result, mode] = process.argv.slice(2);
if (mode === 'timeout') await new Promise(resolve => setTimeout(resolve, 60_000));
if (mode !== 'empty') await writeFile(result, JSON.stringify({ checkId: mode === 'wrong-id' ? 'unrelated' : checkId, build, status: mode === 'skipped' ? 'Skipped' : mode === 'fail' ? 'Fail' : 'Pass', observation: 'Synthetic assertion only.', task: 'Fixture task', route: '#fixture' }));
if (mode === 'fail') process.exitCode = 1;
