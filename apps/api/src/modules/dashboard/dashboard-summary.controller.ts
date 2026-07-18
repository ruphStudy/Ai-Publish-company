import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/entities/user.entity';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardSummaryService } from './dashboard-summary.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardSummaryController {
  constructor(private readonly service: DashboardSummaryService, private readonly analytics: DashboardAnalyticsService) {}

  @Get('summary')
  summary(@CurrentUser() user: User) {
    return this.service.summary(user.id);
  }

  @Get('analytics/executive')
  executive(@CurrentUser() user: User) {
    return this.analytics.executive(user.id);
  }

  @Get('analytics/user')
  userDashboard(@CurrentUser() user: User) {
    return this.analytics.user(user.id);
  }

  @Get('analytics/sales')
  sales(@CurrentUser() user: User) {
    return this.analytics.sales(user.id);
  }

  @Get('analytics/revenue')
  revenue(@CurrentUser() user: User) {
    return this.analytics.revenue(user.id);
  }

  @Get('analytics/royalty')
  royalty(@CurrentUser() user: User) {
    return this.analytics.revenue(user.id);
  }

  @Get('analytics/opportunities')
  opportunities(@CurrentUser() user: User) {
    return this.analytics.opportunityDashboard(user.id);
  }

  @Get('analytics/ai-insights')
  aiInsights(@CurrentUser() user: User) {
    return this.analytics.aiInsightsDashboard(user.id);
  }

  @Get('analytics/operations')
  operations(@CurrentUser() user: User) {
    return this.analytics.operations(user.id);
  }

  @Get('analytics/administration')
  administration(@CurrentUser() user: User) {
    return this.analytics.administration(user.id);
  }

  @Get('analytics/entity/:dashboardKey')
  entityAnalytics(@CurrentUser() user: User, @Param('dashboardKey') dashboardKey: string) {
    return this.analytics.entity(dashboardKey, user.id);
  }
}
