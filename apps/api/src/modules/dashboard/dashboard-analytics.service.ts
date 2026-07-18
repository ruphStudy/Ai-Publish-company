import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AIInsight, InsightCategory, InsightPriority, InsightStatus } from '../ai-insights/entities/ai-insight.entity';
import { JobCategory, JobExecution, JobExecutionStatus } from '../background-jobs/entities/background-job.entity';
import { BookProject, BookProjectStatus } from '../book-project/entities/book-project.entity';
import { Category } from '../category/entities/category.entity';
import { Opportunity, OpportunityPriority, OpportunityStatus } from '../opportunity-analytics/entities/opportunity-analytics.entity';

type PlainRecord = Record<string, unknown>;

@Injectable()
export class DashboardAnalyticsService {
  constructor(
    @InjectModel(Category.name) private readonly categories: Model<Category>,
    @InjectModel(BookProject.name) private readonly projects: Model<BookProject>,
    @InjectModel(JobExecution.name) private readonly jobs: Model<JobExecution>,
    @InjectModel(AIInsight.name) private readonly insights: Model<AIInsight>,
    @InjectModel(Opportunity.name) private readonly opportunities: Model<Opportunity>,
  ) {}

  async executive(userId?: string) {
    const base = await this.base(userId);
    return {
      summary: {
        summary: `Portfolio contains ${base.projectTotal} projects, ${base.activeProjects} active projects, ${base.opportunityTotal} open opportunities, and ${base.insightTotal} active AI insights.`,
        strongestPerformanceArea: base.activeProjects > 0 ? 'Publishing pipeline' : 'Portfolio setup',
        weakestPerformanceArea: base.failedJobs > 0 ? 'Operations reliability' : 'No verified sales/revenue records',
        mainGrowthDriver: base.opportunityTotal > 0 ? 'Detected opportunities' : 'New project creation',
        mainRisk: base.failedJobs > 0 ? 'Failed background jobs' : 'Insufficient production analytics history',
        highestPriorityOpportunity: base.recentOpportunities[0]?.title,
        recommendedFocus: base.opportunityTotal > 0 ? 'Review high-priority opportunities' : 'Complete active book projects',
        confidence: 100,
        evidence: ['book_projects', 'job_executions', 'opportunities', 'ai_insights'],
        generatedAt: base.generatedAt,
        provider: 'database',
        model: 'aggregate-read',
        version: 1,
        stale: false,
        partial: false,
      },
      kpis: { items: this.kpis(base), metadata: this.metadata(base.generatedAt) },
      portfolioHealth: {
        overallScore: this.healthScore(base),
        overallStatus: base.failedJobs > 0 ? 'NEEDS_ATTENTION' : 'STABLE',
        dimensions: [
          { key: 'projects', label: 'Projects', status: base.activeProjects > 0 ? 'STABLE' : 'UNKNOWN', score: base.activeProjects > 0 ? 80 : null },
          { key: 'operations', label: 'Operations', status: base.failedJobs > 0 ? 'NEEDS_ATTENTION' : 'STABLE', score: base.failedJobs > 0 ? 60 : 90 },
          { key: 'intelligence', label: 'Intelligence', status: base.insightTotal > 0 || base.opportunityTotal > 0 ? 'STABLE' : 'UNKNOWN', score: base.insightTotal > 0 || base.opportunityTotal > 0 ? 75 : null },
        ],
        metadata: this.metadata(base.generatedAt),
      },
      trend: this.emptyTrend(base.generatedAt),
      topBooks: base.recentProjects,
      underperformingBooks: base.recentOpportunities.slice(0, 5).map((item) => ({ ...item, primaryIssue: item.title, severity: this.prioritySeverity(item.priority), recommendedAction: item.suggestedActionType })),
      providers: [],
      marketplaces: [],
      geographies: [],
      formats: [],
      opportunities: base.recentOpportunities,
      insights: base.recentInsights,
      risks: base.riskInsights,
      alerts: base.failedJobItems,
      activity: base.activity,
      freshness: this.freshness(base.generatedAt),
      warnings: base.failedJobItems,
      metadata: this.metadata(base.generatedAt),
    };
  }

