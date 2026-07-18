import type {
  ClassificationContext,
  ClassificationResult,
} from '../models/classification-result.model';

export const CLASSIFICATION_STRATEGIES_TOKEN = 'CLASSIFICATION_STRATEGIES';

export interface ClassificationStrategy {
  readonly key: string;
  readonly priority: number;

  supports(context: ClassificationContext): boolean;
  classify(context: ClassificationContext): Promise<ClassificationResult>;
}