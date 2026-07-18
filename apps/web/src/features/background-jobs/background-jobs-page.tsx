import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, CalendarClock, Play, RotateCcw, ShieldAlert, Square, TimerReset } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { backgroundJobQueryKeys, cancelJob, disableSchedule, enableSchedule, fetchJobDefinitions, fetchJobExecutions, fetchJobSchedules, fetchQueueHealth, retryJob, triggerJob } from './background-jobs-api';

const terminal = new Set(['SUCCEEDED', 'FAILED', 'CANCELLED', 'TIMED_OUT', 'DEAD_LETTERED']);

function statusVariant(status: string) {
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'FAILED' || status === 'DEAD_LETTERED' || status === 'TIMED_OUT') return 'destructive';
  if (status === 'RUNNING' || status === 'RETRYING') return 'warning';
  return 'secondary';
}

export function BackgroundJobsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const definitions = useQuery({ queryKey: backgroundJobQueryKeys.definitions, queryFn: fetchJobDefinitions });
  const executions = useQuery({ queryKey: backgroundJobQueryKeys.executions(status), queryFn: () => fetchJobExecutions(status), refetchInterval: (query) => query.state.data?.items.some((item) => !terminal.has(item.status)) ? 5000 : false });
  const schedules = useQuery({ queryKey: backgroundJobQueryKeys.schedules, queryFn: fetchJobSchedules });
  const health = useQuery({ queryKey: backgroundJobQueryKeys.health, queryFn: fetchQueueHealth });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['background-jobs'] });
  const triggerMutation = useMutation({ mutationFn: triggerJob, onSuccess: invalidate });
  const retryMutation = useMutation({ mutationFn: retryJob, onSuccess: invalidate });
  const cancelMutation = useMutation({ mutationFn: cancelJob, onSuccess: invalidate });
  const enableScheduleMutation = useMutation({ mutationFn: enableSchedule, onSuccess: invalidate });
  const disableScheduleMutation = useMutation({ mutationFn: disableSchedule, onSuccess: invalidate });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Background Jobs</h1>
        <p className="text-muted-foreground">Registry-driven queue execution, schedules, workers and dead-letter review.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Definitions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{definitions.data?.length ?? 0}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Executions</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{executions.data?.total ?? 0}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Schedules</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{schedules.data?.total ?? 0}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Queue Health</CardTitle></CardHeader><CardContent><Badge variant="success">{health.data?.status ?? 'ready'}</Badge></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Job Definitions</CardTitle>
          <CardDescription>Manual triggers use registered metadata and shared dispatch policies.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Category</TableHead><TableHead>Queue</TableHead><TableHead>Capabilities</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{(definitions.data ?? []).map((job) => {
              const triggerable = job.handlerKey !== 'noop.compatibility';
              return <TableRow key={job.key}><TableCell><div className="font-medium">{job.displayName}</div><div className="text-xs text-muted-foreground">{job.key}</div>{!triggerable && <div className="text-xs text-muted-foreground">Compatibility job: manual trigger disabled.</div>}</TableCell><TableCell><Badge variant="outline">{job.category}</Badge></TableCell><TableCell>{job.queue}</TableCell><TableCell className="space-x-1">{job.cancellationSupported && <Badge variant="secondary">cancel</Badge>}{job.checkpointSupported && <Badge variant="secondary">checkpoint</Badge>}{job.scheduleSupported && <Badge variant="secondary">schedule</Badge>}</TableCell><TableCell className="text-right"><Button size="sm" disabled={!triggerable || triggerMutation.isPending} onClick={() => triggerMutation.mutate(job.key)}><Play className="mr-2 h-4 w-4" />Trigger</Button></TableCell></TableRow>;
            })}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div><CardTitle className="flex items-center gap-2"><TimerReset className="h-5 w-5" />Execution History</CardTitle><CardDescription>Polling stops when executions reach terminal states.</CardDescription></div>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{['ALL', 'QUEUED', 'RUNNING', 'RETRYING', 'SUCCEEDED', 'FAILED', 'DEAD_LETTERED', 'CANCELLED'].map((item) => <SelectItem key={item} value={item}>{item.toLowerCase()}</SelectItem>)}</SelectContent></Select>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Execution</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Worker</TableHead><TableHead>Error</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{(executions.data?.items ?? []).map((execution) => <TableRow key={execution.executionId}><TableCell><div className="font-medium">{execution.jobKey}</div><div className="text-xs text-muted-foreground">{execution.executionId}</div></TableCell><TableCell><Badge variant={statusVariant(execution.status)}>{execution.status}</Badge></TableCell><TableCell><Progress value={execution.progress ?? 0} /></TableCell><TableCell>{execution.workerId ?? '—'}</TableCell><TableCell>{execution.errorCode ?? '—'}</TableCell><TableCell className="space-x-2 text-right">{execution.deadLetter && <Button size="sm" variant="outline" onClick={() => retryMutation.mutate(execution.executionId)}><RotateCcw className="mr-2 h-4 w-4" />Retry</Button>}{!terminal.has(execution.status) && <Button size="sm" variant="outline" onClick={() => cancelMutation.mutate(execution.executionId)}><Square className="mr-2 h-4 w-4" />Cancel</Button>}</TableCell></TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" />Schedules</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Job</TableHead><TableHead>Status</TableHead><TableHead>Next run</TableHead><TableHead>Overlap</TableHead><TableHead /></TableRow></TableHeader><TableBody>{(schedules.data?.items ?? []).map((schedule) => <TableRow key={schedule.scheduleId}><TableCell>{schedule.name}</TableCell><TableCell>{schedule.jobKey}</TableCell><TableCell><Badge variant={schedule.status === 'ENABLED' ? 'success' : 'outline'}>{schedule.status}</Badge></TableCell><TableCell>{schedule.nextRunAt ?? '—'}</TableCell><TableCell>{schedule.overlapPolicy}</TableCell><TableCell className="text-right">{schedule.status === 'ENABLED' ? <Button size="sm" variant="outline" onClick={() => disableScheduleMutation.mutate(schedule.scheduleId)}>Disable</Button> : <Button size="sm" variant="outline" onClick={() => enableScheduleMutation.mutate(schedule.scheduleId)}>Enable</Button>}</TableCell></TableRow>)}</TableBody></Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5" />Dead-letter Review</CardTitle><CardDescription>Failed executions retain lineage and safe payload metadata.</CardDescription></CardHeader>
      </Card>
    </div>
  );
}
