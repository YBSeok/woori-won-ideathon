import { describe, expect, it } from 'vitest';
import { EXAMPLE_UTTERANCES, mockInterpret, validateIntent } from './interpret';
import { DEMO_TODAY } from '../mock/personas';
import { buildSplitPlan, comparePurposeSplit, holdingMonths, simpleInterest, SUPER_SHORT_RATE, EARLY_BREAK_RATE } from './split';

describe('purpose split interest', () => {
  it('matches the simple monthly interest shown for a split deposit', () => {
    const parsed = validateIntent(mockInterpret(EXAMPLE_UTTERANCES[0], DEMO_TODAY), 30_000_000).result;
    const items = parsed.items.map((item, index) =>
      index === 1 ? { ...item, date: '2027-03-31', certainty: 'CONFIRMED' as const } : item,
    );
    const legs = buildSplitPlan(items);
    expect(legs).toHaveLength(2);
    const compared = comparePurposeSplit(legs ?? [], 30_000_000, '2026-11-21');
    const tuitionMonths = holdingMonths('2026-11-21', '2027-05-20');
    const movingMonths = holdingMonths('2026-11-21', '2027-03-31');
    expect(compared.splitInterest).toBe(
      simpleInterest(15_000_000, SUPER_SHORT_RATE, tuitionMonths) + simpleInterest(15_000_000, SUPER_SHORT_RATE, movingMonths),
    );
    expect(compared.earlyInterest).toBe(simpleInterest(30_000_000, EARLY_BREAK_RATE, tuitionMonths));
  });
});
