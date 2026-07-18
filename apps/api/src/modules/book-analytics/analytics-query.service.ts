import { Injectable } from '@nestjs/common';
import { AnalyticsQueryDto } from './dto';
import { AnalyticsScope } from './entities/book-analytics.entity';
import { BookAnalyticsEngine } from './book-analytics.engine';

@Injectable()
export class AnalyticsQueryService {
  constructor(private readonly engine: BookAnalyticsEngine) {}
  summary(scope: AnalyticsScope, query: AnalyticsQueryDto) { return this.engine.calculate({ ...query, scope }); }
  trend(scope: AnalyticsScope, query: AnalyticsQueryDto) { return this.engine.calculate({ ...query, scope }).then((result) => result.trends); }
  comparison(scope: AnalyticsScope, query: AnalyticsQueryDto) { return this.engine.calculate({ ...query, scope }).then((result) => result.comparisonValues); }
  breakdown(scope: AnalyticsScope, key: string, query: AnalyticsQueryDto) { return this.engine.calculate({ ...query, scope }).then((result) => result.dimensionBreakdowns[key] ?? []); }
}
