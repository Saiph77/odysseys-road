import { describe, expect, it } from 'vitest';
import { clipFromSeconds } from '../../src/config/assets.manifest';

describe('clipFromSeconds', () => {
  it('matches AGENTS frameIndex formula', () => {
    expect(clipFromSeconds(5.4, 5.4, 11.0)).toEqual({ from: 1, to: 135 });
  });
});
