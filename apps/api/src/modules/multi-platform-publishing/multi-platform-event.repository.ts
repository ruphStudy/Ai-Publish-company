import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { MultiPlatformEvent, MultiPlatformEventDocument } from './entities/multi-platform-event.entity';
@Injectable()
export class MultiPlatformEventRepository {
  constructor(@InjectModel(MultiPlatformEvent.name) private readonly model: Model<MultiPlatformEvent>) {}
  create(data: Partial<MultiPlatformEvent>): Promise<MultiPlatformEventDocument> { return this.model.create(data); }
  findByOrchestrationId(orchestrationId: string): Promise<MultiPlatformEventDocument[]> { return this.model.find({ orchestrationId }).sort({ createdAt: -1 }).exec(); }
}
