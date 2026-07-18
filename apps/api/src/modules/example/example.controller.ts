import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { User } from '../auth/entities/user.entity';

@ApiTags('example')
@Controller('example')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExampleController {
  @Get('public-data')
  @ApiOperation({ summary: 'Get public data (authenticated users only)' })
  @ApiResponse({ status: 200, description: 'Data retrieved successfully' })
  getPublicData(@CurrentUser() user: User) {
    return {
      message: 'This endpoint requires authentication',
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({ status: 200, description: 'Admin data retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getAdminData() {
    return {
      message: 'This is admin-only data',
      secret: 'Only admins can see this',
    };
  }

  @Get('editor-or-admin')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Editor or Admin endpoint' })
  @ApiResponse({ status: 200, description: 'Editor data retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - Editor or Admin role required' })
  getEditorData() {
    return {
      message: 'This is for editors and admins',
    };
  }
}
