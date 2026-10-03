import { useQuery } from '@tanstack/react-query';
import { Check, ExternalLink, Loader2, Minus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { docLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Doc } from '@/lib/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DocPreview({ doc, className }: { doc: Doc; className?: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['doc-url', doc.id], queryFn: () => api<{ url: string; mimeType: string }>(`/documents/${doc.id}/url`), staleTime: 5 * 60_000 });
  if (isLoading || !data) return <div className={cn('grid place-items-center rounded-xl bg-canvas', className)}><Loader2 className="size-5 animate-spin text-primary" /></div>;
  const isImg = (data.mimeType || doc.mimeType || '').startsWith('image/');
  return isImg ? (
    <div className={cn('grid place-items-center overflow-auto rounded-xl bg-[#EEF2F7] p-4', className)}><img src={data.url} alt={doc.fileName} className="max-h-full rounded-lg shadow-card" /></div>
  ) : (
    <iframe src={`${data.url}#toolbar=0&view=FitH`} title={doc.fileName} className={cn('rounded-xl border border-line bg-[#EEF2F7]', className)} />
  );
}

export function DocPreviewDialog({ doc, onClose }: { doc: Doc | null; onClose: () => void }) {
  const url = useQuery({ queryKey: ['doc-url', doc?.id], queryFn: () => api<{ url: string }>(`/documents/${doc!.id}/url`), enabled: !!doc });
  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      {doc && (
        <DialogContent title={docLabel(doc.type)} description={doc.fileName} className="max-w-5xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <DocPreview doc={doc} className="h-[64vh] w-full" />
            <div className="space-y-4">
              <ValidationPanel doc={doc} />
              {url.data && <a href={url.data.url} target="_blank" rel="noreferrer"><Button variant="outline" className="w-full"><ExternalLink /> Open in new tab</Button></a>}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

const Mark = ({ v }: { v: boolean | null | undefined }) =>
  v == null ? <Minus className="size-3.5 text-subtle" /> : v ? <Check className="size-3.5 text-success" /> : <X className="size-3.5 text-error" />;

export function ValidationPanel({ doc }: { doc: Doc }) {
  const v = doc.validationResult;
  if (!v) return <p className="text-sm text-muted">The AI hasn't checked this document yet.</p>;
  const checks: [string, boolean | null][] = [
    ['Readable', v.checks.readable],
    ['Correct document type', v.checks.typeMatches],
    ['Patient name matches', v.checks.nameMatches],
    ['Date within policy period', v.checks.dateInPolicyPeriod],
    ['Amount consistent', v.checks.amountConsistent],
  ];
  return (
    <div className="space-y-3">
      <div className={cn('rounded-xl p-3.5 text-[13px] leading-relaxed', doc.status === 'VERIFIED' ? 'bg-success-50 text-[#066B50]' : doc.status === 'INVALID' ? 'bg-error-50 text-[#A3301F]' : 'bg-warning-50 text-[#8A5300]')}>
        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span>AI validation</span>
          <span className="tabular-nums">{Math.round(v.confidence * 100)}% confident</span>
        </div>
        {v.summary}
      </div>
      <ul className="space-y-1.5">
        {checks.map(([l, ok]) => (
          <li key={l} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-1.5 text-xs text-muted">{l}<Mark v={ok} /></li>
        ))}
      </ul>
      {v.issues.length > 0 && (
        <div className="space-y-1.5">
          {v.issues.map((i) => (
            <div key={i.code} className="flex gap-2 text-xs text-ink"><span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', i.severity === 'high' ? 'bg-error' : i.severity === 'medium' ? 'bg-warning' : 'bg-subtle')} />{i.message}</div>
          ))}
        </div>
      )}
      {v.fix && <div className="rounded-xl border border-dashed border-line-strong p-3 text-xs text-muted"><b className="text-ink">Fix sent to customer:</b> {v.fix}</div>}
      {doc.reviewedBy && <p className="text-xs text-subtle">Reviewed by {doc.reviewedBy}{doc.reviewNote ? `: ${doc.reviewNote}` : ''}</p>}
    </div>
  );
}
