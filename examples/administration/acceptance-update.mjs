// Compatibility entry point for the shared review CLI.
import { main } from '../../scripts/review.mjs';
main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
