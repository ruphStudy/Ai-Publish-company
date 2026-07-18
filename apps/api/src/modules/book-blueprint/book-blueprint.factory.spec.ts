import { BookBlueprintFactory } from './book-blueprint.factory';

describe('BookBlueprintFactory', () => {
  it('creates prefixed unique identifiers', () => {
    const factory = new BookBlueprintFactory({
      identifierPrefix: 'BP', blueprintVersion: '1',
      defaultEstimatedWordCount: 30000, defaultEstimatedChapterCount: 10,
      maximumIdentifierGenerationAttempts: 3,
    });
    expect(factory.createBlueprintId()).toMatch(/^BP-\d{8}-[A-F0-9]{8}$/);
  });
});
