import { Injectable } from '@nestjs/common';
import type { FactConsistencyDocument } from './entities/fact-consistency.entity';
@Injectable()
export class FactConsistencyMapper { toResponse(document: FactConsistencyDocument) { return document.toObject({ versionKey: false, virtuals: true }); } }
