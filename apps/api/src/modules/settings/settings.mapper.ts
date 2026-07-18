import { Injectable } from '@nestjs/common';
import type { SettingValueDocument } from './entities/setting.entity';
import { SettingEncryptionService } from './settings-encryption.service';

@Injectable()
export class SettingMapper {
  constructor(private readonly encryption: SettingEncryptionService) {}

  value(document: SettingValueDocument) {
    const object = document.toObject();
    return { ...object, value: object.encrypted ? this.encryption.mask(object.value) : object.value };
  }
}