  async user(userId?: string) {
    const base = await this.base(userId);
    return {
      summary: { activeBooks: base.activeProjects, activeEditions: 0, publishingStatus: base.activeProjects > 0 ? 'ACTIVE' : 'EMPTY', sales: 0, revenue: 0, royalties: 0, pendingActions: base.queuedJobs + base.opportunityTotal, opportunityCount: base.opportunityTotal, aiInsightCount: base.insightTotal, alertCount: base.failedJobs, metadata: this.metadata(base.generatedAt) },
      kpis: this.kpis(base),
      books: base.recentProjects,
      continueWorking: base.recentProjects.map((project) => ({ id: project.id, type: 'PROJECT', title: project.title, status: project.status, updatedAt: project.updatedAt, resumePath: project.drillDownPath })),
      favorites: [],
      recentActivity: base.activity,
      recentImports: base.recentJobs.filter((job) => job.type === JobCategory.IMPORTS),
      recentSyncs: base.recentJobs.filter((job) => job.type === JobCategory.SYNCHRONIZATION),
      recentAnalytics: base.recentJobs.filter((job) => job.type === JobCategory.ANALYTICS).map((job) => ({ id: job.id, title: job.title, scope: job.type, refreshedAt: job.timestamp, path: job.drillDownPath })),
      opportunities: base.recentOpportunities,
      aiInsights: base.recentInsights,
      alerts: base.failedJobItems,
      quickActions: [
        { id: 'projects', label: 'Open Projects', description: 'Review active book projects', path: '/projects' },
        { id: 'categories', label: 'Open Categories', description: 'Manage publishing categories', path: '/categories' },
        { id: 'opportunities', label: 'Review Opportunities', description: 'Prioritize detected opportunities', path: '/analytics/opportunities' },
        { id: 'insights', label: 'Review AI Insights', description: 'Open validated AI insights', path: '/analytics/ai-insights' },
      ],
      freshness: this.freshness(base.generatedAt),
      metadata: this.metadata(base.generatedAt),
    };
  }

  async sales(userId?: string) {
    const base = await this.base(userId);
    return { overview: { unitsSold: this.kpi('Units Sold', 0), salesGrowth: this.kpi('Sales Growth', 0, '%'), activeBooks: this.kpi('Active Books', base.activeProjects), activeEditions: this.kpi('Active Editions', 0), activeProviders: this.kpi('Active Providers', 0), activeMarketplaces: this.kpi('Active Marketplaces', 0), activeCountries: this.kpi('Active Countries', 0), refundCount: this.kpi('Refund Count', 0), metadata: this.metadata(base.generatedAt) }, trend: { granularity: 'MONTHLY', points: [], metadata: this.metadata(base.generatedAt) }, topBooks: base.recentProjects.map((p, index) => ({ ...p, rank: index + 1, unitsSold: 0, contributionPercentage: 0 })), underperformingBooks: base.recentOpportunities, marketplaces: [], providers: [], countries: [], formats: [], distribution: [], velocity: { momentum: 0, averageDailySales: 0, recentUnitsSold: 0, trend: { direction: 'FLAT' }, metadata: this.metadata(base.generatedAt) }, activity: base.activity, freshness: this.freshness(base.generatedAt), metadata: this.metadata(base.generatedAt) };
  }

  async revenue(userId?: string) {
    const base = await this.base(userId);
    return { overview: { grossRevenue: this.kpi('Gross Revenue', 0, 'USD'), netRevenue: this.kpi('Net Revenue', 0, 'USD'), refundValue: this.kpi('Refund Value', 0, 'USD'), adjustments: this.kpi('Adjustments', 0, 'USD'), averageRevenuePerSale: this.kpi('Average Revenue Per Sale', 0, 'USD'), revenueGrowth: this.kpi('Revenue Growth', 0, '%'), revenueGeneratingBooks: this.kpi('Revenue Generating Books', 0), revenueGeneratingProviders: this.kpi('Revenue Generating Providers', 0), revenueGeneratingMarketplaces: this.kpi('Revenue Generating Marketplaces', 0), metadata: this.metadata(base.generatedAt) }, trend: { granularity: 'MONTHLY', points: [], metadata: this.metadata(base.generatedAt) }, booksAndEditions: base.recentProjects.map((p) => ({ id: p.id, label: p.title, grossRevenue: 0, netRevenue: 0, contributionPercentage: 0, drillDownPath: p.drillDownPath })), providers: [], marketplaces: [], geographies: [], formats: [], distribution: [], refundsAndAdjustments: [], currencyCoverage: [{ id: 'USD', sourceCurrency: 'USD', reportingCurrency: 'USD', conversionCoverage: 100, missingRates: 0, convertedAt: base.generatedAt, completeness: this.complete() }], freshness: this.freshness(base.generatedAt), activity: base.activity, metadata: { ...this.metadata(base.generatedAt), reportingCurrency: 'USD' } };
  }

