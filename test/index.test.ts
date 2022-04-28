import * as index from '../src/index';

describe('index', () => {
  it('exports classes', async () => {
    expect(Object.keys(index).length).toBeGreaterThan(0);
  });
});
