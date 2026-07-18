import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { SettingScope, SettingValue, SettingValueDocument, SettingValueStatus } from './entities/setting.entity';

@Injectable()
export class SettingRepository {
  constructor(@InjectModel(SettingValue.name) private readonly model: Model<SettingValueDocument>) {}

  create(input: Partial<SettingValue>) {
    return this.model.create({ settingValueId: input.settingValueId ?? `STV-${randomUUID()}`, ...input });
  }

  update(id: string, update: UpdateQuery<SettingValue>) {
    return this.model.findOneAndUpdate({ settingValueId: id }, update, { new: true }).exec();
  }

  upsert(filter: FilterQuery<SettingValue>, input: Partial<SettingValue>) {
    return this.model.findOneAndUpdate(filter, { $set: input, $setOnInsert: { settingValueId: `STV-${randomUUID()}` } }, { upsert: true, new: true }).exec();
  }

  findById(id: string) {
    return this.model.findOne({ settingValueId: id }).exec();
  }

  findByScope(key: string, scope: SettingScope, scopeId: string | null) {
    return this.model.findOne({ key, scope, scopeId: scopeId ?? null, status: SettingValueStatus.ACTIVE }).exec();
  }

  findInherited(key: string, scopes: Array<{ scope: SettingScope; scopeId: string | null }>) {
    return this.model.find({ key, status: SettingValueStatus.ACTIVE, $or: scopes.map(({ scope, scopeId }) => ({ scope, scopeId: scopeId ?? null })) }).exec();
  }

  search(filter: FilterQuery<SettingValue>) {
    return this.model.find(filter).sort({ category: 1, key: 1, scope: 1 }).exec();
  }

  softDelete(key: string, scope: SettingScope, scopeId: string | null, userId?: string) {
    return this.model.findOneAndUpdate({ key, scope, scopeId: scopeId ?? null }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId ?? null, updatedBy: userId ?? null }, { new: true }).exec();
  }
}
