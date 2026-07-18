export interface ResolvedProviderTarget { providerKey: string; providerFormat: string; required: boolean; priority: number; dependencies: string[]; storefronts: string[] }
export interface DistributionConflict { conflictId: string; type: string; severity: 'WARNING' | 'BLOCKING'; providerKeys: string[]; message: string; resolution?: string }
export interface ExecutionGraphNode { nodeId: string; providerKey: string; dependencies: string[]; priority: number; readinessState: string; executionState: string; blockingReason?: string; attempt: number }
