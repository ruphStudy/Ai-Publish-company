import { Injectable } from '@nestjs/common';

import { DataSourceProvider } from '../../../entities/market-intelligence.entity';
import {
  AmazonItem,
  AmazonBrowseNode,
  AmazonSearchItemsResponse,
  AmazonGetItemsResponse,
  NormalizedBook,
  NormalizedMarketData,
} from '../interfaces/amazon.interface';

@Injectable()
export class AmazonResponseMapper {
  mapSearchResponse(
    response: AmazonSearchItemsResponse,
    searchType: string,
    marketplace: string,
  ): NormalizedMarketData {
    const items = response.SearchResult?.Items ?? [];
    const totalCount = response.SearchResult?.TotalResultCount ?? null;

    return {
      books: items.map((item) => this.mapItem(item)),
      totalCount,
      searchType,
      marketplace,
    };
  }

  mapGetItemsResponse(
    response: AmazonGetItemsResponse,
    searchType: string,
    marketplace: string,
  ): NormalizedMarketData {
    const items = response.ItemsResult?.Items ?? [];

    return {
      books: items.map((item) => this.mapItem(item)),
      totalCount: items.length,
      searchType,
      marketplace,
    };
  }

  mapItem(item: AmazonItem): NormalizedBook {
    const asin = item.ASIN ?? '';
    const rawTitle = item.ItemInfo?.Title?.DisplayValue ?? '';
    const subtitle = this.extractSubtitle(rawTitle);
    const title = subtitle ? rawTitle.replace(`: ${subtitle}`, '').trim() : rawTitle;

    const authors = this.extractAuthors(item);
    const author = authors[0] ?? null;
    const publisher = this.extractPublisher(item);
    const language = this.extractLanguage(item);
    const publicationDate = this.extractPublicationDate(item);
    const format = item.ItemInfo?.Classifications?.Binding?.DisplayValue ?? null;
    const price = this.extractPrice(item);
    const currency = this.extractCurrency(item);
    const rating = item.CustomerReviews?.StarRating?.Value ?? null;
    const reviewCount = item.CustomerReviews?.Count ?? null;
    const description = this.extractDescription(item);
    const keywords = this.extractKeywords(item);
    const { category, subcategory } = this.extractCategories(item);
    const coverImage = item.Images?.Primary?.Large?.URL ?? null;
    const sourceUrl = item.DetailPageURL ?? null;
    const salesRank = item.BrowseNodeInfo?.WebsiteSalesRank?.SalesRank ?? null;

    return {
      provider: DataSourceProvider.AMAZON_KDP,
      providerBookId: asin,
      asin,
      title: title || rawTitle,
      subtitle,
      author,
      authors,
      category,
      subcategory,
      description,
      language,
      price,
      currency,
      rating: rating !== null ? Number(rating) : null,
      reviewCount: reviewCount !== null ? Number(reviewCount) : null,
      publicationDate,
      format,
      publisher,
      coverImage,
      sourceUrl,
      collectedAt: new Date().toISOString(),
      keywords,
      salesRank,
    };
  }

  private extractSubtitle(title: string): string | null {
    const colonIndex = title.indexOf(': ');
    if (colonIndex > 0 && colonIndex < title.length - 2) {
      const after = title.slice(colonIndex + 2);
      if (after.length > 3) {
        return after;
      }
    }
    return null;
  }

  private extractAuthors(item: AmazonItem): string[] {
    const contributors = item.ItemInfo?.ByLineInfo?.Contributors ?? [];
    const authors = contributors
      .filter(
        (c) =>
          c.RoleType === 'authors' ||
          c.Role?.toLowerCase() === 'author' ||
          c.Role?.toLowerCase() === 'by',
      )
      .map((c) => c.Name ?? '')
      .filter((name) => name.length > 0);

    if (authors.length === 0) {
      return contributors.map((c) => c.Name ?? '').filter((n) => n.length > 0);
    }

    return authors;
  }

  private extractPublisher(item: AmazonItem): string | null {
    return (
      item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue ??
      item.ItemInfo?.ByLineInfo?.Manufacturer?.DisplayValue ??
      item.ItemInfo?.ManufactureInfo?.Model?.DisplayValue ??
      null
    );
  }

  private extractLanguage(item: AmazonItem): string | null {
    const languages = item.ItemInfo?.ContentInfo?.Languages?.DisplayValues ?? [];
    const primary = languages.find((l) => l.Type === 'Published') ?? languages[0];
    return primary?.DisplayValue ?? null;
  }

  private extractPublicationDate(item: AmazonItem): string | null {
    return (
      item.ItemInfo?.ContentInfo?.PublicationDate?.DisplayValue ??
      item.ItemInfo?.ProductInfo?.ReleaseDate?.DisplayValue ??
      null
    );
  }

  private extractPrice(item: AmazonItem): number | null {
    const listing = item.Offers?.Listings?.[0]?.Price?.Amount;
    if (listing !== undefined) return Number(listing);
    const lowest = item.Offers?.Summaries?.[0]?.LowestPrice?.Amount;
    if (lowest !== undefined) return Number(lowest);
    return null;
  }

  private extractCurrency(item: AmazonItem): string | null {
    return (
      item.Offers?.Listings?.[0]?.Price?.Currency ??
      item.Offers?.Summaries?.[0]?.LowestPrice?.Currency ??
      null
    );
  }

  private extractDescription(item: AmazonItem): string | null {
    const features = item.ItemInfo?.Features?.DisplayValues ?? [];
    return features.length > 0 ? features.join(' ') : null;
  }

  private extractKeywords(item: AmazonItem): string[] {
    const keywords: string[] = [];

    if (item.ItemInfo?.Classifications?.ProductGroup?.DisplayValue) {
      keywords.push(item.ItemInfo.Classifications.ProductGroup.DisplayValue);
    }
    if (item.ItemInfo?.Classifications?.Binding?.DisplayValue) {
      keywords.push(item.ItemInfo.Classifications.Binding.DisplayValue);
    }

    const isbns = item.ItemInfo?.ExternalIds?.ISBNs?.DisplayValues ?? [];
    keywords.push(...isbns);

    return [...new Set(keywords)];
  }

  private extractCategories(item: AmazonItem): {
    category: string | null;
    subcategory: string | null;
  } {
    const nodes = item.BrowseNodeInfo?.BrowseNodes ?? [];

    if (nodes.length === 0) {
      return { category: null, subcategory: null };
    }

    const directNode = nodes[0];
    const rootNode = this.findRootNode(directNode);

    const category = rootNode?.IsRoot
      ? directNode?.DisplayName ?? null
      : rootNode?.DisplayName ?? directNode?.DisplayName ?? null;

    const subcategory =
      rootNode && directNode && rootNode.Id !== directNode.Id
        ? directNode.DisplayName ?? null
        : null;

    return { category, subcategory };
  }

  private findRootNode(node: AmazonBrowseNode | undefined): AmazonBrowseNode | undefined {
    if (!node) return undefined;
    if (node.IsRoot || !node.Ancestor) return node;
    return this.findRootNode(node.Ancestor);
  }
}
