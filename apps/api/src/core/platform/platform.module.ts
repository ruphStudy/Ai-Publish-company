import { Global, Module } from '@nestjs/common';
import { PlatformCapabilityRegistry } from './platform-capability.registry';
import { PlatformRegistryController } from './platform.controller';

@Global()
@Module({ controllers: [PlatformRegistryController], providers: [PlatformCapabilityRegistry], exports: [PlatformCapabilityRegistry] })
export class PlatformModule {}
