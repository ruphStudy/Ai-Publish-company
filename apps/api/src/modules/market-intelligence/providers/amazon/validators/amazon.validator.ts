import { Injectable } from '@nestjs/common';

import { DataSourceParams } from '../../../interfaces/data-source.interface';
import { AMAZON_SEARCH_TYPE, AMAZON_MAX_ITEMS_PER_REQUEST } from '../constants/amazon.constants';

@Injectable()
export class AmazonProviderValidator {
  validate(params: DataSourceParams): string[] {
    const errors: string[] = [];
    const options = params.options ?? {};
    const searchType = options.searchType as string | undefined;

    if (searchType !== undefined && !this.isValidSearchType(searchType)) {
      errors.push(
        `options.searchType "${searchType}" is not valid. Allowed: ${Object.values(AMAZON_SEARCH_TYPE).join(', ')}`,
      );
    }

    const resolvedSearchType = searchType ?? this.inferSearchType(params);

    if (resolvedSearchType === AMAZON_SEARCH_TYPE.METADATA) {
      const asins = options.asins;
      if (!Array.isArray(asins) || asins.length === 0) {
        errors.push('options.asins (string[]) is required for searchType "metadata"');
      } else if (asins.length > AMAZON_MAX_ITEMS_PER_REQUEST) {
        errors.push(
          `options.asins may contain at most ${AMAZON_MAX_ITEMS_PER_REQUEST} ASINs per request`,
        );
      } else {
        const invalidAsins = (asins as unknown[]).filter(
          (a) => typeof a !== 'string' || !/^[A-Z0-9]{10}$/.test(a as string),
        );
        if (invalidAsins.length > 0) {
          errors.push(
            `options.asins contains invalid ASIN format. ASINs must be 10 alphanumeric characters.`,
          );
        }
      }
    }

    if (
      resolvedSearchType === AMAZON_SEARCH_TYPE.KEYWORD &&
      !params.keywords?.length &&
      !options.keywords
    ) {
      errors.push(
        'keywords or options.keywords is required for searchType "keyword"',
      );
    }

    const itemCount = options.itemCount as number | undefined;
    if (itemCount !== undefined) {
      if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > AMAZON_MAX_ITEMS_PER_REQUEST) {
        errors.push(
          `options.itemCount must be an integer between 1 and ${AMAZON_MAX_ITEMS_PER_REQUEST}`,
        );
      }
    }

    const page = options.page as number | undefined;
    if (page !== undefined) {
      if (!Number.isInteger(page) || page < 1 || page > 10) {
        errors.push('options.page must be an integer between 1 and 10');
      }
    }

    return errors;
  }

  private isValidSearchType(value: string): boolean {
    return (Object.values(AMAZON_SEARCH_TYPE) as readonly string[]).includes(value);
  }

  inferSearchType(params: DataSourceParams): string {
    const options = params.options ?? {};

    if (options.searchType) {
      return options.searchType as string;
    }

    const dataType = params.dataType;

    const mapping: Record<string, string> = {
      market_trend: AMAZON_SEARCH_TYPE.TRENDING,
      genre_analysis: AMAZON_SEARCH_TYPE.CATEGORY,
      keyword_data: AMAZON_SEARCH_TYPE.KEYWORD,
      pricing_data: AMAZON_SEARCH_TYPE.METADATA,
      competitive_analysis: AMAZON_SEARCH_TYPE.CATEGORY,
      book_opportunity: AMAZON_SEARCH_TYPE.KEYWORD,
    };

    return mapping[dataType] ?? AMAZON_SEARCH_TYPE.KEYWORD;
  }
}

export { AmazonProviderValidator as AmazonValidator };
