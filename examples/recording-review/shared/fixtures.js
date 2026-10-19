// Static comparison inputs only; each framework owns its behavior independently.
// Stable IDs, not filtered positions or names, connect cards, details and drafts.
// Dates deliberately fall in January: the displayed UTC-05:00 offset describes
// these fictional fixtures, not a general timezone conversion implementation.
export const recordings = [
  { id: 'REC-001', name: 'Harbor morning', date: '2026-01-15', map: 'Harbor', seed: '101', simulation: '42 min', execution: '58 min' },
  { id: 'REC-002', name: 'Market loop', date: '2026-01-16', map: 'Market', seed: '202', simulation: '20 min', execution: '24 min' },
  { id: 'REC-003', name: 'Forest evening', date: '2026-01-17', map: 'Forest', seed: '303', simulation: '35 min', execution: '46 min' },
];

export const reviewStatuses = ['Not reviewed', 'Needs follow-up', 'Reviewed'];

export const copy = {
  // Put the retention boundary above the task, not in a tooltip: users need to
  // know that this page's "saved" review will still disappear on reload.
  boundary: 'Demo workspace. Reviews are stored only while this page is open. Reloading or closing it resets the demo.',
  searchHelp: 'Search by test name, date, map, seed or ID.',
  // This explains the relationship between two clocks and the editable review.
  // Concise per-value meanings remain visible even when this detail is closed.
  timingHelp: 'Simulation duration measures time in the simulated world. Execution time measures the real time used to produce this recording and includes its recorded pauses. These values describe the recording and do not change when you edit its review.',
  metadataHelp: 'These source facts identify the recording. Reviewing it changes only your assessment, not its map, seed or timing.',
  failed: 'Save failed. Your edits remain in this page. Choose Save review to retry.',
};

// Brief, verified explanations for unfamiliar choices (AUDHD-09). Save and
// retention consequences remain visible in the app rather than only in help.
export const contextualHelp = {
  demoSave: 'This is a save simulation, not permanent storage. Save review only stages your assessment in this open page; the demo controls simulate success or failure. Nothing is written to a file or server, and reloading loses the review.',
  skin: 'Change the colors across this workspace to suit your comfort or mood. Light and dark choices keep the same controls, recording and review.',
  textStyle: 'System uses your device’s usual interface font. Skin headings adds the skin’s character to headings only; Serif and Monospace change the reading style throughout the workspace.',
  reviewStatus: 'Choose Needs follow-up when you want to return to an issue, or Reviewed when your assessment is complete. These labels describe your assessment, not whether the recording itself passed a test.',
};
