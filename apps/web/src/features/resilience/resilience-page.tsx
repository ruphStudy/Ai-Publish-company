import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, HeartPulse, RotateCcw, ShieldCheck, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchCircuitStatus, fetchRecoveryHistory, fetchRecoveryStatus, fetchResiliencePolicies, recoverRecovery, resilienceQueryKeys, retryRecovery } from './resilience-api';

function variant(status: string) {
  if (status === 'healthy' || status === 'CLOSED' || status === 'SUCCEEDED') return 'success';
  if (status === 'OPEN' || status === 'FAILED' || status === 'EXHAUSTED') return 'destructive';
  if (status === 'HALF_OPEN' || status === 'RETRYING' || status === 'RECOVERING' || status === 'MANUAL_REQUIRED') return 'warning';
  return 'secondary';
}

export function ResiliencePage() {
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: resilienceQueryKeys.status, queryFn: fetchRecoveryStatus, refetchInterval: 10000 });
  const policies = useQuery({ queryKey: resilienceQueryKeys.policies, queryFn: fetchResiliencePolicies });
  const history = useQuery({ queryKey: resilienceQueryKeys.history, queryFn: fetchRecoveryHistory, refetchInterval: 10000 });
  const circuits = useQuery({ queryKey: resilienceQueryKeys.circuits, queryFn: fetchCircuitStatus, refetchInterval: 10000 });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['resilience'] });
  const retry = useMutation({ mutationFn: retryRecovery, onSuccess: invalidate });
  const recover = useMutation({ mutationFn: recoverRecovery, onSuccess: invalidate });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resilience & Recovery</h1>
        <p className="text-muted-foreground">Centralized retry, circuit breaker, fallback and manual recovery controls.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">System State</CardTitle></CardHeader><CardContent><Badge variant={variant(status.data?.status ?? 'healthy')}>{status.data?.status ?? 'healthy'}</Badge></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Policies</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{policies.data?.length ?? 0}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Failed Operations</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{status.data?.failedOperations ?? 0}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Open Circuits</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{status.data?.openCircuits ?? 0}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Policy Status</CardTitle><CardDescription>Labels and capabilities are registry-driven.</CardDescription></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Policy</TableHead><TableHead>Category</TableHead><TableHead>Fallback</TableHead><TableHead>Recovery</TableHead></TableRow></TableHeader><TableBody>{(policies.data ?? []).map((policy) => <TableRow key={policy.key}><TableCell><div className="font-medium">{policy.displayName}</div><div className="text-xs text-muted-foreground">{policy.key}</div></TableCell><TableCell><Badge variant="outline">{policy.category}</Badge></TableCell><TableCell>{policy.fallback.enabled ? policy.fallback.modes.join(', ') : 'disabled'}</TableCell><TableCell>{policy.recovery.manualApprovalRequired ? 'manual approval' : policy.recovery.automatic ? 'automatic' : 'manual'}</TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" />Circuit Status</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Circuit</TableHead><TableHead>Isolation</TableHead><TableHead>State</TableHead><TableHead>Failures</TableHead><TableHead>Last error</TableHead></TableRow></TableHeader><TableBody>{(circuits.data?.items ?? []).map((circuit) => <TableRow key={circuit.circuitId}><TableCell>{circuit.policyKey}</TableCell><TableCell>{circuit.isolationScope}:{circuit.isolationKey}</TableCell><TableCell><Badge variant={variant(circuit.state)}>{circuit.state}</Badge></TableCell><TableCell>{circuit.failureCount}</TableCell><TableCell>{circuit.lastErrorCode ?? '—'}</TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Failed Operations & Recovery History</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Operation</TableHead><TableHead>Status</TableHead><TableHead>Failure</TableHead><TableHead>Attempts</TableHead><TableHead>Error</TableHead><TableHead /></TableRow></TableHeader><TableBody>{(history.data?.items ?? []).map((item) => <TableRow key={item.recoveryId}><TableCell><div className="font-medium">{item.operationKey}</div><div className="text-xs text-muted-foreground">{item.recoveryId}</div></TableCell><TableCell><Badge variant={variant(item.status)}>{item.status}</Badge></TableCell><TableCell>{item.failureCategory}</TableCell><TableCell>{item.attemptCount}/{item.maxAttempts}</TableCell><TableCell>{item.errorCode ?? '—'}</TableCell><TableCell className="space-x-2 text-right"><Button size="sm" variant="outline" onClick={() => retry.mutate(item.recoveryId)}><RotateCcw className="mr-2 h-4 w-4" />Retry</Button><Button size="sm" onClick={() => recover.mutate(item.recoveryId)}><Wrench className="mr-2 h-4 w-4" />Recover</Button></TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
