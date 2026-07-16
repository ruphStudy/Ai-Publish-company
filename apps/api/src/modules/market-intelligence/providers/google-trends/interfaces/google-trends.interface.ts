export interface GoogleTrendsTrendRequest {
  keyword: string;
  geo?: string;
  language?: string;
  category?: number;
  timeRange?: string;
}

export interface GoogleTrendsTimelineItem {
  date: string;
  value: number;
  isPartial?: boolean;
}

export interface GoogleTrendsTimelineResponse {
  keyword: string;
  geo: string;
  timeRange: string;
  data: GoogleTrendsTimelineItem[];
  averageValue: number;
  maxValue: number;
  minValue: number;
}

export interface GoogleTrendsRelatedTopic {
  topic: string;
  type: string;
  value: number | string;
  link?: string;
}

export interface GoogleTrendsRelatedTopicsResponse {
  keyword: string;
  geo: string;
  rising: GoogleTrendsRelatedTopic[];
  top: GoogleTrendsRelatedTopic[];
}

export interface GoogleTrendsRelatedQuery {
  query: string;
  value: number | string;
  link?: string;
}

export interface GoogleTrendsRelatedQueriesResponse {
  keyword: string;
  geo: string;
  rising: GoogleTrendsRelatedQuery[];
  top: GoogleTrendsRelatedQuery[];
}

export interface GoogleTrendsTrendingSearchItem {
  title: string;
  trafficVolume: string;
  relatedLinks: string[];
  articleLinks: string[];
  image?: string;
}

export interface GoogleTrendsTrendingSearchesResponse {
  geo: string;
  date: string;
  items: GoogleTrendsTrendingSearchItem[];
}

export interface GoogleTrendsGeoItem {
  geoCode: string;
  geoName: string;
  value: number;
  maxValueIndex: number;
}

export interface GoogleTrendsGeographicResponse {
  keyword: string;
  timeRange: string;
  resolution: string;
  items: GoogleTrendsGeoItem[];
}

export interface NormalizedTrendData {
  provider: string;
  keyword: string;
  trendScore: number | null;
  trendDirection: string | null;
  searchVolume: number | null;
  growthPercentage: number | null;
  region: string | null;
  language: string | null;
  timeRange: string | null;
  relatedTopics: string[];
  relatedQueries: string[];
  risingQueries: string[];
  sourceUrl: string | null;
  collectedAt: string;
  timeline: GoogleTrendsTimelineItem[];
  geographicInterest: GoogleTrendsGeoItem[];
  queryType: string;
}

export interface NormalizedTrendsCollection {
  trends: NormalizedTrendData[];
  totalCount: number;
  queryType: string;
  geo: string;
  timeRange: string;
  collectedAt: string;
}

export interface GoogleTrendsApiError {
  code: string;
  message: string;
  status?: number;
}
