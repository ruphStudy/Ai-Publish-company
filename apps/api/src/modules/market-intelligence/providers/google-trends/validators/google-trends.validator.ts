import { Injectable } from '@nestjs/common';

import { DataSourceParams } from '../../../interfaces/data-source.interface';
import {
  GOOGLE_TRENDS_QUERY_TYPE,
  GOOGLE_TRENDS_TIME_RANGE,
} from '../constants/google-trends.constants';

@Injectable()
export class GoogleTrendsValidator {
  validate(params: DataSourceParams): string[] {
    const errors: string[] = [];
    const options = params.options ?? {};
    const queryType = options.queryType as string | undefined;

    if (queryType !== undefined && !this.isValidQueryType(queryType)) {
      errors.push(
        `options.queryType "${queryType}" is not valid. Allowed: ${Object.values(GOOGLE_TRENDS_QUERY_TYPE).join(', ')}`,
      );
    }

    const timeRange = options.timeRange as string | undefined;
    if (timeRange !== undefined && !this.isValidTimeRange(timeRange)) {
      errors.push(
        `options.timeRange "${timeRange}" is not valid. Allowed: ${Object.values(GOOGLE_TRENDS_TIME_RANGE).join(', ')}`,
      );
    }

    const resolvedQueryType = queryType ?? this.inferQueryType(params);

    if (
      resolvedQueryType !== GOOGLE_TRENDS_QUERY_TYPE.TRENDING_SEARCHES &&
      resolvedQueryType !== GOOGLE_TRENDS_QUERY_TYPE.GEOGRAPHIC_INTEREST
    ) {
      const hasKeyword =
        (params.keywords && params.keywords.length > 0) ||
        (typeof options.keyword === 'string' && options.keyword.length > 0);

      if (!hasKeyword) {
        errors.push(
          `keywords or options.keyword is required for queryType "${resolvedQueryType}"`,
        );
      }
    }

    const category = options.category as number | undefined;
    if (category !== undefined && (!Number.isInteger(category) || category < 0)) {
      errors.push('options.category must be a non-negative integer');
    }

    return errors;
  }

  inferQueryType(params: DataSourceParams): string {
    const options = params.options ?? {};

    if (options.queryType) {
      return options.queryType as string;
    }

    const dataType = params.dataType;

    const mapping: Record<string, string> = {
      market_trend: GOOGLE_TRENDS_QUERY_TYPE.TRENDING_SEARCHES,
      keyword_data: GOOGLE_TRENDS_QUERY_TYPE.KEYWORD_TREND,
      genre_analysis: GOOGLE_TRENDS_QUERY_TYPE.RELATED_TOPICS,
      competitive_analysis: GOOGLE_TRENDS_QUERY_TYPE.RELATED_QUERIES,
      book_opportunity: GOOGLE_TRENDS_QUERY_TYPE.RISING_QUERIES,
      pricing_data: GOOGLE_TRENDS_QUERY_TYPE.INTEREST_OVER_TIME,
    };

    return mapping[dataType] ?? GOOGLE_TRENDS_QUERY_TYPE.KEYWORD_TREND;
  }

  private isValidQueryType(value: string): boolean {
    return Object.values(GOOGLE_TRENDS_QUERY_TYPE).includes(value as any);
  }

  private isValidTimeRange(value: string): boolean {
    return Object.values(GOOGLE_TRENDS_TIME_RANGE).includes(value as any);
  }
}
