import { OutlineValidator } from './outline.validator';
import { BookBlueprintStatus } from '../book-blueprint/entities/book-blueprint.entity';

describe('OutlineValidator', () => {
  it('accepts a complete approved blueprint', () => {
    expect(() => new OutlineValidator().validateBlueprint({
      status: BookBlueprintStatus.APPROVED, projectId: 'p', title: 'Book',
    })).not.toThrow();
  });
});
