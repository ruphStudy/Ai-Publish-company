import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CircuitStateRepository, RecoveryEventRepository, RecoveryStateRepository } from './resilience.repository';
import { ErrorClassifier } from './error-classifier';
import { ErrorMapper } from './error-mapper';
import { FailureDetector } from './failure-detector.service';
import { RecoveryCoordinator } from './recovery-coordinator.service';
import { ResilienceController } from './resilience.controller';
import { ResilienceEngine } from './resilience-engine.service';
import { ResilienceQueryService } from './resilience-query.service';
import { ResilienceRegistry } from './resilience.registry';
import { RecoveryEvent, RecoveryEventSchema, RecoveryState, RecoveryStateSchema, ResilienceCircuitState, ResilienceCircuitStateSchema } from './entities/resilience.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: RecoveryState.name, schema: RecoveryStateSchema }, { name: ResilienceCircuitState.name, schema: ResilienceCircuitStateSchema }, { name: RecoveryEvent.name, schema: RecoveryEventSchema }])],
  controllers: [ResilienceController],
  providers: [ResilienceRegistry, RecoveryStateRepository, CircuitStateRepository, RecoveryEventRepository, ErrorClassifier, ErrorMapper, ResilienceEngine, RecoveryCoordinator, FailureDetector, ResilienceQueryService],
  exports: [ResilienceRegistry, ErrorClassifier, ErrorMapper, ResilienceEngine, RecoveryCoordinator, ResilienceQueryService],
})
export class ResilienceModule {}
