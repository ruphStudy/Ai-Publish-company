import { ExportEngine } from './export.engine';

describe('ExportEngine', () => {
  it('assembles chapters in manuscript order', () => {
    const manuscript = new ExportEngine().assemble(
      { title: 'Book', copyrightText: '©', status: 'APPROVED' },
      { status: 'APPROVED', tocItems: [] },
      [
        { chapterNumber: 2, chapterTitle: 'B', markdownContent: 'b', htmlContent: '<p>b</p>' },
        { chapterNumber: 1, chapterTitle: 'A', markdownContent: 'a', htmlContent: '<p>a</p>' },
      ],
    );
    expect(manuscript.chapters.map((chapter) => chapter.chapterNumber)).toEqual([1, 2]);
  });
});
