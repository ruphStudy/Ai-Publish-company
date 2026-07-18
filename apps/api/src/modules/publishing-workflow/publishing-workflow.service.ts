import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { AIWritingRepository } from '../ai-writing/ai-writing.repository';
import { BookMetadataRepository } from '../book-metadata/book-metadata.repository';
import { BookProjectService } from '../book-project/book-project.service';
import { ExportJobStatus } from '../export/entities/export-job.entity';
import { ExportRepository } from '../export/export.repository';
import { PublicationReadinessRepository } from '../publication-readiness/publication-readiness.repository';
import { TableOfContentsRepository } from '../table-of-contents/table-of-contents.repository';
import { defaultPublishingWorkflowPolicy, scopeFormats } from './config/publishing-workflow.config';
import type { CreatePublishingWorkflowDto, PublishingActionDto, PublishingWorkflowQueryDto } from './dto';
import { PublishingStepType, PublishingTargetStatus, PublishingWorkflow, PublishingWorkflowEventType, PublishingWorkflowStatus } from './entities/publishing-workflow.entity';
import { PublishingProviderFactory } from './publishing-provider.factory';
import { PublishingTargetExecutionRepository } from './publishing-target-execution.repository';
import { PublishingWorkflowEngine } from './publishing-workflow.engine';
import { PublishingWorkflowEventRepository } from './publishing-workflow-event.repository';
import { PublishingWorkflowFactory } from './publishing-workflow.factory';
import { PublishingWorkflowMapper } from './publishing-workflow.mapper';
import { PublishingWorkflowRepository } from './publishing-workflow.repository';
import { PublishingWorkflowStepRepository } from './publishing-workflow-step.repository';
import { PublishingWorkflowValidator } from './publishing-workflow.validator';

