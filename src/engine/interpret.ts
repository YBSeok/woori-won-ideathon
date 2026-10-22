// 실서비스에서는 내부망 LLM이 이 스키마로 출력하고, 같은 validateIntent 검증을 거친다.
// 이 파일은 데모용 결정론적 해석기다. 외부 API를 호출하지 않는다.

import type { PurposeId } from '../mock/chatScripts';
import type { GuardResult } from './guard';

export type Purpose = 'TUITION' | 'MOVING' | 'HOUSING' | 'RETIREMENT' | 'SPARE' | 'UNKNOWN';

export type IntentItem = {
  purpose: Purpose;
  amount?: number;
  amountRatio?: number;
  timeText: string;
  dateRange?: { from: string; to: string };
  date?: string;
  certainty: 'CONFIRMED' | 'NEEDS_CONFIRM';
};

export type InterpretResult = {
  items: IntentItem[];
  totalAmount?: number;
  guard: GuardResult;
};

export const EXAMPLE_UTTERANCES = [
  '3천만 원 중에 반은 내년 5월 아이 학비고, 나머지는 이사 가서 내년 봄쯤 쓸 것 같아요',
  '이사 가서 내년 봄쯤 쓸 것 같아요',
  '딱히 정한 건 없고 몇 년 묵혀 둘 돈이에요',
] as const;

export const INTENT_PURPOSE_LABEL: Record<Purpose, string> = {
  TUITION: '학비',
  MOVING: '이사',
  HOUSING: '내 집 마련',
  RETIREMENT: '노후',
  SPARE: '여유자금',
  UNKNOWN: '미정',
};

export function toPurposeId(purpose: Purpose): PurposeId | undefined {
  if (purpose === 'TUITION') return 'TUITION';
  if (purpose === 'MOVING') return 'JEONSE';
  if (purpose === 'HOUSING') return 'HOUSING';
  if (purpose === 'RETIREMENT') return 'RETIREMENT';
  if (purpose === 'SPARE') return 'SPARE';
  return undefined;
}

function parseMoney(text: string): number | undefined {
  const cheon = text.match(/(\d+)\s*천만\s*원/);
  if (cheon) return Number(cheon[1]) * 10_000_000;
  const baek = text.match(/(\d+)\s*백만\s*원/);
  if (baek) return Number(baek[1]) * 1_000_000;
  const man = text.match(/(\d+)\s*만\s*원/);
  if (man) return Number(man[1]) * 10_000;
  return undefined;
}

function detectPurpose(text: string): Purpose | null {
  if (/학비|등록금/.test(text)) return 'TUITION';
  if (/이사|전세|보증금/.test(text)) return 'MOVING';
  if (/청약|내 집/.test(text)) return 'HOUSING';
  if (/노후|은퇴/.test(text)) return 'RETIREMENT';
  if (/여유|묵혀/.test(text)) return 'SPARE';
  return null;
}

function detectTime(text: string, today: string): Pick<IntentItem, 'timeText' | 'dateRange' | 'date' | 'certainty'> {
  const year = Number(today.slice(0, 4)) + (/내년/.test(text) ? 1 : 0);
  if (/봄쯤/.test(text)) {
    return {
      timeText: /내년/.test(text) ? '내년 봄쯤' : '봄쯤',
      dateRange: { from: `${year}-03-01`, to: `${year}-05-31` },
      certainty: 'NEEDS_CONFIRM',
    };
  }
  if (/상반기/.test(text)) {
    return {
      timeText: '상반기',
      dateRange: { from: `${year}-01-01`, to: `${year}-06-30` },
      certainty: 'NEEDS_CONFIRM',
    };
  }
  if (/연말/.test(text)) {
    return {
      timeText: '연말',
      dateRange: { from: `${year}-12-01`, to: `${year}-12-31` },
      certainty: 'NEEDS_CONFIRM',
    };
  }
  if (/몇 년/.test(text)) {
    return { timeText: '몇 년', certainty: 'NEEDS_CONFIRM' };
  }
  const month = text.match(/(\d{1,2})\s*월/);
  if (month) {
    const m = Number(month[1]);
    const mm = String(m).padStart(2, '0');
    return {
      timeText: /내년/.test(text) ? `내년 ${m}월` : `${m}월`,
      date: `${year}-${mm}-20`,
      certainty: 'CONFIRMED',
    };
  }
  return { timeText: '시기 미정', certainty: 'NEEDS_CONFIRM' };
}

export function mockInterpret(utterance: string, demoToday: string): InterpretResult {
  const totalAmount = parseMoney(utterance);
  const parts = utterance.includes('나머지는') ? utterance.split('나머지는') : [utterance];
  const half = /반은|절반/.test(utterance) && parts.length > 1;
  const items: IntentItem[] = [];
  for (const part of parts) {
    const purpose = detectPurpose(part);
    if (!purpose) continue;
    const time = detectTime(part, demoToday);
    const amount = half && totalAmount ? totalAmount / 2 : parts.length === 1 ? undefined : undefined;
    items.push({
      purpose,
      amount,
      amountRatio: half ? 0.5 : undefined,
      timeText: time.timeText,
      dateRange: time.dateRange,
      date: time.date,
      certainty: time.certainty,
    });
  }
  return { items, totalAmount, guard: { ok: true } };
}

export function validateIntent(
  result: InterpretResult,
  principal: number,
): { result: InterpretResult; fixes: string[] } {
  const items = result.items.map((item) => ({ ...item }));
  const fixes: string[] = [];
  const known = items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const incomplete = items.length > 0 && (items.some((item) => item.amount === undefined) || known !== principal);
  if (incomplete) {
    fixes.push('금액 합계가 만기 원금과 달라 확인이 필요해요.');
    for (const item of items) item.certainty = 'NEEDS_CONFIRM';
  }
  return { result: { ...result, items }, fixes };
}
