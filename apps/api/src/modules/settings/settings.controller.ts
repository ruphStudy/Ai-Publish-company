import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EvaluateFeatureFlagDto, ExportSettingsDto, ImportSettingsDto, ResetSettingDto, SettingsQueryDto, UpdateSettingDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  list(@Query() query: SettingsQueryDto) {
    return this.settings.list(query);
  }

  @Get('categories')
  categories() {
    return this.settings.categories();
  }

  @Get('registry')
  registry(@Query() query: SettingsQueryDto) {
    return this.settings.registryMetadata(query);
  }

  @Get('feature-flags/:key')
  featureFlag(@Param('key') key: string, @Query() query: EvaluateFeatureFlagDto) {
    return this.settings.featureFlag(key, query);
  }

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  export(@Body() dto: ExportSettingsDto) {
    return this.settings.export(dto);
  }

  @Post('import')
  @Roles(UserRole.ADMIN)
  import(@Body() dto: ImportSettingsDto, @CurrentUser('id') userId: string) {
    return this.settings.import(dto, userId);
  }

  @Get(':key/effective')
  effectiveValue(@Param('key') key: string, @Query() query: SettingsQueryDto) {
    return this.settings.effectiveValue(key, query);
  }

  @Get(':key/inherited')
  inheritedValues(@Param('key') key: string, @Query() query: SettingsQueryDto) {
    return this.settings.inheritedValues(key, query);
  }

  @Patch(':key')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  update(@Param('key') key: string, @Body() dto: UpdateSettingDto, @CurrentUser('id') userId: string) {
    return this.settings.update(key, dto, userId);
  }

  @Patch(':key/reset-inherited')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  resetInherited(@Param('key') key: string, @Body() dto: ResetSettingDto, @CurrentUser('id') userId: string) {
    return this.settings.resetToInherited(key, dto, userId);
  }

  @Patch(':key/reset-default')
  @Roles(UserRole.ADMIN)
  resetDefault(@Param('key') key: string, @CurrentUser('id') userId: string) {
    return this.settings.resetToDefault(key, userId);
  }
}
