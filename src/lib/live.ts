/**
 * Live updates. Primary: Server-Sent Events from GET /api/stream (server pushes a "change" event whenever the
 * Claim Agent, the mobile app or an ops user changes data) → we invalidate the active react-query caches.
 * Fallback: react-query polling. While the stream is connected we poll every 30 s as a safety net;
 * when it is down we poll every 5 s so nothing goes stale.
 */
import { useSyncExternalStore } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { API_URL, getToken } from './api';

export type LiveState = 'connecting' | 'live' | 'polling';
let state: LiveState = 'connecting';
let lastEventAt: number | null = null;
const subs = new Set<() => void>();
const set = (s: LiveState) => {
  if (state === s) return;
  state = s;
  subs.forEach((f) => f());
};

export const POLL_LIVE_MS = 30_000;
export const POLL_FALLBACK_MS = 5_000;
/** Used as the default refetchInterval for every query. */
export const pollInterval = () => (state === 'live' ? POLL_LIVE_MS : POLL_FALLBACK_MS);

// Queries that must not be refetched on every change (signed file URLs would reload the preview iframe).
const SKIP = new Set(['doc-url', 'search', 'public-summary']);

let es: EventSource | null = null;
let retry: ReturnType<typeof setTimeout> | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;

export function startLive(qc: QueryClient) {
  stopLive();
  const token = getToken();
  if (!token || typeof EventSource === 'undefined') return set('polling');
  set('connecting');
  es = new EventSource(`${API_URL}/api/stream?token=${encodeURIComponent(token)}`);
  es.addEventListener('ready', () => set('live'));
  es.addEventListener('change', () => {
    lastEventAt = Date.now();
    set('live');
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => qc.invalidateQueries({ predicate: (q) => !SKIP.has(String(q.queryKey[0])) }), 150);
  });
  es.onerror = () => {
    set('polling');
    // EventSource retries by itself; if the browser gave up (CLOSED), reconnect manually.
    if (es?.readyState === EventSource.CLOSED && !retry) retry = setTimeout(() => ((retry = null), startLive(qc)), 5000);
  };
}

export function stopLive() {
  es?.close();
  es = null;
  if (retry) clearTimeout(retry);
  retry = null;
}

export function useLive() {
  const s = useSyncExternalStore(
    (f) => (subs.add(f), () => void subs.delete(f)),
    () => state,
  );
  return { state: s, lastEventAt };
}
