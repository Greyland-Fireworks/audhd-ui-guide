// Labels, destinations and ancestry are shared facts, not a shared router/state
// engine. Both adapters independently interpret these destinations. Breadcrumbs
// use this canonical parent path; category membership is not invented as ancestry.
export const pages = {
  workspace: { id: 'workspace', title: 'Workspace', href: '#workspace', parentId: null, summary: 'Browse every destination in this reference.' },
  recordings: { id: 'recordings', title: 'Recordings', href: '#recordings', parentId: 'workspace', summary: 'Find a recording and open its review or supporting details.' },
  preferences: { id: 'preferences', title: 'Workspace preferences', href: '#preferences', parentId: 'workspace', summary: 'Choose a skin and text style, adjust text size, spacing and detailed help without changing reviews.' },
};

export const workspaceSections = ['recordings', 'preferences'];
export const recordViews = [
  { id: 'review', title: 'Review' },
  { id: 'details', title: 'Recording details' },
];
