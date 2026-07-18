import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../notification/notification.module';
import { BACKGROUND_JOBS_QUEUE, JobDispatcher } from './background-job-dispatcher';
import { BackgroundJobController } from './background-job.controller';
import { JobCancellationService } from './background-job-cancellation.service';
import { JobCheckpointService } from './background-job-checkpoint.service';
import { NoopCompatibilityJobHandler, NotificationDispatchJobHandler, JobRetentionCleanupHandler } from './background-job.handlers';
import { JobMapper } from './background-job.mapper';
import { JobPolicyService } from './background-job-policy.service';
import { JobQueryService } from './background-job-query.service';
import { JobExecutionRepository, JobIdempotencyRepository, JobScheduleRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';
import { JobScheduler } from './background-job-scheduler';
import { BackgroundJobService } from './background-job.service';
import { BackgroundJobWorker } from './background-job.worker';
import { JobExecution, JobExecutionSchema, JobIdempotencyRecord, JobIdempotencyRecordSchema, JobSchedule, JobScheduleSchema } from './entities/background-job.entity';

@Module({
  imports: [
    NotificationModule,
    BullModule.registerQueue({ name: BACKGROUND_JOBS_QUEUE }),
    MongooseModule.forFeature([
      { name: JobExecution.name, schema: JobExecutionSchema },
      { name: JobSchedule.name, schema: JobScheduleSchema },
      { name: JobIdempotencyRecord.name, schema: JobIdempotencyRecordSchema },
    ]),
  ],
  controllers: [BackgroundJobController],
  providers: [JobRegistry, JobExecutionRepository, JobScheduleRepository, JobIdempotencyRepository, JobMapper, JobPolicyService, JobDispatcher, JobCheckpointService, JobCancellationService, JobScheduler, JobQueryService, BackgroundJobService, BackgroundJobWorker, NoopCompatibilityJobHandler, NotificationDispatchJobHandler, JobRetentionCleanupHandler],
  exports: [JobRegistry, JobDispatcher, JobScheduler, JobQueryService, BackgroundJobService],
})
export class BackgroundJobModule {}
