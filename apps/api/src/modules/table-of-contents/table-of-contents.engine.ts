import { Injectable } from '@nestjs/common';
import { NavigationBuilder } from './navigation.builder';
import { TOCBuilder } from './toc.builder';

@Injectable()
export class TableOfContentsEngine {
  constructor(
    private readonly tocBuilder: TOCBuilder,
    private readonly navigationBuilder: NavigationBuilder,
  ) {}

  generate(contents: Record<string, unknown>[]) {
    const generated = this.tocBuilder.build(contents);

    return {
      ...generated,
      pdfBookmarks: this.navigationBuilder.buildPdfBookmarks(
        generated.tocItems,
      ),
      epubNavigation: this.navigationBuilder.buildEpubNavigation(
        generated.navigationTree,
      ),
      docxNavigation: this.navigationBuilder.buildDocxNavigation(
        generated.navigationTree,
      ),
      confidenceScore: 95,
    };
  }
}