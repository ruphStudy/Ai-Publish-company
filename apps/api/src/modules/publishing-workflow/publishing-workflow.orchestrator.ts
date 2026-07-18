import { Injectable } from '@nestjs/common';
import { PublishingWorkflowService } from './publishing-workflow.service';

@Injectable()
export class PublishingWorkflowOrchestrator {
  constructor(private readonly service: PublishingWorkflowService) {}
  async run(workflowId: string) { return this.service.start(workflowId); }
  async resume(workflowId: string, userId?: string) { await this.service.resume(workflowId, userId); return this.service.start(workflowId); }
}
