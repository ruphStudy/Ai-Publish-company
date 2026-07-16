import { Injectable } from '@nestjs/common';

import { MonitoringJobDefinition } from './models/monitoring.model';

export interface MonitoringValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class MonitoringValidator {
  validateJob(job: MonitoringJobDefinition): MonitoringValidationResult {
    const errors: string[] = [];

    if (!job.name.trim()) {
      errors.push('job name is required');
    }

    if (!job.providerKey.trim()) {
      errors.push('provider key is required');
    }

    if (!job.provider) {
      errors.push('provider is required');
    }

    if (!job.params) {
      errors.push('provider parameters are required');
    }

    if (!job.providerConfig) {
      errors.push('provider configuration is required');
    }

    if (job.intervalMs !== null && job.intervalMs <= 0) {
      errors.push('intervalMs must be positive when provided');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}