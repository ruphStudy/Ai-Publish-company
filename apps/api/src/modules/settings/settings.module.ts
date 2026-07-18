import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { SettingValue, SettingValueSchema } from './entities/setting.entity';
import { SettingAudit } from './settings-audit.service';
import { SettingCache } from './settings-cache.service';
import { SettingsController } from './settings.controller';
import { SettingEncryptionService } from './settings-encryption.service';
import { SettingMapper } from './settings.mapper';
import { SettingMigrationRunner } from './settings.migration';
import { SettingRegistry } from './settings.registry';
import { SettingRepository } from './settings.repository';
import { SettingResolver } from './settings.resolver';
import { SettingsService } from './settings.service';
import { SettingValidator } from './settings.validator';

@Module({
  imports: [MongooseModule.forFeature([{ name: SettingValue.name, schema: SettingValueSchema }]), AuditModule],
  controllers: [SettingsController],
  providers: [SettingRegistry, SettingRepository, SettingResolver, SettingValidator, SettingEncryptionService, SettingCache, SettingMapper, SettingAudit, SettingMigrationRunner, SettingsService],
  exports: [SettingRegistry, SettingResolver, SettingsService, SettingCache],
})
export class SettingsModule {}
