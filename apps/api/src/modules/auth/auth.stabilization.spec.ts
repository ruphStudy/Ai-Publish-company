import { IS_PUBLIC_KEY, Public } from './decorators/public.decorator';

describe('authentication metadata', () => {
  it('marks public handlers explicitly', () => {
    class Controller { @Public() handler(): void {} }
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, Controller.prototype.handler)).toBe(true);
  });
});