  async entity(dashboardKey: string, userId?: string) {
    const base = await this.base(userId);
    return { header: { title: dashboardKey.replace(/-/g, ' '), subtitle: 'Database-backed entity analytics', generatedAt: base.generatedAt }, kpis: this.kpis(base), trend: this.emptyTrend(base.generatedAt), rankings: base.recentProjects, breakdowns: [], insights: base.recentInsights, opportunities: base.recentOpportunities, activity: base.activity, freshness: this.freshness(base.generatedAt), metadata: this.metadata(base.generatedAt) };
  }

  async opportunityDashboard(userId?: string) {
    const base = await this.base(userId);
    return { summary: `${base.opportunityTotal} active opportunities are available for review.`, kpis: [this.kpi('Open Opportunities', base.opportunityTotal), this.kpi('Accepted', base.acceptedOpportunities), this.kpi('In Progress', base.inProgressOpportunities), this.kpi('Resolved', base.resolvedOpportunities)], priorityDistribution: base.opportunityPriorityDistribution, trend: [], categories: base.opportunityCategoryDistribution, entityDistribution: [], estimatedImpact: [], confidenceDistribution: [], queue: base.recentOpportunities, recentlyDetected: base.recentOpportunities, recentlyUpdated: base.recentOpportunities, accepted: base.recentOpportunities.filter((item) => item.status === OpportunityStatus.ACCEPTED), inProgress: base.recentOpportunities.filter((item) => item.status === OpportunityStatus.IN_PROGRESS), resolved: base.recentOpportunities.filter((item) => item.status === OpportunityStatus.RESOLVED), ignored: base.recentOpportunities.filter((item) => item.status === OpportunityStatus.DISMISSED), expiring: base.recentOpportunities.filter((item) => item.expiresAt), freshness: this.freshness(base.generatedAt), metadata: this.metadata(base.generatedAt) };
  }

  async aiInsightsDashboard(userId?: string) {
    const base = await this.base(userId);
    const byCategory = (category: InsightCategory) => base.recentInsights.filter((item) => item.category === category);
    return { executiveInsights: byCategory(InsightCategory.EXECUTIVE_SUMMARY), userInsights: base.recentInsights, growthInsights: byCategory(InsightCategory.GROWTH), riskInsights: byCategory(InsightCategory.RISK), performanceInsights: byCategory(InsightCategory.PERFORMANCE), publishingInsights: byCategory(InsightCategory.PUBLICATION), metadataInsights: byCategory(InsightCategory.METADATA), opportunityRecommendations: byCategory(InsightCategory.OPPORTUNITY), categories: base.insightCategoryDistribution, confidenceDistribution: [], recentInsights: base.recentInsights, staleInsights: [], freshness: this.freshness(base.generatedAt), kpis: [this.kpi('Active Insights', base.insightTotal), this.kpi('High Priority', base.highPriorityInsights), this.kpi('Risks', base.riskInsights.length)], trend: [], metadata: this.metadata(base.generatedAt) };
  }

