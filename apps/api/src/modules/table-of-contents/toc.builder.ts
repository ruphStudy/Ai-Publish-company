import { Injectable } from '@nestjs/common';
import { TableOfContentsItem } from './entities/table-of-contents-item.entity';
import { PaginationEngine } from './pagination.engine';

@Injectable()
export class TOCBuilder {
  constructor(private readonly paginationEngine: PaginationEngine) {}

  build(contents: Record<string, unknown>[]): {
    navigationTree: TableOfContentsItem[];
    tocItems: TableOfContentsItem[];
    totalParts: number;
    totalChapters: number;
    totalSections: number;
    estimatedPages: number;
    estimatedReadingTime: number;
  } {
    let currentPage = 1;
    let order = 1;
    let totalSections = 0;
    let totalReadingTime = 0;

    const navigationTree = contents
      .sort(
        (left, right) =>
          Number(left.chapterNumber) - Number(right.chapterNumber),
      )
      .map((content) => {
        const chapterNumber = Number(content.chapterNumber);
        const chapterId = `chapter-${chapterNumber}`;
        const chapterContent = content.chapterContent as Record<string, unknown>;
        const sections = Array.isArray(chapterContent?.sections)
          ? chapterContent.sections
          : [];
        const chapterPage = currentPage;
        const chapterChildren: TableOfContentsItem[] = sections.map(
          (section, sectionIndex) => {
            const sectionData = section as Record<string, unknown>;
            const sectionNumber = String(
              sectionData.sectionNumber ?? `${chapterNumber}.${sectionIndex + 1}`,
            );
            const sectionPage = currentPage;
            const subsections = Array.isArray(sectionData.subsections)
              ? sectionData.subsections
              : [];

            const children: TableOfContentsItem[] = subsections.map(
              (subsection, subsectionIndex) => {
                const subsectionData = subsection as Record<string, unknown>;
                const subsectionContent = String(subsectionData.content ?? '');
                const item: TableOfContentsItem = {
                  level: 3,
                  number: String(
                    subsectionData.sectionNumber ??
                      `${sectionNumber}.${subsectionIndex + 1}`,
                  ),
                  title: String(
                    subsectionData.title ??
                      `Subsection ${subsectionIndex + 1}`,
                  ),
                  parentId: `section-${sectionNumber}`,
                  pageNumber: currentPage,
                  order: order++,
                  children: [],
                  anchorId: `section-${String(
                    subsectionData.sectionNumber ??
                      `${sectionNumber}-${subsectionIndex + 1}`,
                  ).replace(/\./g, '-')}`,
                };

                currentPage = this.paginationEngine.nextPage(
                  currentPage,
                  Number(subsectionData.wordCount) ||
                    subsectionContent.split(/\s+/).filter(Boolean).length,
                );

                return item;
              },
            );

            const item: TableOfContentsItem = {
              level: 2,
              number: sectionNumber,
              title: String(sectionData.title ?? `Section ${sectionIndex + 1}`),
              parentId: chapterId,
              pageNumber: sectionPage,
              order: order++,
              children,
              anchorId: `section-${sectionNumber.replace(/\./g, '-')}`,
            };

            totalSections += 1;
            currentPage = this.paginationEngine.nextPage(
              currentPage,
              Number(sectionData.wordCount) ||
                String(sectionData.content ?? '')
                  .split(/\s+/)
                  .filter(Boolean).length,
            );

            return item;
          },
        );

        totalReadingTime += Number(content.estimatedReadingTime ?? 1);

        const chapterItem: TableOfContentsItem = {
          level: 1,
          number: String(chapterNumber),
          title: String(content.chapterTitle),
          pageNumber: chapterPage,
          order: order++,
          children: chapterChildren,
          anchorId: chapterId,
        };

        currentPage = this.paginationEngine.nextPage(
          currentPage,
          Number(content.generatedWordCount ?? 0),
        );

        return chapterItem;
      });

    const tocItems = this.flatten(navigationTree);

    return {
      navigationTree,
      tocItems,
      totalParts: 0,
      totalChapters: navigationTree.length,
      totalSections,
      estimatedPages: Math.max(1, currentPage - 1),
      estimatedReadingTime: Math.max(1, totalReadingTime),
    };
  }

  private flatten(items: TableOfContentsItem[]): TableOfContentsItem[] {
    return items.flatMap((item) => [item, ...this.flatten(item.children ?? [])]);
  }
}