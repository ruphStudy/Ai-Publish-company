import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PlatformCapabilityRegistry } from './platform-capability.registry';

@ApiTags('Platform Registry')
@ApiBearerAuth()
@Controller('platform-registry')
@UseGuards(JwtAuthGuard)
export class PlatformRegistryController {
  constructor(private readonly registry: PlatformCapabilityRegistry) {}

  @Get()
  all() {
    return { providers: this.registry.providers(), marketplaces: this.registry.marketplaces(), activeProviders: this.registry.activeProviders() };
  }

  @Get('providers')
  providers() {
    return this.registry.providers();
  }

  @Get('marketplaces')
  marketplaces() {
    return this.registry.marketplaces();
  }
}
