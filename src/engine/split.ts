import { daysUntil } from '../mock/personas';
import type { IntentItem, Purpose } from './interpret';
import { INTENT_PURPOSE_LABEL } from './interpret';

export const SUPER_SHORT_RATE = 0.03;
export const EARLY_BREAK_RATE = 0.005;
export const REDEPOSIT_YEAR_RATE = 0.031;
export const SPLIT_PRODUCT_ID = 'purpose-split';

export type SplitLeg = {
  purpose: Purpose;
  purposeLabel: string;
  amount: number;
  date: string;
  productId: 'super-deposit';
  productName: string;
  annualRate: number;
};

export function holdingMonths(from: string, to: string): number {
  const days = Math.max(0, daysUntil(to, from));
  return Math.max(1, Math.round(days / 30));
}

export function simpleInterest(principal: number, annualRate: number, months: number): number {
  return Math.round((principal * annualRate * months) / 12);
}

export function buildSplitPlan(items: IntentItem[]): SplitLeg[] | null {
  const ready = items.filter(
    (item): item is IntentItem & { amount: number; date: string } =>
      item.purpose !== 'UNKNOWN' && typeof item.amount === 'number' && Boolean(item.date) && item.certainty === 'CONFIRMED',
  );
  if (ready.length < 2) return null;
  return ready.map((item) => ({
    purpose: item.purpose,
    purposeLabel: INTENT_PURPOSE_LABEL[item.purpose],
    amount: item.amount,
    date: item.date,
    productId: 'super-deposit',
    productName: '우리 SUPER 정기예금',
    annualRate: SUPER_SHORT_RATE,
  }));
}

export function comparePurposeSplit(legs: SplitLeg[], principal: number, startDate: string) {
  const tuition = legs.find((leg) => leg.purpose === 'TUITION');
  const breakDate = tuition?.date ?? [...legs].sort((a, b) => a.date.localeCompare(b.date))[0]?.date ?? startDate;
  const earlyMonths = holdingMonths(startDate, breakDate);
  const earlyInterest = simpleInterest(principal, EARLY_BREAK_RATE, earlyMonths);
  const splitInterest = legs.reduce(
    (sum, leg) => sum + simpleInterest(leg.amount, leg.annualRate, holdingMonths(startDate, leg.date)),
    0,
  );
  return { earlyInterest, splitInterest, earlyMonths, breakDate };
}
