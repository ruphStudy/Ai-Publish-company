import { ChapterValidator } from './chapter.validator';

describe('ChapterValidator', () => {
  it('selects the requested chapter from an approved outline', () => {
    const chapter = new ChapterValidator().validateChapterOutline(
      { status: 'APPROVED', chapters: [{ chapterNumber: 2, title: 'Two' }] }, 2);
    expect(chapter.title).toBe('Two');
  });
});
