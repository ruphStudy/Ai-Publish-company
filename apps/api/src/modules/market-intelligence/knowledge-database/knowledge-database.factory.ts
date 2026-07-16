import { Injectable } from '@nestjs/common';

import { MarketKnowledgePersistenceData } from './interfaces/knowledge-database.repository.interface';

export interface KnowledgeDatabaseUpsertOperation {
  filter: {
    provider: MarketKnowledgePersistenceData['provider'];
    externalId: string;
  };
  update: {
    $set: MarketKnowledgePersistenceData & {
      updatedBy?: MarketKnowledgePersistenceData['provider'] extends never
        ? never
        : unknown;
    };
    $setOnInsert: {
      dataVersion: number;
      createdBy: unknown;
    };
    $inc: {
      dataVersion: number;
    };
  };
}

@Injectable()
export class KnowledgeDatabaseFactory {
  createUpsertOperation(
    data: MarketKnowledgePersistenceData,
    createdBy?: unknown,
    updatedBy?: unknown,
  ): KnowledgeDatabaseUpsertOperation {
    const set: KnowledgeDatabaseUpsertOperation['update']['$set'] = {
      ...data,
    };

    if (updatedBy) {
      set.updatedBy = updatedBy;
    }

    return {
      filter: {
        provider: data.provider,
        externalId: data.externalId,
      },
      update: {
        $set: set,
        $setOnInsert: {
          dataVersion: 0,
          createdBy: createdBy ?? null,
        },
        $inc: {
          dataVersion: 1,
        },
      },
    };
  }
}