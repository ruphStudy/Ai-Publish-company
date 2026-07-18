import { api } from '@/lib/api-client';

export interface WorkflowArtifact {
  id: string;
  title?: string;
  status?: string;
  updatedAt?: string;
}

export interface WorkflowStage {
  key: string;
  readiness: 'READY' | 'BLOCKED' | 'COMPLETED';
  available: WorkflowArtifact[];
  selected?: WorkflowArtifact | null;
  missingPrerequisites: string[];
  allowedActions: string[];
  blockingReason?: string;
  nextRecommendedAction?: string;
}

export interface WorkflowContext {
  project: WorkflowArtifact | null;
  artifacts: {
    marketIntelligence: WorkflowArtifact[];
    knowledge: WorkflowArtifact[];
    blueprints: WorkflowArtifact[];
    outlines: WorkflowArtifact[];
    metadata: WorkflowArtifact[];
    tableOfContents: WorkflowArtifact[];
    coverPrompts: WorkflowArtifact[];
    exports: WorkflowArtifact[];
  };
  stages: Record<string, WorkflowStage>;
}

export const workflowContextQueryKeys = {
  project: (projectId: string) => ['workflow-context', projectId] as const,
  marketIntelligence: (search: string) => ['workflow-context', 'market-intelligence', search] as const,
  knowledge: (search: string) => ['workflow-context', 'knowledge', search] as const,
};

export async function fetchWorkflowContext(projectId: string) {
  const { data } = await api.get<WorkflowContext>(`/workflow-context/projects/${projectId}`);
  return data;
}

export async function fetchWorkflowMarketIntelligence(search = '') {
  const { data } = await api.get<WorkflowArtifact[]>('/workflow-context/market-intelligence', { params: { search: search || undefined } });
  return data;
}

export async function fetchWorkflowKnowledge(search = '') {
  const { data } = await api.get<WorkflowArtifact[]>('/workflow-context/knowledge', { params: { search: search || undefined } });
  return data;
}
