import type { Model } from 'mongoose';
import type { ContentImprovement } from './entities/content-improvement.entity';
import { ContentImprovementRepository } from './content-improvement.repository';

describe('ContentImprovementRepository', () => {
  it('filters deleted records and paginates', async () => {
    const findExec = jest.fn().mockResolvedValue([]);
    const find = jest.fn().mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => ({ exec: findExec }) }) }) });
    const countExec = jest.fn().mockResolvedValue(0);
    const model = { find, countDocuments: jest.fn().mockReturnValue({ exec: countExec }) } as unknown as Model<ContentImprovement>;
    const result = await new ContentImprovementRepository(model).paginate({ projectId: 'project' }, 2, 10);
    expect(find).toHaveBeenCalledWith({ projectId: 'project', isDeleted: false });
    expect(result).toEqual({ items: [], total: 0, page: 2, limit: 10, totalPages: 0 });
  });
});