@Injectable()
export class PublishingWorkflowService {
  constructor(private readonly projects: BookProjectService, private readonly contents: AIWritingRepository, private readonly readiness: PublicationReadinessRepository, private readonly metadata: BookMetadataRepository, private readonly toc: TableOfContentsRepository, private readonly exports: ExportRepository, private readonly workflows: PublishingWorkflowRepository, private readonly targets: PublishingTargetExecutionRepository, private readonly steps: PublishingWorkflowStepRepository, private readonly events: PublishingWorkflowEventRepository, private readonly providers: PublishingProviderFactory, private readonly engine: PublishingWorkflowEngine, private readonly factory: PublishingWorkflowFactory, private readonly validator: PublishingWorkflowValidator, private readonly mapper: PublishingWorkflowMapper) {}
  async create(dto: CreatePublishingWorkflowDto, requestedBy: string) {
    await this.projects.findOne(dto.projectId); await this.validateManuscript(dto.projectId, dto.manuscriptVersion);
    const policy = { ...defaultPublishingWorkflowPolicy, profile: dto.policyProfile ?? defaultPublishingWorkflowPolicy.profile };
    const targetConfigs = (dto.targets?.length ? dto.targets.map((target, index) => ({ ...policy.enabledTargets[0], ...target, configurationProfile: target.configurationProfile ?? target.providerKey, priority: index + 1, capabilities: policy.enabledTargets[0].capabilities, requestedFormats: target.requestedFormats ?? scopeFormats[dto.publicationScope] })) : policy.enabledTargets).sort((a, b) => a.priority - b.priority);
    const fingerprint = this.factory.fingerprint({ projectId: dto.projectId, manuscriptVersion: dto.manuscriptVersion, publicationScope: dto.publicationScope, targets: targetConfigs, policyVersion: policy.policyVersion });
    const idempotencyKey = dto.idempotencyKey ?? this.factory.idempotencyKey({ projectId: dto.projectId, manuscriptVersion: dto.manuscriptVersion, publicationScope: dto.publicationScope, fingerprint });
    const existingByKey = await this.workflows.findByIdempotencyKey(idempotencyKey); if (existingByKey) return this.mapper.toResponse(existingByKey);
    const active = await this.workflows.findActiveWorkflow(dto.projectId, dto.manuscriptVersion, dto.publicationScope, fingerprint, policy.policyVersion); if (active) throw new ConflictException('Active publishing workflow already exists');
    const workflow = await this.workflows.create(this.factory.workflow({ projectId: dto.projectId, manuscriptVersion: dto.manuscriptVersion, publicationScope: dto.publicationScope, requestedBy, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null }, policy, fingerprint, idempotencyKey));
    const targetDocs = await Promise.all(targetConfigs.map((target) => this.targets.create(this.factory.target(workflow, target))));
    await this.workflows.update(String(workflow._id), { targetIds: targetDocs.map((target) => String(target._id)) });
    await Promise.all(this.factory.steps(String(workflow._id)).map((step) => this.steps.create(step)));
    await this.events.create(this.factory.event(String(workflow._id), PublishingWorkflowEventType.WORKFLOW_CREATED, 'Publishing workflow created', requestedBy));
    return this.validate(String(workflow._id));
  }
  async validate(id: string) {
    const workflow = await this.document(id); this.validator.validateWorkflowTransition(workflow.status, PublishingWorkflowStatus.PENDING_VALIDATION);
    await this.workflows.update(id, { status: PublishingWorkflowStatus.PENDING_VALIDATION, currentStep: PublishingStepType.VALIDATE_READINESS });
    await this.events.create(this.factory.event(id, PublishingWorkflowEventType.VALIDATION_STARTED, 'Publishing workflow validation started', workflow.requestedBy));
    const readiness = await this.readiness.latestAssessment(workflow.projectId, workflow.manuscriptVersion);
    const metadata = (await this.metadata.findByProjectId(workflow.projectId))[0];
    const toc = (await this.toc.findByProjectId(workflow.projectId))[0];
    const exportJob = await this.exports.latestExport(workflow.projectId);
    const blockedReasons: string[] = [];
    if (!readiness) blockedReasons.push('Publication readiness result is missing');
    if (readiness) this.validator.validateReady({ readinessDecision: readiness.finalDecision, readinessStatus: readiness.status, manualApprovalRequired: readiness.manualApprovalRequired, manualApprovalStatus: readiness.manualApprovalStatus, blockers: readiness.blockers });
    if (!metadata) blockedReasons.push('Book metadata is missing');
    if (!toc) blockedReasons.push('Table of contents is missing');
    if (!exportJob || exportJob.status !== ExportJobStatus.COMPLETED || !exportJob.generatedFiles.length) blockedReasons.push('Completed export artifacts are missing');
    const sourceResultIds: Record<string, string> = readiness ? { PUBLICATION_READINESS: String(readiness._id) } : {};
    const sourceResultVersions: Record<string, string> = readiness ? { PUBLICATION_READINESS: String(readiness.readinessVersion) } : {};
    const update: Partial<PublishingWorkflow> = { sourceResultIds, sourceResultVersions, metadataId: metadata ? String(metadata._id) : null, tocId: toc ? String(toc._id) : null, exportArtifactIds: exportJob?.generatedFiles.map((artifact) => artifact.artifactId) ?? [], blockedReasons };
    if (blockedReasons.length) { const blocked = await this.workflows.update(id, { ...update, status: PublishingWorkflowStatus.BLOCKED }); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.WORKFLOW_BLOCKED, 'Publishing workflow blocked', workflow.requestedBy, undefined, { blockedReasons })); return this.mapper.toResponse(blocked!); }
    const ready = await this.workflows.update(id, { ...update, status: PublishingWorkflowStatus.READY, currentStep: PublishingStepType.RESOLVE_TARGETS });
    await this.events.create(this.factory.event(id, PublishingWorkflowEventType.VALIDATION_COMPLETED, 'Publishing workflow validation completed', workflow.requestedBy));
    return this.mapper.toResponse(ready!);
  }
  async queue(id: string) { const workflow = await this.document(id); this.validator.validateWorkflowTransition(workflow.status, PublishingWorkflowStatus.QUEUED); const queued = await this.workflows.update(id, { status: PublishingWorkflowStatus.QUEUED, queuedAt: new Date(), currentStep: PublishingStepType.QUEUE_SUBMISSION }); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.WORKFLOW_QUEUED, 'Publishing workflow queued', workflow.requestedBy)); return this.mapper.toResponse(queued!); }
  async start(id: string) {
    const workflow = await this.document(id); if (workflow.status === PublishingWorkflowStatus.READY) await this.queue(id); const current = await this.document(id); this.validator.validateWorkflowTransition(current.status, PublishingWorkflowStatus.PROCESSING);
    await this.workflows.update(id, { status: PublishingWorkflowStatus.PROCESSING, startedAt: new Date(), currentStep: PublishingStepType.SUBMIT }); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.WORKFLOW_STARTED, 'Publishing workflow started', current.requestedBy));
    const targets = await this.targets.findByWorkflowId(id);
    for (const target of targets.filter((item) => ![PublishingTargetStatus.SUBMITTED, PublishingTargetStatus.PUBLISHED].includes(item.status))) {
      const provider = this.providers.resolve(target.providerKey);
      await this.targets.update(String(target._id), { status: PublishingTargetStatus.SUBMITTING, submittedAt: new Date() });
      await this.events.create(this.factory.event(id, PublishingWorkflowEventType.SUBMISSION_STARTED, 'Target submission started', current.requestedBy, String(target._id), { providerKey: target.providerKey }));
      const pkg = { reference: `workflow://${id}/${target.targetKey}`, checksum: target.submissionFingerprint, artifactIds: current.exportArtifactIds, metadata: { metadataId: current.metadataId, tocId: current.tocId } };
      await provider.validatePackage(pkg);
      const response = await provider.submit(await provider.prepareSubmission({ idempotencyKey: target.idempotencyKey, submissionFingerprint: target.submissionFingerprint, packageReference: pkg, targetConfiguration: { profile: target.configurationProfile } }));
      await this.targets.update(String(target._id), { status: response.status, packageReference: pkg.reference, packageChecksum: pkg.checksum, externalSubmissionId: response.externalSubmissionId, externalPublicationId: response.externalPublicationId ?? null, providerStatus: response.providerStatus, providerStatusMessage: response.providerStatusMessage, normalizedResponse: this.engine.sanitizeProviderResponse(response.normalizedResponse) });
      await this.events.create(this.factory.event(id, PublishingWorkflowEventType.SUBMISSION_COMPLETED, 'Target submission completed', current.requestedBy, String(target._id), { externalSubmissionId: response.externalSubmissionId }));
    }
    const updatedTargets = await this.targets.findByWorkflowId(id); const aggregate = this.engine.aggregate(updatedTargets.map((target) => target.status)); const status = PublishingWorkflowStatus[aggregate]; const completedAt = status === PublishingWorkflowStatus.COMPLETED ? new Date() : null; const updated = await this.workflows.update(id, { status, completedAt, currentStep: PublishingStepType.COMPLETE });
    await this.events.create(this.factory.event(id, status === PublishingWorkflowStatus.COMPLETED ? PublishingWorkflowEventType.WORKFLOW_COMPLETED : PublishingWorkflowEventType.WORKFLOW_PARTIALLY_COMPLETED, 'Publishing workflow execution finished', current.requestedBy));
    return this.mapper.toResponse(updated!);
  }
  async retry(id: string) { const workflow = await this.document(id); if (![PublishingWorkflowStatus.FAILED, PublishingWorkflowStatus.PARTIALLY_COMPLETED, PublishingWorkflowStatus.RETRY_PENDING].includes(workflow.status)) throw new ConflictException('Publishing workflow is not retryable'); const nextRetryAt = this.engine.nextRetryAt(workflow.retryCount + 1, defaultPublishingWorkflowPolicy.retryDelayMs, defaultPublishingWorkflowPolicy.backoffStrategy); const updated = await this.workflows.update(id, { status: PublishingWorkflowStatus.RETRY_PENDING, retryCount: workflow.retryCount + 1, nextRetryAt }); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.RETRY_SCHEDULED, 'Publishing workflow retry scheduled', workflow.requestedBy)); return this.mapper.toResponse(updated!); }
  async cancel(id: string, dto: PublishingActionDto, userId?: string) { const workflow = await this.document(id); if ([PublishingWorkflowStatus.COMPLETED, PublishingWorkflowStatus.CANCELLED, PublishingWorkflowStatus.SUPERSEDED].includes(workflow.status)) throw new ConflictException('Publishing workflow cannot be cancelled'); await this.workflows.update(id, { status: PublishingWorkflowStatus.CANCEL_REQUESTED, cancellationReason: dto.reason ?? null }); await Promise.all((await this.targets.findByWorkflowId(id)).filter((target) => ![PublishingTargetStatus.PUBLISHED, PublishingTargetStatus.SUBMITTED].includes(target.status)).map((target) => this.targets.update(String(target._id), { status: PublishingTargetStatus.CANCELLED, cancelledAt: new Date() }))); const updated = await this.workflows.update(id, { status: PublishingWorkflowStatus.CANCELLED, cancelledAt: new Date(), updatedBy: userId ?? null }); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.WORKFLOW_CANCELLED, 'Publishing workflow cancelled', userId, undefined, { reason: dto.reason })); return this.mapper.toResponse(updated!); }
  async resume(id: string, userId?: string) { const workflow = await this.document(id); if (![PublishingWorkflowStatus.FAILED, PublishingWorkflowStatus.PARTIALLY_COMPLETED, PublishingWorkflowStatus.RETRY_PENDING, PublishingWorkflowStatus.BLOCKED].includes(workflow.status)) throw new ConflictException('Publishing workflow cannot be resumed'); await this.events.create(this.factory.event(id, PublishingWorkflowEventType.WORKFLOW_RESUMED, 'Publishing workflow resumed', userId)); const updated = await this.workflows.update(id, { status: PublishingWorkflowStatus.PENDING_VALIDATION, updatedBy: userId ?? null }); return this.mapper.toResponse(updated!); }
  async listTargets(id: string) { return this.targets.findByWorkflowId(id); }
  async listSteps(id: string) { return this.steps.findByWorkflowId(id); }
  async listEvents(id: string) { return this.events.findByWorkflowId(id); }
  async findById(id: string) { return this.mapper.toResponse(await this.document(id)); }
  async latest(projectId: string, manuscriptVersion?: string) { const item = await this.workflows.findLatestWorkflow(projectId, manuscriptVersion); if (!item) throw new NotFoundException('Publishing workflow not found'); return this.mapper.toResponse(item); }
  async findByProjectId(projectId: string) { return (await this.workflows.findByProjectId(projectId)).map((item) => this.mapper.toResponse(item)); }
  async search(query: PublishingWorkflowQueryDto) { const filter: FilterQuery<PublishingWorkflow> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.manuscriptVersion) filter.manuscriptVersion = query.manuscriptVersion; if (query.status) filter.status = query.status; const result = await this.workflows.paginate(filter, query.page, query.limit); return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) }; }
  async softDelete(id: string, userId?: string) { if (!(await this.workflows.softDelete(id, userId))) throw new NotFoundException('Publishing workflow not found'); }
  async restore(id: string) { const item = await this.workflows.restore(id); if (!item) throw new NotFoundException('Deleted publishing workflow not found'); return this.mapper.toResponse(item); }
  private async validateManuscript(projectId: string, manuscriptVersion: string): Promise<void> { const records = await this.contents.findByProjectId(projectId); if (!records.length) throw new NotFoundException('Manuscript not found'); const actualVersion = records.map((item) => item.contentVersion).join('+'); if (actualVersion !== manuscriptVersion) throw new ConflictException('Manuscript version mismatch'); }
  private async document(id: string) { const item = await this.workflows.findById(id); if (!item) throw new NotFoundException('Publishing workflow not found'); return item; }
}
