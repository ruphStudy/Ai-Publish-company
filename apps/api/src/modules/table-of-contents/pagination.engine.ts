import { Injectable } from '@nestjs/common';
import { tableOfContentsConfig } from './config/table-of-contents.config';

@Injectable()
export class PaginationEngine {
  calculatePages(wordCount: number): number {
    return Math.max(
      1,
      Math.ceil(wordCount / tableOfContentsConfig.wordsPerPage),
    );
  }

  nextPage(currentPage: number, wordCount: number): number {
    return currentPage + this.calculatePages(wordCount);
  }
}