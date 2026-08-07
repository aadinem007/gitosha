/**
 * Only one stage/quiet WebGL scene may be live at a time.
 * Hero (`full`) scenes are independent and always allowed.
 */
type Listener = (active: boolean) => void;

let seq = 0;
let activeId: number | null = null;
const listeners = new Map<number, Listener>();

function broadcast() {
  for (const [id, cb] of listeners) {
    cb(id === activeId);
  }
}

/** Claim the single stage slot. Caller must release on unmount / leave-view. */
export function acquireStageSlot(onChange: Listener): () => void {
  const id = ++seq;
  listeners.set(id, onChange);
  activeId = id;
  broadcast();

  return () => {
    listeners.delete(id);
    if (activeId === id) {
      activeId = null;
      const next = listeners.keys().next();
      if (!next.done) {
        activeId = next.value;
      }
      broadcast();
    }
  };
}
