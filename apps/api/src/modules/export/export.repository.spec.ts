import { ExportRepository } from './export.repository';

describe('ExportRepository soft delete', () => {
  it('records deletion metadata', async () => {
    const exec = jest.fn().mockResolvedValue({ isDeleted: true });
    const model = { findByIdAndUpdate: jest.fn().mockReturnValue({ exec }) };
    const repository = new ExportRepository(model as never);
    await repository.softDelete('507f1f77bcf86cd799439011', 'user-1');
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      expect.objectContaining({ isDeleted: true, deletedBy: 'user-1' }),
      { new: true },
    );
  });
});
