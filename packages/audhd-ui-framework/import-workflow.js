import { parseProfile } from './profile.js';
import { inspectCapabilities, validateCapabilities } from './capabilities.js';

export function createImportWorkflow({ capabilities }) {
  const declaration = structuredClone(validateCapabilities(capabilities));
  let snapshot = { state: 'idle', preview: null, error: null };
  let generation = 0, disposed = false;
  const listeners = new Set();
  const getSnapshot = () => structuredClone(snapshot);
  function emit(state, preview = null, error = null) {
    snapshot = { state, preview, error };
    const notification = snapshot;
    for (const listener of [...listeners]) {
      // A listener may cancel or start another import. That transition owns
      // its notifications; do not deliver it again from the superseded loop.
      if (disposed || snapshot !== notification) break;
      if (listeners.has(listener)) listener(getSnapshot());
    }
  }
  return {
    getSnapshot,
    subscribe(listener) {
      if (typeof listener !== 'function') throw TypeError('Subscriber must be a function.');
      if (!disposed) listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async importText(readText) {
      if (disposed) return;
      const ticket = ++generation;
      emit('reading');
      if (disposed || ticket !== generation) return;
      let preview, failure;
      try {
        const text = await readText();
        if (disposed || ticket !== generation) return;
        const profile = parseProfile(text);
        preview = { ...inspectCapabilities(profile, declaration), sourceVersion: profile.schema_version };
      } catch (error) {
        const message = error instanceof Error ? error.message : error;
        failure = typeof message === 'string' && message.trim() ? message : 'Unable to read preferences.';
      }
      if (disposed || ticket !== generation) return;
      if (preview) emit('ready', preview);
      else emit('error', null, failure);
    },
    cancel() {
      if (disposed) return;
      ++generation;
      emit('cancelled');
    },
    dispose() {
      disposed = true;
      ++generation;
      listeners.clear();
      snapshot = { state: 'idle', preview: null, error: null };
    },
  };
}
