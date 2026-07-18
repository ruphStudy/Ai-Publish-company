import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Category } from '../category/entities/category.entity';
import { BookProject, BookProjectStatus } from '../book-project/entities/book-project.entity';
import { JobExecution, JobExecutionStatus } from '../background-jobs/entities/background-job.entity';
import { AIInsight, InsightStatus } from '../ai-insights/entities/ai-insight.entity';

@Injectable()
export class DashboardSummaryService {
  constructor(
    @InjectModel(Category.name) private readonly categories: Model<Category>,
    @InjectModel(BookProject.name) private readonly projects: Model<BookProject>,
    @InjectModel(JobExecution.name) private readonly jobs: Model<JobExecution>,
    @InjectModel(AIInsight.name) private readonly insights: Model<AIInsight>,
  ) {}

  async summary(userId?: string) {
    const [categoryTotal, projectTotal, activeProjects, recentProjects, queuedJobs, runningJobs, failedJobs, insightTotal, recentInsights] = await Promise.all([
      this.categories.countDocuments({}).exec(),
      this.projects.countDocuments({}).exec(),
      this.projects.countDocuments({ status: { $in: [BookProjectStatus.DRAFT, BookProjectStatus.RESEARCHING, BookProjectStatus.OUTLINE_READY, BookProjectStatus.WRITING, BookProjectStatus.REVIEWING, BookProjectStatus.READY_FOR_PUBLISHING] } }).exec(),
      this.projects.find(userId ? { ownerId: userId } : {}).sort({ updatedAt: -1 }).limit(5).select('projectCode title status currentStage progress updatedAt categoryId').lean().exec(),
      this.jobs.countDocuments({ status: { $in: [JobExecutionStatus.PENDING, JobExecutionStatus.SCHEDULED, JobExecutionStatus.QUEUED, JobExecutionStatus.RETRYING] } }).exec(),
      this.jobs.countDocuments({ status: JobExecutionStatus.RUNNING }).exec(),
      this.jobs.countDocuments({ status: { $in: [JobExecutionStatus.FAILED, JobExecutionStatus.TIMED_OUT, JobExecutionStatus.DEAD_LETTERED] } }).exec(),
      this.insights.countDocuments({ status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] } }).exec(),
      this.insights.find({ status: { $in: [InsightStatus.GENERATED, InsightStatus.ACTIVE] } }).sort({ generatedAt: -1 }).limit(3).select('insightId title summary category priority confidence generatedAt').lean().exec(),
    ]);
    return {
      kpis: {
        categories: { value: categoryTotal },
        projects: { value: projectTotal, active: activeProjects },
        publishingQueue: { value: queuedJobs + runningJobs, running: runningJobs, failed: failedJobs },
        aiInsights: { value: insightTotal },
      },
      recentProjects: recentProjects.map((project) => ({
        id: String(project._id),
        projectCode: project.projectCode,
        title: project.title,
        status: project.status,
        currentStage: project.currentStage,
        progress: project.progress,
        updatedAt: project.updatedAt,
      })),
      recentInsights: recentInsights.map((insight) => ({
        id: insight.insightId,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        priority: insight.priority,
        confidence: insight.confidence,
        generatedAt: insight.generatedAt,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}
