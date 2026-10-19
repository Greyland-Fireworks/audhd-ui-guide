import { recordings } from '../../shared/fixtures.js';
import { pages, recordViews } from '../../shared/navigation.js';

// Only known locations may become the current page. A malformed address gets an
// explicit missing-page view; it never silently displays a different recording.
// No draft or preference is serialized into the URL. React owns its own parser.
export function parseLocation(fragment) {
  if (fragment === '') return { page: 'recording', id: recordings[0].id, view: 'review' };
  for (const item of Object.values(pages)) {
    if (fragment === item.href) return { page: item.id };
  }
  const parts = fragment.slice(1).split('/');
  if (fragment.startsWith('#') && parts[0] === 'recordings' && (parts.length === 2 || parts.length === 3)) {
    const record = recordings.find(item => item.id === parts[1]);
    const view = parts.length === 2 ? 'review' : parts[2];
    if (record && recordViews.find(item => item.id === view)) return { page: 'recording', id: record.id, view };
  }
  return { page: 'missing' };
}

export function reviewAddress(id, view = 'review') {
  return '#recordings/' + id + '/' + view;
}
