import { TruncatePipeline } from './truncate.pipe';

describe('TruncatePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipeline();
    expect(pipe).toBeTruthy();
  });
});
