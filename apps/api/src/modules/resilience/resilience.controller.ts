import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CircuitQueryDto, ManualRecoveryDto, RecoveryQueryDto, RecordFailureDto } from './dto/resilience.dto';
import { ErrorMapper } from './error-mapper';
import { RecoveryCoordinator } from './recovery-coordinator.service';
import { ResilienceEngine } from './resilience-engine.service';
import { ResilienceQueryService } from './resilience-query.service';

@ApiTags('Resilience')
@ApiBearerAuth()
@Controller('resilience')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResilienceController {
  constructor(private readonly queries: ResilienceQueryService, private readonly coordinator: RecoveryCoordinator, private readonly engine: ResilienceEngine, private readonly mapper: ErrorMapper) {}

  @Get('status')
  status() { return this.queries.recoveryStatus(); }

  @Get('policies')
  policies() { return this.queries.policies(); }

  @Get('history')
  history(@Query() query: RecoveryQueryDto) { return this.queries.history(query); }

  @Get('events')
  events(@Query() query: RecoveryQueryDto) { return this.queries.eventsHistory(query); }

  @Get('failed-operations')
  failedOperations() { return this.coordinator.failedOperations(); }

  @Get('circuits')
  circuits(@Query() query: CircuitQueryDto) { return this.queries.circuitsStatus(query); }

  @Get('diagnostics')
  diagnostics() { return this.queries.recoveryStatus(); }

  @Post('failures')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  recordFailure(@Body() dto: RecordFailureDto) {
    return this.engine.recordFailure(dto.policyKey, dto.operationKey, { category: dto.failureCategory, retryable: !['VALIDATION', 'AUTHENTICATION', 'AUTHORIZATION', 'PERMANENT_FAILURE'].includes(dto.failureCategory), code: dto.errorCode ?? dto.failureCategory, message: dto.errorMessage ?? dto.failureCategory }, { isolationScope: dto.isolationScope, isolationKey: dto.isolationKey, tenantId: dto.tenantId, workspaceId: dto.workspaceId, providerKey: dto.providerKey, marketplaceKey: dto.marketplaceKey, entityId: dto.entityId, correlationId: dto.correlationId, safeContext: dto.safeContext });
  }

  @Post('recoveries/:id/retry')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  retry(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.coordinator.manualRetry(id, userId); }

  @Post('recoveries/:id/recover')
  @Roles(UserRole.ADMIN)
  recover(@Param('id') id: string, @Body() _dto: ManualRecoveryDto, @CurrentUser('id') userId: string) { return this.coordinator.manualRecover(id, userId); }
}
