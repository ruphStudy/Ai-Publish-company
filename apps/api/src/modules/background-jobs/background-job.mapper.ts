import { Injectable } from '@nestjs/common';
import type { JobExecutionDocument, JobScheduleDocument } from './entities/background-job.entity';

@Injectable()
export class JobMapper {
  execution(document: JobExecutionDocument) { const object = document.toObject(); return { ...object, payload: this.safePayload(object.payload ?? {}) }; }
  schedule(document: JobScheduleDocument) { const object = document.toObject(); return { ...object, payload: this.safePayload(object.payload ?? {}) }; }
  private safePayload(payload: Record<string, unknown>) { const blocked = new Set(['secret', 'token', 'password', 'credential', 'apiKey', 'clientSecret']); return Object.fromEntries(Object.entries(payload).filter(([key]) => !blocked.has(key))); }
}
