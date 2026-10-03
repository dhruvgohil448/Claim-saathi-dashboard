import type { ClaimStatus, DocStatus } from './types';

export const CLAIM_STATUS: Record<ClaimStatus, { label: string; dot: string; badge: string; chart: string }> = {
  CREATED: { label: 'Created', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 ring-slate-200', chart: '#94A3B8' },
  PREAUTH_SUBMITTED: { label: 'Pre-auth', dot: 'bg-violet', badge: 'bg-violet-50 text-[#5B3FD9] ring-[#DDD3FF]', chart: '#7C5CFC' },
  DOCS_PENDING: { label: 'Docs pending', dot: 'bg-warning', badge: 'bg-warning-50 text-[#A86500] ring-[#FBE1B4]', chart: '#F5A524' },
  UNDER_REVIEW: { label: 'Under review', dot: 'bg-primary', badge: 'bg-primary-50 text-[#0077A8] ring-primary-100', chart: '#00BAF2' },
  QUERY_RAISED: { label: 'Query raised', dot: 'bg-[#F97316]', badge: 'bg-[#FFF1E7] text-[#C2410C] ring-[#FED7BA]', chart: '#F97316' },
  NEEDS_HUMAN: { label: 'Needs human', dot: 'bg-error', badge: 'bg-error-50 text-[#C23B28] ring-[#F8CFC8]', chart: '#E85D4A' },
  APPROVED: { label: 'Approved', dot: 'bg-success', badge: 'bg-success-50 text-[#08805F] ring-[#BFE8DC]', chart: '#0FA37F' },
  REJECTED: { label: 'Rejected', dot: 'bg-[#9AA5B4]', badge: 'bg-[#F1F3F6] text-[#4A5565] ring-[#DDE2E8]', chart: '#9AA5B4' },
  SETTLED: { label: 'Settled', dot: 'bg-navy', badge: 'bg-[#E8EEF7] text-navy ring-[#C9D6EA]', chart: '#002E6E' },
};
export const STATUS_ORDER: ClaimStatus[] = ['CREATED', 'PREAUTH_SUBMITTED', 'DOCS_PENDING', 'QUERY_RAISED', 'UNDER_REVIEW', 'NEEDS_HUMAN', 'APPROVED', 'REJECTED', 'SETTLED'];

export const DOC_STATUS: Record<DocStatus, { label: string; badge: string; dot: string }> = {
  UPLOADED: { label: 'Checking…', badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  VERIFIED: { label: 'Verified', badge: 'bg-success-50 text-[#08805F] ring-[#BFE8DC]', dot: 'bg-success' },
  NEEDS_REVIEW: { label: 'Needs review', badge: 'bg-warning-50 text-[#A86500] ring-[#FBE1B4]', dot: 'bg-warning' },
  INVALID: { label: 'Invalid', badge: 'bg-error-50 text-[#C23B28] ring-[#F8CFC8]', dot: 'bg-error' },
};
