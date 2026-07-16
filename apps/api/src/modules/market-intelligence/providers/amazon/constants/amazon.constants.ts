export const AMAZON_PROVIDER_KEY = 'amazon-kdp-v1';
export const AMAZON_PROVIDER_VERSION = '1.0.0';
export const AMAZON_PROVIDER_NAME = 'Amazon KDP Market Intelligence';

export const AMAZON_PAAPI_SERVICE = 'ProductAdvertisingAPI';
export const AMAZON_PAAPI_SEARCH_ITEMS_PATH = '/paapi5/searchitems';
export const AMAZON_PAAPI_GET_ITEMS_PATH = '/paapi5/getitems';
export const AMAZON_PAAPI_GET_BROWSE_NODES_PATH = '/paapi5/getbrowsenodes';
export const AMAZON_PAAPI_CONTENT_TYPE = 'application/json; charset=utf-8';
export const AMAZON_PAAPI_CONTENT_ENCODING = 'amz-1.0';
export const AMAZON_BOOKS_SEARCH_INDEX = 'Books';
export const AMAZON_PARTNER_TYPE = 'Associates';
export const AMAZON_MAX_ITEMS_PER_REQUEST = 10;
export const AMAZON_DEFAULT_ITEM_COUNT = 10;

export const AMAZON_SEARCH_TYPE = {
  KEYWORD: 'keyword',
  CATEGORY: 'category',
  TRENDING: 'trending',
  BEST_SELLERS: 'bestSellers',
  NEW_RELEASES: 'newReleases',
  METADATA: 'metadata',
} as const;

export type AmazonSearchType = (typeof AMAZON_SEARCH_TYPE)[keyof typeof AMAZON_SEARCH_TYPE];

export const AMAZON_SORT_BY = {
  RELEVANCE: 'Relevance',
  PRICE_LOW_TO_HIGH: 'Price:LowToHigh',
  PRICE_HIGH_TO_LOW: 'Price:HighToLow',
  AVG_CUSTOMER_REVIEWS: 'AvgCustomerReviews',
  NEWEST_ARRIVALS: 'NewestArrivals',
  FEATURED: 'Featured',
} as const;

export const AMAZON_SEARCH_TYPE_SORT_MAP: Record<string, string> = {
  trending: AMAZON_SORT_BY.FEATURED,
  bestSellers: AMAZON_SORT_BY.FEATURED,
  newReleases: AMAZON_SORT_BY.NEWEST_ARRIVALS,
  keyword: AMAZON_SORT_BY.RELEVANCE,
  category: AMAZON_SORT_BY.RELEVANCE,
  metadata: AMAZON_SORT_BY.RELEVANCE,
};

export const AMAZON_ITEM_RESOURCES: string[] = [
  'BrowseNodeInfo.BrowseNodes',
  'BrowseNodeInfo.BrowseNodes.SalesRank',
  'BrowseNodeInfo.WebsiteSalesRank',
  'Images.Primary.Large',
  'ItemInfo.ByLineInfo',
  'ItemInfo.Classifications',
  'ItemInfo.ContentInfo',
  'ItemInfo.ExternalIds',
  'ItemInfo.Features',
  'ItemInfo.ManufactureInfo',
  'ItemInfo.ProductInfo',
  'ItemInfo.Title',
  'Offers.Listings.Price',
  'Offers.Summaries.LowestPrice',
  'CustomerReviews.Count',
  'CustomerReviews.StarRating',
];

export const AMAZON_OPERATION_TARGETS = {
  SEARCH_ITEMS: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
  GET_ITEMS: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
  GET_BROWSE_NODES: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetBrowseNodes',
} as const;

export const AMAZON_ERROR_CODE_MAP: Record<string, string> = {
  RequestThrottled: 'PROVIDER_RATE_LIMITED',
  TooManyRequests: 'PROVIDER_RATE_LIMITED',
  AccessDeniedException: 'PROVIDER_UNAUTHORIZED',
  InvalidPartnerTag: 'PROVIDER_UNAUTHORIZED',
  InvalidParameterValue: 'PROVIDER_VALIDATION_FAILED',
  InvalidParameter: 'PROVIDER_VALIDATION_FAILED',
  BrowseNodeNotInStore: 'PROVIDER_VALIDATION_FAILED',
  NoResultFound: 'PROVIDER_EXECUTION_FAILED',
  ItemNotAccessible: 'PROVIDER_EXECUTION_FAILED',
};

export const AMAZON_CONFIG_TOKEN = 'AMAZON_PROVIDER_CONFIG';
export const AMAZON_ADAPTER_TOKEN = 'AMAZON_PROVIDER_ADAPTER';
export const MOCK_DELAY_MS = 50;
