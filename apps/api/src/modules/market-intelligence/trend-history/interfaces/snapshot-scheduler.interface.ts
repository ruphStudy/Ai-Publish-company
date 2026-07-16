export const TREND_SNAPSHOT_SCHEDULER_TOKEN = 'TREND_SNAPSHOT_SCHEDULER';

export interface TrendSnapshotScheduleRequest {
  knowledgeRecordId: string;
  scheduledAt?: Date;
}

export interface TrendSnapshotScheduleResult {
  jobId: string;
  knowledgeRecordId: string;
  scheduledAt: Date;
}

export interface SnapshotScheduler {
  schedule(
    request: TrendSnapshotScheduleRequest,
  ): Promise<TrendSnapshotScheduleResult>;
  cancel(jobId: string): Promise<boolean>;
}