import { readFile, writeFile } from 'node:fs/promises';
import { parseProfile, migrateProfile } from './profile.js';

const [command, input, flag, output, ...extra] = process.argv.slice(2);
try {
  if (!input || extra.length || !['validate', 'migrate'].includes(command) ||
      (command === 'validate' && flag) || (command === 'migrate' && (flag !== '--out' || !output))) {
    throw Error('Usage: npm run preferences -- validate INPUT | migrate INPUT --out NEW_FILE');
  }
  const profile = parseProfile(await readFile(input, 'utf8'));
  if (command === 'migrate') {
    // Exclusive creation protects the source and any existing output/backup.
    await writeFile(output, JSON.stringify(migrateProfile(profile), null, 2) + '\n', { flag: 'wx' });
    console.log(`Wrote version 2 to ${output}. Source unchanged.`);
  } else console.log(`Valid version ${profile.schema_version} profile. Application support is a separate check.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
