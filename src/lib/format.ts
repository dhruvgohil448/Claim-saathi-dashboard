export const inr = (n: number | null | undefined, compact = false) => {
  if (n == null || Number.isNaN(n)) return '—';
  if (compact && Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 2).replace(/\.?0+$/, '')}L`;
  if (compact && Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

export const date = (d?: string | null, withYear = true) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'Asia/Kolkata' }) : '—';
export const dateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '—';
export const time = (d?: string | null) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }) : '—');

export function ago(d?: string | null) {
  if (!d) return '—';
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d ago`;
  return date(d, false);
}

export const pct = (n?: number | null) => (n == null ? '—' : `${Math.round(n * 100)}%`);
export const titleCase = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const initials = (name?: string) => (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export const DOC_LABELS: Record<string, string> = {
  HEALTH_CARD: 'Health e-card', POLICY_SCHEDULE: 'Policy schedule', CLAIM_FORM: 'Claim form', PREAUTH_FORM: 'Pre-auth request', DOCTOR_ESTIMATE: "Doctor's estimate",
  DISCHARGE_SUMMARY: 'Discharge summary', HOSPITAL_BILL: 'Hospital bill', PHARMACY_BILL: 'Pharmacy bill', LAB_REPORT: 'Lab report', PRESCRIPTION: 'Prescription',
  PAYMENT_RECEIPT: 'Payment receipt', ID_PROOF: 'ID proof', OTHER: 'Other',
};
export const docLabel = (t?: string | null) => (t ? DOC_LABELS[t] ?? titleCase(t) : '—');
