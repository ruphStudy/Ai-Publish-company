import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { ProviderService } from './provider.service';
import {
  ProviderQueryDto} from './dto';
import {
  CreateProviderRegistrationDto,
  UpdateProviderRegistrationDto,
  ProviderRegistrationResponseDto,
  PaginatedProviderResponseDto,
  ProviderHealthSummaryResponseDto,
  ProviderValidationResponseDto,
} from './dto';
import { ProviderHealthResult } from './interfaces/provider.interface';
import { DataSourceParams } from '../interfaces/data-source.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { User } from '../../auth/entities/user.entity';

@ApiTags('market-intelligence/providers')
@Controller('market-intelligence/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get('health')
  @ApiOperation({ summary: 'Run health checks for all registered providers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Health summary retrieved', type: ProviderHealthSummaryResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getAllHealth(): Promise<ProviderHealthSummaryResponseDto> {
    return this.providerService.runAllHealthChecks();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register a new provider', description: 'Requires ADMIN role.' })
  @ApiBody({ type: CreateProviderRegistrationDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Provider registered successfully', type: ProviderRegistrationResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Provider key already registered' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async registerProvider(
    @Body() dto: CreateProviderRegistrationDto,
    @CurrentUser() user: User,
  ): Promise<ProviderRegistrationResponseDto> {
    return this.providerService.registerProvider(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered providers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Providers retrieved successfully', type: PaginatedProviderResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async listProviders(@Query() query: ProviderQueryDto): Promise<PaginatedProviderResponseDto> {
    return this.providerService.listProviders(query);
  }

  @Get(':key/health')
  @ApiOperation({ summary: 'Run health check for a specific provider' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Health check completed' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProviderHealth(@Param('key') key: string): Promise<ProviderHealthResult> {
    return this.providerService.runHealthCheck(key);
  }

  @Get(':key/validate')
  @ApiOperation({ summary: 'Validate parameters for a specific provider' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Validation result', type: ProviderValidationResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async validateParams(
    @Param('key') key: string,
    @Query() params: DataSourceParams,
  ): Promise<ProviderValidationResponseDto> {
    return this.providerService.validateParams(key, params);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a provider by key' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider retrieved successfully', type: ProviderRegistrationResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProvider(@Param('key') key: string): Promise<ProviderRegistrationResponseDto> {
    return this.providerService.getProvider(key);
  }

  @Patch(':key')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update provider configuration', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiBody({ type: UpdateProviderRegistrationDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider updated successfully', type: ProviderRegistrationResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async updateProvider(
    @Param('key') key: string,
    @Body() dto: UpdateProviderRegistrationDto,
    @CurrentUser() user: User,
  ): Promise<ProviderRegistrationResponseDto> {
    return this.providerService.updateProvider(key, dto, user.id);
  }

  @Post(':key/enable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enable a provider', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider enabled', type: ProviderRegistrationResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async enableProvider(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ): Promise<ProviderRegistrationResponseDto> {
    return this.providerService.enableProvider(key, user.id);
  }

  @Post(':key/disable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Disable a provider', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Provider disabled', type: ProviderRegistrationResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async disableProvider(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ): Promise<ProviderRegistrationResponseDto> {
    return this.providerService.disableProvider(key, user.id);
  }

  @Delete(':key')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a provider registration (soft delete)', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'key', description: 'Provider key', example: 'amazon-kdp-v1' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Provider deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Provider not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async deleteProvider(
    @Param('key') key: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.providerService.deleteProvider(key, user.id);
  }
}
