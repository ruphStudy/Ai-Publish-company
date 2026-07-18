import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuditAction, AuditEntityType } from '../audit/entities/audit-log.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SettingAudit {
  constructor(private readonly audit: AuditService) {}

  async record(action: AuditAction, userId: string | undefined, settingValueId: string, metadata: Record<string, unknown>) {
    if (!userId || !Types.ObjectId.isValid(userId)) return;
    await this.audit.log({
      action,
      entityType: AuditEntityType.BOOK,
      entityId: new Types.ObjectId(userId),
      performedBy: new Types.ObjectId(userId),
      description: `Settings ${action}`,
      metadata: { settingValueId, ...metadata, value: undefined, secret: undefined },
    });
  }
}
