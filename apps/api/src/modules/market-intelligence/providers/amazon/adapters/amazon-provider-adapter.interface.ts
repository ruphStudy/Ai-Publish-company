import type { AmazonProviderConfig } from '../config/amazon-provider.config';
import type {
  AmazonSearchItemsRequest,
  AmazonGetItemsRequest,
  AmazonSearchItemsResponse,
  AmazonGetItemsResponse,
} from '../interfaces/amazon.interface';

export interface IAmazonProviderAdapter {
  searchItems(
    request: AmazonSearchItemsRequest,
    config: AmazonProviderConfig,
    timeoutMs: number,
  ): Promise<AmazonSearchItemsResponse>;

  getItems(
    request: AmazonGetItemsRequest,
    config: AmazonProviderConfig,
    timeoutMs: number,
  ): Promise<AmazonGetItemsResponse>;
}
