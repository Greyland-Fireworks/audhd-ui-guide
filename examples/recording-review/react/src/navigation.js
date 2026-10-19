import { recordings } from '../../shared/fixtures.js';
import { pages, recordViews } from '../../shared/navigation.js';

// URL state identifies location only. Drafts, preferences and search stay in the
// app's in-memory workspace. Parsing is independent of the Svelte implementation.
export function routeFromHash(hash) {
  if (!hash) return { page: 'recording', id: recordings[0].id, view: 'review' };
  const page = Object.values(pages).find(item => item.href === hash);
  if (page) return { page: page.id };
  const match = /^#recordings\/([^/]+)(?:\/([^/]+))?$/.exec(hash);
  if (match && recordings.some(item => item.id === match[1])) {
    const view = match[2] || 'review';
    if (recordViews.some(item => item.id === view)) return { page: 'recording', id: match[1], view };
  }
  return { page: 'missing' };
}

export const recordingHref = (id, view = 'review') => `#recordings/${id}/${view}`;
