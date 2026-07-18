import { MockAiProvider } from '../../core/ai/testing/mock-ai.provider';

describe('AI writing provider boundary', () => {
  it('uses a deterministic provider without network access', async () => {
    const provider = new MockAiProvider('draft');
    const response = await provider.generate({
      prompt: 'write', model: 'mock', apiKey: 'none', baseUrl: 'local', timeoutMs: 1,
    });
    expect(response.content).toBe('draft');
    expect(provider.requests).toHaveLength(1);
  });
});
