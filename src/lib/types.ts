export type Role = 'CUSTOMER' | 'OPS' | 'ADMIN';
export type ClaimStatus = 'CREATED' | 'PREAUTH_SUBMITTED' | 'DOCS_PENDING' | 'UNDER_REVIEW' | 'QUERY_RAISED' | 'NEEDS_HUMAN' | 'APPROVED' | 'REJECTED' | 'SETTLED';
export type DocStatus = 'UPLOADED' | 'VERIFIED' | 'NEEDS_REVIEW' | 'INVALID';
export type Actor = 'AI' | 'HUMAN' | 'SYSTEM';

export interface User { id: string; name: string; email: string; role: Role; phone?: string | null; city?: string | null }
export interface Deduction { label: string; amount: number; reason: string; clause?: string }
export interface Settlement { id: string; claimId: string; billAmount: number; deductions: Deduction[]; coPayAmount: number; approvedAmount: number; explanation?: string | null; status: 'ESTIMATED' | 'APPROVED' | 'PAID'; utr?: string | null; paidAt?: string | null }
export interface Issue { code: string; severity: 'low' | 'medium' | 'high'; message: string }
export interface Validation {
  valid: boolean; confidence: number; detectedType: string; issues: Issue[];
  checks: { readable: boolean; typeMatches: boolean; nameMatches: boolean | null; dateInPolicyPeriod: boolean | null; amountConsistent: boolean | null; hasSignature: boolean };
  extracted: { name: string | null; date: string | null; amount: number | null; doctor: string | null; hospital: string | null; hasSignature: boolean };
  fix: string | null; summary: string;
}
export interface Doc {
  id: string; claimId: string; type: string; fileName: string; fileUrl: string; mimeType?: string | null; size?: number | null; status: DocStatus; confidence?: number | null;
  validationResult?: Validation | null; reviewedBy?: string | null; reviewNote?: string | null; createdAt: string; updatedAt: string;
  claim?: { id: string; claimNumber: string; patientName: string; hospital: string; status: ClaimStatus };
}
export interface ClaimEvent { id: string; status: ClaimStatus; title: string; description?: string | null; actor: Actor; createdAt: string }
export interface Query { id: string; claimId: string; message: string; requestedDocType?: string | null; response?: string | null; status: 'OPEN' | 'ANSWERED' | 'CLOSED'; createdBy: Actor; respondedAt?: string | null; closedAt?: string | null; createdAt: string; claim?: { id: string; claimNumber: string; patientName: string; hospital: string; status: ClaimStatus } }
export interface Activity { id: string; claimId?: string | null; actor: Actor; actorName?: string | null; action: string; reason: string; confidence?: number | null; createdAt: string; claim?: { id: string; claimNumber: string; patientName: string; status: ClaimStatus } | null }
export interface Suggestion { decision: 'APPROVE' | 'PARTIAL_APPROVE' | 'REJECT' | 'REQUEST_INFO' | 'APPROVE_PREAUTH'; amount: number | null; reason: string; resolved?: boolean; resolvedBy?: string; humanDecision?: string }
export interface BillItem { description: string; qty: number; rate: number; amount: number; category?: string }
export interface Policy {
  id: string; userId: string; insurer: string; planName?: string | null; policyNumber: string; sumInsured: number; roomRentLimit: number; icuLimit?: number | null; coPayPercent: number;
  startDate: string; endDate?: string | null; waitingPeriods: { name: string; months: number }[]; subLimits?: Record<string, number> | null; exclusions: string[]; summary?: string | null; summaryHindi?: string | null; createdAt: string;
  user?: { id: string; name: string; email: string; phone?: string | null }; _count?: { claims: number };
}
export interface ClaimListItem {
  id: string; claimNumber: string; userId: string; policyId: string; patientName: string; hospital: string; hospitalCity?: string | null; reason: string; treatment?: string | null;
  claimType: 'CASHLESS' | 'REIMBURSEMENT'; admissionType: 'PLANNED' | 'EMERGENCY'; isAccident: boolean; admissionDate?: string | null; dischargeDate?: string | null; roomType?: string | null; roomRentPerDay?: number | null; days?: number | null;
  estimatedAmount?: number | null; billAmount?: number | null; billItems?: BillItem[] | null; status: ClaimStatus; aiSummary?: string | null; aiSuggestion?: Suggestion | null; aiConfidence?: number | null; riskLevel?: string | null; riskFlags?: string[] | null;
  reminderCount: number; lastActivityAt: string; createdAt: string; updatedAt: string;
  user?: { id: string; name: string; email: string; phone?: string | null; city?: string | null };
  policy?: Partial<Policy> & { id: string; policyNumber: string };
  settlement?: Partial<Settlement> | null;
  _count?: { documents: number; queries: number };
}
export interface ClaimDetail extends ClaimListItem {
  documents: Doc[]; events: ClaimEvent[]; queries: Query[]; settlement: Settlement | null; activities: Activity[];
  checklist: { stage: 'PREAUTH' | 'FINAL'; required: string[]; missing: string[]; flagged: string[]; verified: string[] };
}
export interface Escalation extends ClaimListItem { kind: 'ESCALATION' | 'PREAUTH'; escalatedAt: string; escalationReason: string | null; documents: { id: string; type: string; status: DocStatus; confidence: number | null }[]; settlement: Settlement | null }
export interface Overview {
  totalClaims: number; claimsThisWeek: number; claimsTrend: number; pendingReview: number; needsHuman: number; openQueries: number; approved: number; rejected: number; awaitingCustomer: number;
  totalClaimValue: number; approvedValue: number; autoHandled: number; escalated: number; autoHandledPct: number; aiActions7d: number; aiActionsTrend: number; humanActions7d: number; avgConfidence: number; documents: Record<string, number>;
}
export interface Charts {
  claimsByStatus: { status: ClaimStatus; count: number }[];
  perDay: { date: string; claims: number; aiActions: number; humanActions: number; escalations: number }[];
  claimsByType: { type: string; count: number }[];
  settlements: { claimNumber: string; patient: string; bill: number; approved: number; deductions: number; status: string }[];
  deductionsByType: { label: string; amount: number }[];
  documentValidation: Record<string, number>;
  aiActionsByType: { action: string; count: number }[];
}
export interface Notification { id: string; title: string; body: string; type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED'; read: boolean; createdAt: string; claimId?: string | null; claim?: { claimNumber: string } | null }
export interface UserRow extends User { createdAt: string; _count: { claims: number; policies: number } }
