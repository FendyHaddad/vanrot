import { describe, expect, it } from 'vitest';
import { definePipe, enumPipe } from '../src/index.js';

enum ClaimStatus {
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  PendingReview = 'PENDING_REVIEW',
}

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('custom pipes', () => {
  it('defines sync pipes that receive context and args', () => {
    const pipe = definePipe('moneyLabel', (value, ctx, suffix) => `${ctx.currency} ${value} ${suffix}`);

    expect(pipe.kind).toBe('pipe');
    expect(pipe.name).toBe('moneyLabel');
    expect(pipe.handler(25, context, 'paid')).toBe('USD 25 paid');
  });

  it('defines enum label pipes', () => {
    const pipe = enumPipe('claimStatus', ClaimStatus, {
      [ClaimStatus.Approved]: 'Approved',
      [ClaimStatus.Rejected]: 'Rejected',
      [ClaimStatus.PendingReview]: 'Pending review',
      fallback: 'Unknown',
    });

    expect(pipe.handler(ClaimStatus.Approved, context)).toBe('Approved');
    expect(pipe.handler('VOID', context)).toBe('Unknown');
  });
});
