import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { CircuitState, RecoveryEvent, RecoveryEventDocument, RecoveryState, RecoveryStateDocument, RecoveryStatus, ResilienceCircuitState, ResilienceCircuitStateDocument, ResilienceIsolationScope } from './entities/resilience.entity';

@Injectable()
export class RecoveryStateRepository {
  constructor(@InjectModel(RecoveryState.name) private readonly model: Model<RecoveryStateDocument>) {}
  create(input: Partial<RecoveryState>) { return this.model.create({ recoveryId: input.recoveryId ?? `RCV-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<RecoveryState>) { return this.model.findOneAndUpdate({ recoveryId: id }, update, { new: true }).exec(); }
  findById(id: string) { return this.model.findOne({ recoveryId: id }).exec(); }
  failed(limit = 50) { return this.model.find({ status: { $in: [RecoveryStatus.FAILED, RecoveryStatus.EXHAUSTED, RecoveryStatus.MANUAL_REQUIRED] } }).sort({ createdAt: -1 }).limit(limit).exec(); }
  paginate(filter: FilterQuery<RecoveryState>, page = 1, limit = 25) { const bounded = Math.min(Math.max(limit, 1), 100); const skip = (Math.max(page, 1) - 1) * bounded; return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(bounded).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit: bounded })); }
}

@Injectable()
export class CircuitStateRepository {
  constructor(@InjectModel(ResilienceCircuitState.name) private readonly model: Model<ResilienceCircuitStateDocument>) {}
  upsert(policyKey: string, isolationScope: ResilienceIsolationScope, isolationKey: string, update: Partial<ResilienceCircuitState>) { return this.model.findOneAndUpdate({ policyKey, isolationScope, isolationKey }, { $set: update, $setOnInsert: { circuitId: `CBR-${randomUUID()}` } }, { upsert: true, new: true }).exec(); }
  find(policyKey: string, isolationScope: ResilienceIsolationScope, isolationKey: string) { return this.model.findOne({ policyKey, isolationScope, isolationKey }).exec(); }
  setState(circuitId: string, state: CircuitState, update: Partial<ResilienceCircuitState> = {}) { return this.model.findOneAndUpdate({ circuitId }, { state, ...update }, { new: true }).exec(); }
  paginate(filter: FilterQuery<ResilienceCircuitState>, page = 1, limit = 25) { const bounded = Math.min(Math.max(limit, 1), 100); const skip = (Math.max(page, 1) - 1) * bounded; return Promise.all([this.model.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(bounded).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit: bounded })); }
}

@Injectable()
export class RecoveryEventRepository {
  constructor(@InjectModel(RecoveryEvent.name) private readonly model: Model<RecoveryEventDocument>) {}
  create(input: Partial<RecoveryEvent>) { return this.model.create({ eventId: input.eventId ?? `REV-${randomUUID()}`, ...input }); }
  paginate(filter: FilterQuery<RecoveryEvent>, page = 1, limit = 25) { const bounded = Math.min(Math.max(limit, 1), 100); const skip = (Math.max(page, 1) - 1) * bounded; return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(bounded).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit: bounded })); }
}