  async operations(userId?: string) {
    const base = await this.base(userId);
    return { systemOverview: [this.kpi('Queued Jobs', base.queuedJobs), this.kpi('Running Jobs', base.runningJobs), this.kpi('Failed Jobs', base.failedJobs), this.kpi('Insights', base.insightTotal)], publishingQueue: base.recentJobs.filter((job) => job.type === JobCategory.PUBLISHING), importQueue: base.recentJobs.filter((job) => job.type === JobCategory.IMPORTS), synchronizationQueue: base.recentJobs.filter((job) => job.type === JobCategory.SYNCHRONIZATION), analyticsQueue: base.recentJobs.filter((job) => job.type === JobCategory.ANALYTICS), opportunityQueue: base.recentJobs.filter((job) => job.type === JobCategory.OPPORTUNITIES), aiInsightQueue: base.recentJobs.filter((job) => job.type === JobCategory.AI_INSIGHTS), backgroundJobs: base.recentJobs, failedJobs: base.recentJobs.filter((job) => job.status === JobExecutionStatus.FAILED), retryQueue: base.recentJobs.filter((job) => job.status === JobExecutionStatus.RETRYING), activeWorkers: [], providerStatus: [], marketplaceStatus: [], apiHealth: [{ id: 'api', label: 'API', status: 'HEALTHY', updatedAt: base.generatedAt }], storageStatus: [], processingStatistics: this.kpis(base), errorSummary: base.failedJobItems, operationalAlerts: base.failedJobItems, recentOperations: base.activity, dataFreshness: this.freshness(base.generatedAt), metadata: this.metadata(base.generatedAt) };
  }

  async administration(userId?: string) {
    const base = await this.base(userId);
    return { userSummary: [this.kpi('Current User', userId ? 1 : 0)], rolesPermissionsSummary: [], workspaceSummary: [], apiKeyStatus: [], providerConnections: [], marketplaceConnections: [], configurationStatus: [{ id: 'launch-bootstrap', label: 'Launch bootstrap', status: 'HEALTHY', updatedAt: base.generatedAt }], featureFlags: [], auditSummary: this.kpis(base), securityEvents: [], loginActivity: [], systemNotifications: base.activity, scheduledJobs: base.recentJobs, backupStatus: [], maintenanceStatus: [], applicationVersion: [], environmentInformation: [{ id: 'api', label: 'API Environment', status: 'HEALTHY', updatedAt: base.generatedAt }], metadata: this.metadata(base.generatedAt) };
  }

