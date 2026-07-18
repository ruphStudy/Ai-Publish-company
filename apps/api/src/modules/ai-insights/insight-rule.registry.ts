import { Injectable } from '@nestjs/common';
import { InsightCategory, InsightScope, InsightType } from './entities/ai-insight.entity';

@Injectable()
export class InsightRuleRegistry {
  all() { return [{ ruleKey: 'EXECUTIVE_SUMMARY', category: InsightCategory.EXECUTIVE_SUMMARY, type: InsightType.SUMMARY, scopes: Object.values(InsightScope), version: '1' }]; }
}
