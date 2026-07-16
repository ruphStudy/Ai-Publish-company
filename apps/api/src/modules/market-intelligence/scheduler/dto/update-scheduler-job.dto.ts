import { PartialType } from '@nestjs/swagger';

import { CreateSchedulerJobDto } from './create-scheduler-job.dto';

export class UpdateSchedulerJobDto extends PartialType(CreateSchedulerJobDto) {}
