import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WorkflowContextService } from './workflow-context.service';

@ApiTags('Workflow Context')
@ApiBearerAuth()
@Controller('workflow-context')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowContextController {
  constructor(private readonly service: WorkflowContextService) {}

  @Get('projects/:projectId')
  projectContext(@Param('projectId') projectId: string) {
    return this.service.projectContext(projectId);
  }

  @Get('market-intelligence')
  marketIntelligence(@Query('search') search?: string) {
    return this.service.listMarketIntelligence(search);
  }

  @Get('knowledge')
  knowledge(@Query('search') search?: string) {
    return this.service.listKnowledge(search);
  }
}
