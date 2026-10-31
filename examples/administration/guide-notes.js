// AUDHD-03/09/10: teaching annotations are separate from task help. The reader
// can remove commentary without hiding units, consequences or recovery actions.
// See ../../GUIDE.md#audhd-09-put-essential-explanations-beside-the-decision.
// These module-owned preferences last for this visit, just like the demo data.
import { teachingContent } from './teaching-content.js';
const expanded = new Map();
const anchors = {
  '01': 'keep-scope-and-location-visible', '02': 'make-hierarchy-clear-without-repetitive-headings',
  '03': 'offer-manageable-detail-without-hiding-choices', '04': 'explain-effective-behavior',
  '05': 'preserve-focus-and-spatial-stability', '06': 'make-saving-and-recovery-understandable',
  '07': 'distinguish-previews-results-and-runtime-status', '08': 'use-visuals-to-support-decisions',
  '09': 'put-essential-explanations-beside-the-decision', '10': 'support-interruptions-and-working-preferences',
  '11': 'keep-controls-readable-and-operable', '12': 'validate-complete-tasks-and-report-actual-evidence',
  '13': 'protect-consequential-edits-with-scoped-safeguards',
};

// Arguments are authored example markup, not user content. User-entered values
// must be escaped by their owning view before inclusion in any HTML template.
// AUDHD-13: ../../GUIDE.md#audhd-13-protect-consequential-edits-with-scoped-safeguards.
export function guideNote(id, title, bodyHtml, ruleIds = [], options = {}) {
  // AUDHD-03/09: a short observation precedes the optional explanation. Keep
  // existing details IDs and live exercise controls intact: callers and saved
  // disclosure state must survive this presentation change. Authored metadata
  // is centralized by stable ID; a caller can specialize a reused pattern.
  const note = { ...teachingContent[id], ...options };
  const links = ruleIds.map(rule => {
    const number = rule.slice(-2);
    return `<a href="../../GUIDE.md#audhd-${number}-${anchors[number]}">${rule}</a>`;
  }).join(' · ');
  return `<div class="guide-annotation">${note.takeaway ? `<p class="guide-takeaway">${note.takeaway}</p>` : ''}<details class="guide-note" id="${id}" data-guide-key="${id}" ${expanded.get(id) ? 'open' : ''}>
    <summary id="${id}-toggle">Why this design? <span>${title}</span></summary>
    <div class="guide-note-body">${bodyHtml}${note.alternative ? `<p><strong>When to choose differently:</strong> ${note.alternative}</p>` : ''}${note.check ? `<p><strong>How to check:</strong> ${note.check}</p>` : ''}${links ? `<p class="rule-links">Guide: ${links}</p>` : ''}${note.source ? `<p>Implementation: <a href="${note.source}">${note.source}</a></p>` : ''}</div></details></div>`;
}

// Native details supplies keyboard/touch semantics. Capturing toggle events
// records disclosure state without rebuilding the form or moving its caret.
// AUDHD-05: ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
document.addEventListener('toggle', event => {
  const node = event.target;
  if (node.isConnected && node.matches('details[data-guide-key]')) expanded.set(node.dataset.guideKey, node.open);
}, true);

export function restoreGuideNotes(container) {
  for (const node of container.querySelectorAll('details[data-guide-key]')) {
    if (expanded.has(node.dataset.guideKey)) node.open = expanded.get(node.dataset.guideKey);
  }
}

export function setGuideNotes(visible) {
  // AUDHD-05: a hidden teaching control cannot remain the keyboard destination.
  // Toggling this CSS scope preserves task DOM, pending work and open user help.
  // See ../../GUIDE.md#audhd-05-preserve-focus-and-spatial-stability.
  if (!visible && document.activeElement.closest('.guide-annotation,.guide-note,.guide-only')) document.getElementById('guide-toggle').focus();
  document.documentElement.dataset.guideNotes = String(visible);
  document.getElementById('guide-toggle').setAttribute('aria-pressed', String(visible));
}
