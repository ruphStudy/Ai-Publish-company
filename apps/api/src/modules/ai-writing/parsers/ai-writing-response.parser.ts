import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AIWritingResponseParser {
  parseMarkdown(content: string): string {
    const markdown = content.trim();

    if (!markdown) {
      throw new BadRequestException('AI provider returned empty content');
    }

    return markdown;
  }

  toPlainText(markdown: string): string {
    return markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/!\[[^\]]*]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  toHtml(markdown: string): string {
    return markdown
      .split('\n')
      .map((line) => {
        if (line.startsWith('### ')) {
          return `<h3>${this.escape(line.slice(4))}</h3>`;
        }

        if (line.startsWith('## ')) {
          return `<h2>${this.escape(line.slice(3))}</h2>`;
        }

        if (line.startsWith('# ')) {
          return `<h1>${this.escape(line.slice(2))}</h1>`;
        }

        if (!line.trim()) {
          return '';
        }

        return `<p>${this.escape(line)}</p>`;
      })
      .join('\n');
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}