import { BadRequestException, Injectable } from '@nestjs/common';
import type { ExecutionGraphNode, ResolvedProviderTarget } from './interfaces/multi-platform-publishing.interface';

@Injectable()
export class PublishingDependencyResolver {
  graph(targets: ResolvedProviderTarget[]): Record<string, string[]> { const graph = Object.fromEntries(targets.map((target) => [target.providerKey, target.dependencies])); this.detectCycles(graph); return graph; }
  nodes(targets: ResolvedProviderTarget[]): ExecutionGraphNode[] { const graph = this.graph(targets); return targets.map((target) => ({ nodeId: target.providerKey, providerKey: target.providerKey, dependencies: graph[target.providerKey] ?? [], priority: target.priority, readinessState: 'READY', executionState: 'PENDING', attempt: 1 })); }
  private detectCycles(graph: Record<string, string[]>): void { const visiting = new Set<string>(); const visited = new Set<string>(); const visit = (node: string) => { if (visiting.has(node)) throw new BadRequestException('Publishing provider dependency cycle detected'); if (visited.has(node)) return; visiting.add(node); for (const dep of graph[node] ?? []) visit(dep); visiting.delete(node); visited.add(node); }; Object.keys(graph).forEach(visit); }
}
