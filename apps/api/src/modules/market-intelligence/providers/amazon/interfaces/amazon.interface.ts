export interface AmazonSearchItemsRequest {
  PartnerTag: string;
  PartnerType: string;
  Marketplace: string;
  SearchIndex: string;
  Keywords?: string;
  BrowseNodeId?: string;
  ItemCount: number;
  ItemPage?: number;
  SortBy?: string;
  LanguagesOfPreference?: string[];
  Resources: string[];
}

export interface AmazonGetItemsRequest {
  PartnerTag: string;
  PartnerType: string;
  Marketplace: string;
  ItemIds: string[];
  Resources: string[];
  LanguagesOfPreference?: string[];
}

export interface AmazonPrice {
  Amount?: number;
  Currency?: string;
  DisplayAmount?: string;
}

export interface AmazonOfferListing {
  Price?: AmazonPrice;
  Availability?: { Message?: string };
}

export interface AmazonOfferSummary {
  LowestPrice?: AmazonPrice;
  HighestPrice?: AmazonPrice;
  OfferCount?: number;
  Condition?: { Value?: string };
}

export interface AmazonBrowseNode {
  Id?: string;
  DisplayName?: string;
  IsRoot?: boolean;
  SalesRank?: number;
  Ancestor?: AmazonBrowseNode;
  Children?: AmazonBrowseNode[];
}

export interface AmazonItemInfo {
  Title?: {
    DisplayValue?: string;
    Label?: string;
    Locale?: string;
  };
  ByLineInfo?: {
    Brand?: { DisplayValue?: string; Label?: string };
    Contributors?: Array<{
      Name?: string;
      Role?: string;
      RoleType?: string;
      Locale?: string;
    }>;
    Manufacturer?: { DisplayValue?: string; Label?: string };
  };
  ContentInfo?: {
    Edition?: { DisplayValue?: string; Label?: string };
    Languages?: {
      DisplayValues?: Array<{ DisplayValue?: string; Type?: string }>;
      Label?: string;
      Locale?: string;
    };
    PagesCount?: { DisplayValue?: number; Label?: string };
    PublicationDate?: { DisplayValue?: string; Label?: string };
  };
  ManufactureInfo?: {
    ItemPartNumber?: { DisplayValue?: string };
    Model?: { DisplayValue?: string };
    Warranty?: { DisplayValue?: string };
  };
  ProductInfo?: {
    Color?: { DisplayValue?: string };
    IsAdultProduct?: { DisplayValue?: boolean };
    ReleaseDate?: { DisplayValue?: string };
    UnitCount?: { DisplayValue?: number };
  };
  Classifications?: {
    Binding?: { DisplayValue?: string; Label?: string };
    ProductGroup?: { DisplayValue?: string; Label?: string };
  };
  Features?: {
    DisplayValues?: string[];
    Label?: string;
    Locale?: string;
  };
  ExternalIds?: {
    EANs?: { DisplayValues?: string[]; Label?: string };
    ISBNs?: { DisplayValues?: string[]; Label?: string };
    UPCs?: { DisplayValues?: string[]; Label?: string };
  };
}

export interface AmazonCustomerReviews {
  Count?: number;
  StarRating?: { Value?: number };
}

export interface AmazonItem {
  ASIN?: string;
  DetailPageURL?: string;
  Images?: {
    Primary?: {
      Large?: { URL?: string; Height?: number; Width?: number };
      Medium?: { URL?: string; Height?: number; Width?: number };
    };
  };
  Offers?: {
    Listings?: AmazonOfferListing[];
    Summaries?: AmazonOfferSummary[];
  };
  ItemInfo?: AmazonItemInfo;
  BrowseNodeInfo?: {
    BrowseNodes?: AmazonBrowseNode[];
    WebsiteSalesRank?: { SalesRank?: number; DisplayName?: string; ContextFreeName?: string };
  };
  CustomerReviews?: AmazonCustomerReviews;
}

export interface AmazonApiError {
  Code?: string;
  Message?: string;
}

export interface AmazonSearchItemsResponse {
  SearchResult?: {
    Items?: AmazonItem[];
    SearchURL?: string;
    TotalResultCount?: number;
  };
  Errors?: AmazonApiError[];
}

export interface AmazonGetItemsResponse {
  ItemsResult?: {
    Items?: AmazonItem[];
  };
  Errors?: AmazonApiError[];
}

export interface AmazonHttpError {
  statusCode: number;
  responseBody: AmazonSearchItemsResponse | AmazonGetItemsResponse;
}

export interface NormalizedBook {
  provider: string;
  providerBookId: string;
  asin: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  authors: string[];
  category: string | null;
  subcategory: string | null;
  description: string | null;
  language: string | null;
  price: number | null;
  currency: string | null;
  rating: number | null;
  reviewCount: number | null;
  publicationDate: string | null;
  format: string | null;
  publisher: string | null;
  coverImage: string | null;
  sourceUrl: string | null;
  collectedAt: string;
  keywords: string[];
  salesRank: number | null;
}

export interface NormalizedMarketData {
  books: NormalizedBook[];
  totalCount: number | null;
  searchType: string;
  marketplace: string;
}
