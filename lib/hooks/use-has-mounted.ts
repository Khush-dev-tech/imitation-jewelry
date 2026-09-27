import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * True only once mounted on the client. Used wherever a component reads
 * localStorage-backed state (the cart) that would otherwise mismatch
 * between server and client render.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
