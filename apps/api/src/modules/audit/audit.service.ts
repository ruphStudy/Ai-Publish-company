import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import type { AuditAction, AuditEntityType } from './entities/audit-log.entity';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: Types.ObjectId;
  performedBy: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLog>,
  ) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.auditLogModel.create(params);
    } catch {
      // Audit logging is non-fatal — failures never disrupt the main operation
    }
  }
}
