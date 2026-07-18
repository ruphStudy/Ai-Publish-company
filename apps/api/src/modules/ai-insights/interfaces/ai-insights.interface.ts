import type { InsightCategory, InsightPriority, InsightScope, InsightType } from '../entities/ai-insight.entity';

export interface InsightGenerationContext { projectId?: string | null; scope: InsightScope; entityId?: string | null; analytics: Record<string, unknown>[]; opportunities: Record<string, unknown>[]; metadata: Record<string, unknown>; correlationId?: string | null }
export interface NormalizedInsightResponse { category: InsightCategory; type: InsightType; title: string; summary: string; explanation: string; recommendation: Record<string, unknown> | null; confidence: number; priority: InsightPriority; impact: Record<string, unknown> | null; evidence: Record<string, unknown>[]; suggestedActions: Record<string, unknown>[] }
export interface AIInsightProvider { providerKey: string; generate(prompt: string, model: string): Promise<{ content: string; model: string; provider: string; usage: Record<string, number> }> }
