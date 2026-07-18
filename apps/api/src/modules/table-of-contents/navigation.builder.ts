import { Injectable } from '@nestjs/common';
import { TableOfContentsItem } from './entities/table-of-contents-item.entity';

@Injectable()
export class NavigationBuilder {
  buildPdfBookmarks(items: TableOfContentsItem[]): PdfBookmark[] {
    return items.map((item) => ({
      title: item.title,
      level: item.level,
      pageNumber: item.pageNumber,
      anchorId: item.anchorId,
    }));
  }

  buildEpubNavigation(items: TableOfContentsItem[]): EpubNavigationItem[] {
    return items.map((item) => ({
      label: item.title,
      href: `#${item.anchorId}`,
      level: item.level,
      children: this.buildEpubNavigation(item.children ?? []),
    }));
  }

  buildDocxNavigation(items: TableOfContentsItem[]): DocxNavigationItem[] {
    return items.map((item) => ({
      headingLevel: item.level,
      text: item.title,
      anchorId: item.anchorId,
      children: this.buildDocxNavigation(item.children ?? []),
    }));
  }
}

export interface PdfBookmark {
  title: string;
  level: number;
  pageNumber?: number;
  anchorId: string;
}

export interface EpubNavigationItem {
  label: string;
  href: string;
  level: number;
  children: EpubNavigationItem[];
}

export interface DocxNavigationItem {
  headingLevel: number;
  text: string;
  anchorId: string;
  children: DocxNavigationItem[];
}
