import { mountReviewBar } from '../../scripts/review-bar.js';

// Compatibility entry point; consumers reuse the same tested display.
await mountReviewBar(document.querySelector('#acceptance-review'), {
  resourceBase: import.meta.url, projectRoot: new URL('../../', import.meta.url),
});
