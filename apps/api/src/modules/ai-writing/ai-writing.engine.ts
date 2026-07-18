import { Injectable } from '@nestjs/common';
import { ChapterContent } from './entities/chapter-content.entity';

@Injectable()
export class AIWritingEngine {
  createChapterContent(
    chapter: Record<string, unknown>,
    markdown: string,
  ): ChapterContent {
    const sections = Array.isArray(chapter.sections) ? chapter.sections : [];

    return {
      chapterNumber: Number(chapter.chapterNumber),
      chapterTitle: String(chapter.chapterTitle),
      introduction: this.extractPart(markdown, 'Introduction'),
      conclusion: this.extractPart(markdown, 'Conclusion'),
      sections: sections.map((section, index) => {
        const value = section as Record<string, unknown>;
        const title = String(value.title ?? `Section ${index + 1}`);
        const content = this.extractPart(markdown, title);

        return {
          sectionNumber: String(value.sectionNumber ?? `${index + 1}`),
          title,
          content,
          wordCount: this.wordCount(content),
          order: Number(value.order ?? index + 1),
          subsections: Array.isArray(value.subsections)
            ? value.subsections.map((subsection, subsectionIndex) => {
                const item = subsection as Record<string, unknown>;
                const subsectionTitle = String(
                  item.title ?? `Subsection ${subsectionIndex + 1}`,
                );
                const subsectionContent = this.extractPart(
                  markdown,
                  subsectionTitle,
                );

                return {
                  sectionNumber: String(
                    item.sectionNumber ?? `${index + 1}.${subsectionIndex + 1}`,
                  ),
                  title: subsectionTitle,
                  content: subsectionContent,
                  wordCount: this.wordCount(subsectionContent),
                  order: Number(item.order ?? subsectionIndex + 1),
                };
              })
            : [],
        };
      }),
    };
  }

  private extractPart(markdown: string, title: string): string {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(
      `(?:^|\\n)#{1,6}\\s+${escapedTitle}\\s*\\n([\\s\\S]*?)(?=\\n#{1,6}\\s+|$)`,
      'i',
    );

    const match = markdown.match(expression);

    return match?.[1]?.trim() ?? '';
  }

  private wordCount(value: string): number {
    return value.split(/\s+/).filter(Boolean).length;
  }
}