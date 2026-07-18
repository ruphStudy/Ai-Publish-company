import { Injectable } from '@nestjs/common';
import { opportunityAnalyticsDefaultPolicy } from './config/opportunity-analytics.config';

@Injectable()
export class OpportunityRuleRegistry {
  all() { return opportunityAnalyticsDefaultPolicy.rules.filter((rule) => rule.enabled); }
  get(ruleKey: string) { return this.all().find((rule) => rule.ruleKey === ruleKey) ?? null; }
}
