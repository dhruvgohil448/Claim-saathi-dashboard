/** Fetch wrapper for the Claim Saathi API. Base URL comes from VITE_API_URL. */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:5050';

const TOKEN_KEY = 'cs_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(public status: number, message: string, public network = false) {
    super(message);
  }
}

type Listener = (down: boolean) => void;
const listeners = new Set<Listener>();
export const onServerStatus = (fn: Listener) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};
const emit = (down: boolean) => listeners.forEach((l) => l(down));

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, { ...init, headers, body });
  } catch {
    emit(true);
    throw new ApiError(0, 'Cannot reach the Claim Saathi server', true);
  }
  emit(false);
  if (res.status === 401 && token) {
    setToken(null);
    if (!location.pathname.startsWith('/login')) location.href = '/login?expired=1';
  }
  const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : null;
  if (!res.ok) throw new ApiError(res.status, data?.error?.message || `Request failed (${res.status})`);
  return data as T;
}
