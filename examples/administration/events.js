// AUDHD-04 / GUIDE.md#readable-activity-and-warning-review: the session log
// records completed observations. It does not replace task state or turn a
// historical success into proof that a newer saved version is verified.
const events = [];
const listeners = new Set();
let sequence = 0;

export function recordEvent({ level = 'info', description, action, subject, version, operationId, href, actionLabel }) {
  if (!['info', 'warning', 'error', 'unknown'].includes(level)) throw new TypeError('Unsupported activity severity');
  if (typeof description !== 'string' || !description.trim()) throw new TypeError('An activity description is required');
  if ((href !== undefined || actionLabel !== undefined) && (typeof href !== 'string' || !href.startsWith('#') || typeof actionLabel !== 'string' || !actionLabel.trim())) throw new TypeError('An activity destination needs a local route and a descriptive action label');
  // Identity only needs to be unique within this visit. Reload resets both the
  // log and acknowledgments; this module makes no durable audit-log guarantee.
  // Callers supply purpose-written descriptions and must not include secrets.
  const event = Object.freeze({
    id: `visit-${++sequence}`, at: new Date().toISOString(), level, description,
    ...(action !== undefined ? { action } : {}),
    ...(subject !== undefined ? { subject } : {}),
    ...(version !== undefined ? { version } : {}),
    ...(operationId !== undefined ? { operationId } : {}),
    // AUDHD-09: a known remedy names and opens its current owning task. It is
    // navigation, never an automatic retry or proof that an old event is fixed.
    ...(href !== undefined ? { href, actionLabel } : {}),
  });
  events.unshift(event);
  // Notify after the caller's state transition. Rendering an observation must
  // never be part of the mutation's success/failure contract.
  queueMicrotask(() => { for (const listener of listeners) listener(event); });
  return event;
}

export function getSessionEvents() {
  return [...events];
}

export function subscribeActivity(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
