import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { inr, DOC_LABELS } from '@/lib/format';
import type { ClaimListItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input, Label, Select, Textarea } from '@/components/ui/input';

export function useDecision(claim: Pick<ClaimListItem, 'id' | 'claimNumber'>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: { decision: 'APPROVE' | 'REJECT' | 'SETTLE'; note?: string; amount?: number }) => api(`/claims/${claim.id}/decision`, { method: 'POST', json: b }),
    onSuccess: (_d, b) => {
      qc.invalidateQueries();
      const verb = b.decision === 'APPROVE' ? 'approved' : b.decision === 'REJECT' ? 'rejected' : 'marked as paid';
      toast.success(`${claim.claimNumber} ${verb}`, { description: 'The customer has been notified and the decision is logged.' });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function DecisionDialog({ claim, mode, open, onOpenChange, suggested }: { claim: ClaimListItem; mode: 'APPROVE' | 'REJECT'; open: boolean; onOpenChange: (o: boolean) => void; suggested?: number | null }) {
  const m = useDecision(claim);
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState(String(suggested ?? claim.settlement?.approvedAmount ?? ''));
  const approve = mode === 'APPROVE';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={approve ? `Approve ${claim.claimNumber}` : `Reject ${claim.claimNumber}`}
        description={approve ? 'Confirm the payable amount. Any change is recorded as a specialist adjustment.' : 'Tell the customer why. They see this note in the app.'}
        footer={
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant={approve ? 'success' : 'danger'} loading={m.isPending} onClick={() => m.mutate({ decision: mode, note: note || undefined, amount: approve && amount ? Number(amount) : undefined }, { onSuccess: () => onOpenChange(false) })}>
              {approve ? `Approve ${amount ? inr(Number(amount)) : ''}` : 'Reject claim'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {approve && (
            <div>
              <Label>Approved amount (₹)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              {suggested != null && <p className="mt-1.5 text-xs text-muted">AI suggested {inr(suggested)}</p>}
            </div>
          )}
          <div>
            <Label>{approve ? 'Note (optional)' : 'Reason'}</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={approve ? 'e.g. Room rent deduction confirmed with hospital.' : 'e.g. Maternity is covered only after 24 months of continuous cover.'} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function QueryDialog({ claim, open, onOpenChange }: { claim: Pick<ClaimListItem, 'id' | 'claimNumber'>; open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [doc, setDoc] = useState('');
  const m = useMutation({
    mutationFn: () => api(`/claims/${claim.id}/queries`, { method: 'POST', json: { message, requestedDocType: doc || undefined } }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success('Query sent to the customer');
      setMessage('');
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`Raise a query on ${claim.claimNumber}`}
        description="The customer gets a notification with a simple explanation of what to do."
        footer={<><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button loading={m.isPending} disabled={message.trim().length < 3} onClick={() => m.mutate()}>Send query</Button></>}
      >
        <div className="space-y-4">
          <div>
            <Label>Document needed (optional)</Label>
            <Select value={doc} onChange={(e) => setDoc(e.target.value)}>
              <option value="">No specific document</option>
              {Object.entries(DOC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Please upload the final itemised hospital bill with the hospital's stamp." />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