  private async base(userId?: string) {
    const generatedAt = new Date().toISOString();
    const ownerFilter = userId ? { ownerId: userId } : {};
    const [categoryTotal, projectTotal, activeProjects, recentProjects, queuedJobs, runningJobs, failedJobs, recentJobs, insightTotal, highPriorityInsights, recentInsights, opportunityTotal, acceptedOpportunities, inProgressOpportunities, resolvedOpportunities, recentOpportunities, opportunityPriorityDistribution, opportunityCategoryDistribution, insightCategoryDistribution] = await Promise.all([
      this.categories.countDocuments({}).exec(),
      this.projects.countDocuments(ownerFilter).exec(),
      this.projects.countDocuments({ ...ownerFilter, status: { $in: [BookProjectStatus.DRAFT, BookProjectStatus.RESEARCHING, BookProjectStatus.OUTLINE_READY, BookProjectStatus.WRITING, BookProjectStatus.REVIEWING, BookProjectStatus.READY_FOR_PUBLISHING] } }).exec(),
      this.projects.find(ownerFilter).sort({ updatedAt: -1 }).limit(10).select('projectCode title subtitle status currentStage progress updatedAt').lean<PlainRecord[]>().exec(),
      this.jobs.countDocuments({ status: { $in: [JobExecutionStatus.PENDING, JobExecutionStatus.SCHEDULED, JobExecutionStatus.QUEUED, JobExecutionStatus.RETRYING] } }).exec(),
      this.jobs.countDocuments({ status: JobExecutionStatus.RUNNING }).exec(),
      this.jobs.countDocuments({ status: { $in: [JobExecutionStatus.FAILED, JobExecutionStatus.TIMED_OUT, JobExecutionStatus.DEAD_LETTERED] } }).exec(),
      this.jobs.find({}).sort({ updatedAt: -1 }).limit(10).select('executionId jobKey queue status progress updatedAt errorMessage').lean<PlainRecord[]>().exec(),
      this.insights.countDocuments({ status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] } }).exec(),
      this.insights.countDocuments({ status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] }, priority: { $in: [InsightPriority.CRITICAL, InsightPriority.HIGH] } }).exec(),
      this.insights.find({ status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] } }).sort({ generatedAt: -1 }).limit(10).select('insightId title summary category type priority confidence generatedAt supportingOpportunities affectedEntities suggestedActions').lean<PlainRecord[]>().exec(),
      this.opportunities.countDocuments({ status: { $nin: [OpportunityStatus.RESOLVED, OpportunityStatus.DISMISSED, OpportunityStatus.EXPIRED, OpportunityStatus.INVALIDATED, OpportunityStatus.SUPERSEDED] } }).exec(),
      this.opportunities.countDocuments({ status: OpportunityStatus.ACCEPTED }).exec(),
      this.opportunities.countDocuments({ status: OpportunityStatus.IN_PROGRESS }).exec(),
      this.opportunities.countDocuments({ status: OpportunityStatus.RESOLVED }).exec(),
      this.opportunities.find({}).sort({ lastDetectedAt: -1 }).limit(10).select('opportunityId titleKey category opportunityType scope entityType entityId score confidence priority status estimatedImpact suggestedActionType expiresAt lastDetectedAt').lean<PlainRecord[]>().exec(),
      this.opportunities.aggregate([{ $group: { _id: '$priority', value: { $sum: 1 } } }, { $sort: { value: -1 } }]).exec(),
      this.opportunities.aggregate([{ $group: { _id: '$category', value: { $sum: 1 } } }, { $sort: { value: -1 } }]).exec(),
      this.insights.aggregate([{ $match: { status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] }, isDeleted: { $ne: true } } }, { $group: { _id: '$category', value: { $sum: 1 } } }, { $sort: { value: -1 } }]).exec(),
    ]);
    const mappedProjects = recentProjects.map((project) => ({ id: String(project._id), title: String(project.title ?? 'Untitled project'), subtitle: project.subtitle as string | undefined, primaryMetric: project.progress as number | undefined, secondaryMetric: project.status as string | undefined, status: project.status as string | undefined, updatedAt: this.iso(project.updatedAt), drillDownPath: `/projects/${String(project._id)}` }));
    const mappedJobs = recentJobs.map((job) => ({ id: String(job.executionId ?? job._id), title: String(job.jobKey ?? job.queue ?? 'Background job'), type: String(job.queue ?? 'BACKGROUND_JOB'), status: job.status as string | undefined, progress: job.progress as number | undefined, timestamp: this.iso(job.updatedAt), updatedAt: this.iso(job.updatedAt), drillDownPath: '/operations/jobs' }));
    const mappedInsights = recentInsights.map((insight) => ({ id: String(insight.insightId ?? insight._id), title: String(insight.title ?? 'AI Insight'), summary: String(insight.summary ?? ''), category: insight.category as string | undefined, type: insight.type as string | undefined, priority: insight.priority as string | undefined, confidence: insight.confidence as number | undefined, generatedAt: this.iso(insight.generatedAt), supportingMetrics: [], relatedOpportunities: (insight.supportingOpportunities as string[] | undefined) ?? [], affectedEntities: ((insight.affectedEntities as PlainRecord[] | undefined) ?? []).map((entity) => String(entity.id ?? entity.type ?? 'entity')), suggestedActions: ((insight.suggestedActions as PlainRecord[] | undefined) ?? []).map((action) => String(action.label ?? action.type ?? 'Review')), drillDownPath: `/analytics/ai-insights/${String(insight.insightId ?? insight._id)}` }));
    const mappedOpportunities = recentOpportunities.map((opportunity) => ({ id: String(opportunity.opportunityId ?? opportunity._id), title: String(opportunity.titleKey ?? 'Opportunity'), category: opportunity.category as string | undefined, type: opportunity.opportunityType as string | undefined, scope: opportunity.scope as string | undefined, entity: opportunity.entityType as string | undefined, affectedEntity: opportunity.entityType as string | undefined, score: opportunity.score as number | undefined, confidence: opportunity.confidence as number | undefined, priority: opportunity.priority as string | undefined, status: opportunity.status as string | undefined, estimatedImpact: opportunity.estimatedImpact ? JSON.stringify(opportunity.estimatedImpact) : undefined, suggestedActionType: opportunity.suggestedActionType as string | undefined, expiresAt: this.iso(opportunity.expiresAt), updatedAt: this.iso(opportunity.lastDetectedAt), evidenceSummary: opportunity.category as string | undefined, actionPath: `/analytics/opportunities/${String(opportunity.opportunityId ?? opportunity._id)}`, path: `/analytics/opportunities/${String(opportunity.opportunityId ?? opportunity._id)}`, drillDownPath: `/analytics/opportunities/${String(opportunity.opportunityId ?? opportunity._id)}` }));
    const failedJobItems = mappedJobs.filter((job) => [JobExecutionStatus.FAILED, JobExecutionStatus.TIMED_OUT, JobExecutionStatus.DEAD_LETTERED].includes(job.status as JobExecutionStatus)).map((job) => ({ id: job.id, title: job.title, severity: 'HIGH', timestamp: job.timestamp, source: job.type, drillDownPath: job.drillDownPath, status: job.status }));
    return { generatedAt, categoryTotal, projectTotal, activeProjects, recentProjects: mappedProjects, queuedJobs, runningJobs, failedJobs, recentJobs: mappedJobs, insightTotal, highPriorityInsights, recentInsights: mappedInsights, riskInsights: mappedInsights.filter((insight) => insight.category === InsightCategory.RISK || insight.priority === InsightPriority.HIGH || insight.priority === InsightPriority.CRITICAL), opportunityTotal, acceptedOpportunities, inProgressOpportunities, resolvedOpportunities, recentOpportunities: mappedOpportunities, failedJobItems, opportunityPriorityDistribution: this.distribution(opportunityPriorityDistribution, '/analytics/opportunities'), opportunityCategoryDistribution: this.distribution(opportunityCategoryDistribution, '/analytics/opportunities'), insightCategoryDistribution: this.distribution(insightCategoryDistribution, '/analytics/ai-insights'), activity: [...mappedProjects.map((project) => ({ id: project.id, type: 'PROJECT', title: project.title, description: project.status, timestamp: project.updatedAt, entity: 'PROJECT', status: project.status, path: project.drillDownPath, drillDownPath: project.drillDownPath })), ...mappedJobs].slice(0, 10) };
  }

  private kpis(base: Awaited<ReturnType<DashboardAnalyticsService['base']>>) {
    return [this.kpi('Projects', base.projectTotal), this.kpi('Active Projects', base.activeProjects), this.kpi('Categories', base.categoryTotal), this.kpi('Queued Jobs', base.queuedJobs), this.kpi('Failed Jobs', base.failedJobs), this.kpi('AI Insights', base.insightTotal), this.kpi('Opportunities', base.opportunityTotal)];
  }

  private kpi(label: string, value: number, unit?: string) {
    return { key: label.toLowerCase().replace(/\s+/g, '-'), label, value, unit, trend: { direction: 'FLAT' } };
  }

  private distribution(rows: Array<{ _id: string; value: number }>, path: string) {
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return rows.map((row) => ({ id: String(row._id ?? 'unknown'), label: String(row._id ?? 'Unknown'), value: row.value, percentage: total > 0 ? Math.round((row.value / total) * 10000) / 100 : 0, path }));
  }

  private metadata(generatedAt: string) {
    return { generatedAt, freshness: { status: 'CURRENT', timestamp: generatedAt }, completeness: this.complete(), dataCompleteness: this.complete() };
  }

  private freshness(generatedAt: string) {
    return [{ id: 'database', key: 'database', label: 'Database records', status: 'CURRENT', timestamp: generatedAt, completeness: this.complete() }];
  }

  private complete() {
    return { status: 'COMPLETE', availablePercentage: 100, missingFields: [] };
  }

  private emptyTrend(generatedAt: string) {
    return { granularity: 'MONTHLY', series: [{ key: 'projects', label: 'Projects', points: [] }], metadata: this.metadata(generatedAt) };
  }

  private healthScore(base: Awaited<ReturnType<DashboardAnalyticsService['base']>>) {
    if (base.failedJobs > 0) return 60;
    if (base.activeProjects > 0 || base.insightTotal > 0 || base.opportunityTotal > 0) return 80;
    return null;
  }

  private prioritySeverity(priority?: string) {
    if (priority === OpportunityPriority.CRITICAL) return 'CRITICAL';
    if (priority === OpportunityPriority.HIGH) return 'HIGH';
    if (priority === OpportunityPriority.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private iso(value: unknown) {
    return value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : undefined;
  }
}
