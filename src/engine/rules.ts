import type { PurposeId, TimingId } from '../mock/chatScripts';
import { PURPOSE_LABEL, TIMING_LABEL } from '../mock/chatScripts';
import { DEMO_TODAY, type Persona } from '../mock/personas';
import { INVEST_ID, PRODUCTS, REDEPOSIT_ID, getProduct, type CatalogProduct } from '../mock/products';
import { formatKoreanDate } from '../lib/format';

export type Horizon = 'SHORT' | 'MID' | 'LONG' | 'UNKNOWN';

export type RuleId =
  | 'RULE_DEFAULT_REDEPOSIT'
  | 'RULE_SHORT_TERM_NO_INVEST'
  | 'RULE_SUITABILITY_ONLY'
  | 'RULE_ELDERLY_HANDOFF'
  | 'RULE_QUIZ_FAIL_HANDOFF'
  | 'RULE_COOLING_OFF'
  | 'RULE_SPLIT_BY_PURPOSE'
  | 'RULE_HIGH_BALANCE_PB';

export const ELDERLY_AGE = 65;
export const QUIZ_FAIL_LIMIT = 2;
export const DIAGNOSIS_VALID_DAYS = 365;
export const HIGH_BALANCE_THRESHOLD = 100_000_000;

export const RULE_COPY: Record<RuleId, string> = {
  RULE_DEFAULT_REDEPOSIT: '재예치는 항상 첫 번째 선택지이자 기본 선택이에요.',
  RULE_SHORT_TERM_NO_INVEST: '1년 안에 쓸 돈이라 투자 상품은 제외했어요.',
  RULE_SUITABILITY_ONLY: '투자성향이 맞지 않거나 진단이 없으면 투자 상품은 보여 드리지 않아요.',
  RULE_ELDERLY_HANDOFF: '만 65세 이상이 투자 상품을 물으면 영업점 PB·상담원에게 연결해요.',
  RULE_QUIZ_FAIL_HANDOFF: '같은 이해도 문항을 2번 틀리면 사람 연결로 바꿔요.',
  RULE_COOLING_OFF: '투자성 상품은 숙려 다음 날 최종 승인해요. 답이 없으면 재예치로 가요.',
  RULE_SPLIT_BY_PURPOSE: '목적이 둘 이상이면 쓰는 날에 맞춰 예금을 나눠요.',
  RULE_HIGH_BALANCE_PB: '원금이 1억 원 이상이면 Two Chairs PB 상담을 먼저 안내해요.',
};

export const LLM_SCOPE = {
  does: ['발화 해석', '문장 생성'],
  doesNot: ['상품 결정', '수치 생성', '거래 실행'],
} as const;

export const HORIZON_LABEL: Record<Horizon, string> = {
  SHORT: '1년 안',
  MID: '1~3년',
  LONG: '3년 이상',
  UNKNOWN: '미정',
};

export function monthsUntil(useDate: string, today = DEMO_TODAY): number {
  const [y1, m1, d1] = today.split('-').map(Number);
  const [y2, m2, d2] = useDate.split('-').map(Number);
  let months = (y2 - y1) * 12 + (m2 - m1);
  if (d2 < d1) months -= 1;
  return months;
}

export function horizonFromDate(useDate: string, today = DEMO_TODAY): Horizon {
  const months = monthsUntil(useDate, today);
  if (months < 12) return 'SHORT';
  if (months <= 36) return 'MID';
  return 'LONG';
}

export type Answers = {
  timing?: TimingId;
  purpose?: PurposeId;
  useDate?: string;
};

export type Option = {
  productId: string;
  name: string;
  summary: string;
  rateText: string;
  annualRate: number | null;
  isExample: true;
  principalGuaranteed: boolean;
  riskLabel: string;
  riskTone: 'safe' | 'caution' | 'danger';
  kind: CatalogProduct['kind'];
  worstLossRate?: number;
  feeRate?: number;
  reasons: string[];
  procedure: string;
  guide: string;
  proceedLabel: string;
};

export type ExcludedProduct = {
  productId: string;
  name: string;
  reason: string;
};

const INVEST_SUITABLE: Persona['riskProfile'][] = ['안정추구형'];

export function estimateHorizon(answers: Answers): { horizon: Horizon; useDate?: string } {
  const useDate = answers.useDate && answers.useDate !== 'unknown' ? answers.useDate : undefined;
  if (useDate) return { horizon: horizonFromDate(useDate), useDate };
  if (answers.timing === 'WITHIN_6M') return { horizon: 'SHORT' };
  if (answers.timing === 'Y1_3') return { horizon: 'MID' };
  if (answers.timing === 'OVER_3Y') return { horizon: 'LONG' };
  return { horizon: 'UNKNOWN' };
}

export function isInvestSuitable(persona: Pick<Persona, 'riskProfile'>): boolean {
  return INVEST_SUITABLE.includes(persona.riskProfile);
}

function horizonLabel(horizon: Horizon, useDate?: string): string {
  if (horizon === 'SHORT') {
    return useDate
      ? `자금 기간이 짧고, 사용 예정일이 ${formatKoreanDate(useDate)}이에요.`
      : '1년 안에 쓸 돈이에요.';
  }
  if (horizon === 'MID') return '1년에서 3년 사이에 쓸 돈이에요.';
  if (horizon === 'LONG') return '3년 이상 쓰지 않아도 되는 돈이에요.';
  return '자금 기간이 아직 정해지지 않았어요.';
}

function toOption(product: CatalogProduct, reasons: string[], procedure: string, summary?: string): Option {
  return {
    productId: product.id,
    name: product.name,
    summary: summary ?? product.summary,
    rateText: product.rateText,
    annualRate: product.annualRate,
    isExample: true,
    principalGuaranteed: product.principalGuaranteed,
    riskLabel: product.riskLabel,
    riskTone: product.riskTone,
    kind: product.kind,
    worstLossRate: product.worstLossRate,
    feeRate: product.feeRate,
    reasons,
    procedure,
    guide: '',
    proceedLabel: '이 상품으로 진행',
  };
}

type ChoiceContext = {
  purpose?: PurposeId;
  split?: boolean;
};

function situationLine(name: string, horizon: Horizon, useDate?: string, purpose?: PurposeId): string {
  const date = useDate ? formatKoreanDate(useDate) : '';
  if (purpose === 'JEONSE') {
    if (horizon === 'SHORT' && date) return `${name}님, 1년 안에 전세·이사 자금이 필요하고 ${date}에 전세 잔금을 쓰신다고 하셨어요.`;
    if (horizon === 'SHORT') return `${name}님, 1년 안에 전세·이사 자금이 필요하다고 하셨어요.`;
    if (date) return `${name}님, ${date}에 전세 잔금을 쓰신다고 하셨어요.`;
    return `${name}님, 전세·이사 자금으로 쓰실 계획이라고 하셨어요.`;
  }
  if (purpose === 'TUITION') {
    if (horizon === 'SHORT' && date) return `${name}님, 1년 안에 학비가 필요하고 ${date}에 그 학비를 쓰신다고 하셨어요.`;
    if (horizon === 'SHORT') return `${name}님, 1년 안에 학비가 필요하다고 하셨어요.`;
    if (date) return `${name}님, ${date}에 학비를 쓰신다고 하셨어요.`;
    return `${name}님, 학비로 쓰실 계획이라고 하셨어요.`;
  }
  if (purpose === 'SPARE') {
    if (horizon === 'LONG') return `${name}님, 3년 이상 쓰지 않아도 되는 여유자금이라고 하셨어요.`;
    if (horizon === 'MID') return `${name}님, 1년에서 3년 정도는 급하지 않은 여유자금이라고 하셨어요.`;
    if (horizon === 'SHORT') return `${name}님, 여유자금이지만 1년 안에는 쓰실 수도 있다고 하셨어요.`;
    return `${name}님, 여유자금으로 생각하시지만 언제 쓸지는 아직 정하지 않으셨어요.`;
  }
  if (purpose === 'RETIREMENT') {
    if (horizon === 'LONG') return `${name}님, 노후 자금으로 3년 이상 두셔도 된다고 하셨어요.`;
    if (horizon === 'MID') return `${name}님, 노후를 위해 1년에서 3년은 두실 수 있다고 하셨어요.`;
    if (horizon === 'SHORT') return `${name}님, 노후 자금이지만 1년 안에 필요하실 수도 있다고 하셨어요.`;
    return `${name}님, 노후 자금으로 생각하시지만 시기는 아직 정하지 않으셨어요.`;
  }
  if (purpose === 'HOUSING') {
    if (date) return `${name}님, 내 집 마련 자금으로 ${date}에 쓰신다고 하셨어요.`;
    return `${name}님, 내 집 마련 자금으로 쓰실 계획이라고 하셨어요.`;
  }
  if (horizon === 'SHORT') return `${name}님, 이 돈을 1년 안에 쓰신다고 하셨어요.`;
  if (horizon === 'MID') return `${name}님, 이 돈을 1년에서 3년 사이에 쓰신다고 하셨어요.`;
  if (horizon === 'LONG') return `${name}님, 이 돈을 3년 이상 두셔도 된다고 하셨어요.`;
  return `${name}님, 이 돈을 언제 쓸지는 아직 정하지 않으셨어요.`;
}

function decisionLine(
  persona: Pick<Persona, 'riskProfile'>,
  horizon: Horizon,
  hasInvest: boolean,
): string {
  if (hasInvest) {
    return '오래 두셔도 되는 돈이고 투자성향이 맞아서, 재예치와 예금 옆에 투자 상품을 비교용으로만 넣었어요. 투자 상품은 오늘 가입이 끝나지 않고, 설명을 들은 뒤 하루를 더 두고 정해요. 아직 마음이 없으면 재예치를 그대로 진행하셔도 돼요.';
  }
  const depositOnly = persona.riskProfile === '안정형' || persona.riskProfile === '미진단';
  if (horizon === 'SHORT' && depositOnly) {
    return '곧 쓸 돈이라 예금만 골랐어요. 기본으로 잡혀 있는 재예치는 지금 금리와 조건을 그대로 이어 가는 선택이에요. 돈을 쓰시는 날에 만기를 맞추고 싶으면, 그 아래 예금을 고르시면 돼요.';
  }
  if (horizon === 'SHORT') {
    return '곧 쓸 돈이라 가격이 움직일 수 있는 상품은 빼 두었어요. 재예치는 지금 조건을 그대로 이어 가는 기본 선택이에요. 쓰시는 날에 만기를 맞추고 싶으면 그 아래 예금을 고르시면 돼요.';
  }
  if (horizon === 'LONG' && depositOnly) {
    return '오래 두실 수 있는 돈이지만, 성향을 보고 예금 안에서만 골랐어요. 재예치는 상품을 바꾸지 않는 선택이고, 아래 예금은 이자가 예금 안에서 다시 쌓이는 방식이에요. 바꾸실 필요가 없으면 재예치로 진행하시면 돼요.';
  }
  if (horizon === 'UNKNOWN') {
    return '언제 쓸지 정해지기 전에는 조건을 바꾸지 않는 재예치가 기본이에요. 만기를 나중에 고르고 싶으시면 그 아래 예금을 보시면 돼요.';
  }
  return '재예치는 지금 예금을 같은 조건으로 이어 가는 기본 선택이에요. 기간에 더 맞는 예금이 있으면 그 아래에 두었어요. 예금은 어느 쪽이든 다음 화면에서 금액과 금리만 확인하면 끝나요.';
}

function narrateOption(
  option: Option,
  persona: Pick<Persona, 'riskProfile'>,
  useDate: string | undefined,
  purpose?: PurposeId,
): { guide: string; proceedLabel: string } {
  const date = useDate ? formatKoreanDate(useDate) : '';
  if (option.kind === 'redeposit') {
    const keep =
      date && (purpose === 'JEONSE' || purpose === 'TUITION')
        ? `${date}까지 통장을 옮기거나 새로 가입하지 않아도, 만기일에는 같은 예금이 다시 시작돼요.`
        : '만기일이 되면 지금과 같은 조건의 정기예금이 다시 시작돼요. 상품을 새로 고르거나 서류를 더 내지 않으셔도 돼요.';
    return {
      guide: `${keep} 원금은 예금으로 남아 있고, 금리는 연 3.10%(예시)로 이어져요. 쓰는 날을 따로 맞추지 않으셔도 되면 이 선택이 가장 단순해요. 진행하시면 금액과 금리만 확인하고 끝나요.`,
      proceedLabel: '이 조건으로 재예치할게요',
    };
  }
  if (option.productId === 'super-deposit') {
    const why =
      date && purpose === 'JEONSE'
        ? `${date}에 전세 잔금을 쓰신다고 하셔서, 만기를 그날에 맞출 수 있는 예금이에요.`
        : date && purpose === 'TUITION'
          ? `${date}에 학비를 쓰신다고 하셔서, 만기를 그날에 맞출 수 있는 예금이에요.`
          : '만기일을 날짜 단위로 고를 수 있어서, 돈을 찾으시는 날과 만기를 맞추기 쉬워요.';
    return {
      guide: `${why} 중간에 해지하지 않아도 그 무렵 원금과 이자가 나오도록 기간을 정하는 방식이에요. 금리는 연 3.20%(예시)이고, 예금이라 원금이 보장돼요. 진행하시면 날짜와 금리만 확인하면 돼요.`,
      proceedLabel: date ? `${date}에 맞춰 진행할게요` : '만기일을 맞춰 진행할게요',
    };
  }
  if (option.productId === 'won-plus') {
    return {
      guide: '쓰시는 시점이 1년에서 3년 사이라고 하셔서, 시장금리가 움직일 때 그 변화를 반영하는 예금을 같이 골랐어요. 만기까지 두시는 동안 금리가 바뀌면 상품 금리에도 반영되는 구조예요. 예금이라 원금은 보장되고, 지금 보이는 금리는 연 3.05%(예시)예요. 지금 조건을 유지하고 싶으면 재예치를 고르시고, 이 예금으로 가시면 금액과 금리만 확인하면 끝나요.',
      proceedLabel: '이 예금으로 진행할게요',
    };
  }
  if (option.productId === 'duruduru') {
    return {
      guide: '3년 이상 두셔도 된다고 하셔서, 이자가 다음 이자의 밑천이 되는 회전복리 예금을 같이 제안해요. 찾는 날이 급하지 않을 때 이자가 예금 안에서 다시 굴러가는 방식이에요. 원금은 보장되고 금리는 연 3.25%(예시)예요. 상품을 바꾸기 망설여지시면 재예치가 그대로 있고, 이 예금으로 진행하면 조건 확인 한 번으로 끝나요.',
      proceedLabel: '이 예금으로 이어갈게요',
    };
  }
  return {
    guide: `여유자금으로 오래 두신다고 하시고 투자성향이 ${persona.riskProfile}이라, 예금 옆에 ${option.name}도 비교용으로 넣었어요. 이 상품은 가격이 내리면 넣은 돈보다 적어질 수 있고, 예금자보호도 되지 않아요. 그래서 오늘은 설명과 이해도 확인까지만 하고, 내일 다시 보고 최종으로 정해요. 답이 없거나 마음이 바뀌면 재예치로 돌아가요.`,
    proceedLabel: '설명부터 듣고 결정할게요',
  };
}

function depositProcedure(): string {
  return '원클릭 승인';
}

function investProcedure(): string {
  return '이해도 확인 → 다음 날 숙려 → 최종 승인';
}

export function getEligibleOptions(
  persona: Pick<Persona, 'riskProfile' | 'name'> & { principal?: number },
  horizon: Horizon,
  useDate?: string,
  context: ChoiceContext = {},
): { options: Option[]; appliedRules: RuleId[]; excluded: ExcludedProduct[]; heard: string; decision: string } {
  const appliedRules: RuleId[] = ['RULE_DEFAULT_REDEPOSIT'];
  if ((persona.principal ?? 0) >= HIGH_BALANCE_THRESHOLD) appliedRules.push('RULE_HIGH_BALANCE_PB');
  if (context.split) appliedRules.push('RULE_SPLIT_BY_PURPOSE');
  const excluded: ExcludedProduct[] = [];
  const profileLine = `투자성향은 ${persona.riskProfile}이에요.`;
  const timeLine = horizonLabel(horizon, useDate);

  const redeposit = getProduct(REDEPOSIT_ID);
  const options: Option[] = [
    toOption(
      redeposit,
      [timeLine, profileLine, RULE_COPY.RULE_DEFAULT_REDEPOSIT, '응답이 없어도 이 선택지만 실행돼요.'],
      depositProcedure(),
    ),
  ];

  const pushExcluded = (id: string, reason: string) => {
    const product = getProduct(id);
    excluded.push({ productId: id, name: product.name, reason });
  };

  const investBlocked: string[] = [];
  if (horizon === 'SHORT') {
    appliedRules.push('RULE_SHORT_TERM_NO_INVEST');
    investBlocked.push(RULE_COPY.RULE_SHORT_TERM_NO_INVEST);
  } else if (horizon === 'UNKNOWN') {
    investBlocked.push('자금 기간을 아직 몰라 투자 상품은 제외했어요.');
  }
  if (!isInvestSuitable(persona)) {
    appliedRules.push('RULE_SUITABILITY_ONLY');
    investBlocked.push(
      persona.riskProfile === '미진단'
        ? '투자성향 진단이 없어 투자 상품은 보여 드리지 않아요.'
        : '투자성향이 안정형이라 투자 상품은 보여 드리지 않아요.',
    );
  }

  if (investBlocked.length > 0) {
    pushExcluded(INVEST_ID, investBlocked.join(' '));
  }

  const superProduct = getProduct('super-deposit');
  const wonPlus = getProduct('won-plus');
  const duru = getProduct('duruduru');
  const fund = getProduct(INVEST_ID);

  if (horizon === 'SHORT') {
    const dateLine = useDate ? `${formatKoreanDate(useDate)}에 만기를 맞출 수 있어요.` : superProduct.summary;
    options.push(
      toOption(
        superProduct,
        [timeLine, profileLine, '만기일을 사용일에 맞출 수 있는 예금이에요.', dateLine],
        depositProcedure(),
        useDate ? `${formatKoreanDate(useDate)}에 만기를 맞출 수 있어요.` : superProduct.summary,
      ),
    );
    pushExcluded('won-plus', '만기일을 사용 예정일에 맞추기 어려운 상품이에요.');
    pushExcluded('duruduru', '회전 주기가 짧은 사용 일정과 맞지 않아요.');
  } else if (horizon === 'MID') {
    options.push(toOption(wonPlus, [timeLine, profileLine, '1~3년에는 시장금리를 반영하는 예금을 같이 보여 드려요.'], depositProcedure()));
    if (investBlocked.length === 0) {
      appliedRules.push('RULE_COOLING_OFF');
      options.push(
        toOption(fund, [timeLine, profileLine, '성향이 맞아 투자 상품을 비교 선택지에 넣었어요.', RULE_COPY.RULE_COOLING_OFF], investProcedure()),
      );
      pushExcluded('super-deposit', '1~3년 구간에서는 금리 반영 예금과 투자 상품을 우선했어요.');
      pushExcluded('duruduru', '회전복리 예금은 3년 이상일 때 우선해요.');
    } else {
      options.push(toOption(superProduct, [timeLine, profileLine, '만기일을 고를 수 있는 예금도 함께 보여 드려요.'], depositProcedure()));
      pushExcluded('duruduru', '1~3년 구간에는 시장금리 반영 예금을 우선했어요.');
    }
  } else if (horizon === 'LONG') {
    options.push(
      toOption(duru, [timeLine, profileLine, '오래 두는 돈이라 회전복리 예금을 같이 보여 드려요.'], depositProcedure()),
    );
    if (investBlocked.length === 0) {
      appliedRules.push('RULE_COOLING_OFF');
      options.push(
        toOption(
          fund,
          [timeLine, profileLine, '3년 이상 여유자금이고 성향이 맞아 투자 상품을 비교해요.', RULE_COPY.RULE_COOLING_OFF],
          investProcedure(),
        ),
      );
      pushExcluded('super-deposit', '만기 맞춤 예금보다 장기 상품을 우선했어요.');
      pushExcluded('won-plus', '장기 보유에는 회전복리 예금을 우선했어요.');
    } else {
      options.push(toOption(superProduct, [timeLine, profileLine, '만기를 직접 고르는 예금도 후보예요.'], depositProcedure()));
      pushExcluded('won-plus', '장기 보유에는 회전복리 예금을 우선했어요.');
    }
  } else {
    options.push(
      toOption(superProduct, [timeLine, profileLine, '기간을 모르면 만기를 나중에 고를 수 있는 예금만 더해요.'], depositProcedure()),
    );
    pushExcluded('won-plus', '자금 기간이 정해지기 전에는 제외했어요.');
    pushExcluded('duruduru', '자금 기간이 정해지기 전에는 제외했어요.');
  }

  const seen = new Set(options.map((option) => option.productId));
  if (options[0]?.productId !== REDEPOSIT_ID) {
    throw new Error('redeposit must stay first');
  }
  if (options.length > 3) {
    throw new Error('at most 3 options');
  }
  for (const product of PRODUCTS) {
    if (!seen.has(product.id) && !excluded.some((item) => item.productId === product.id)) {
      pushExcluded(product.id, '이번 조건의 비교 목록에는 넣지 않았어요.');
    }
  }

  const narrated = options.map((option) => ({
    ...option,
    ...narrateOption(option, persona, useDate, context.purpose),
  }));
  const heard = situationLine(persona.name, horizon, useDate, context.purpose);
  const decision = decisionLine(
    persona,
    horizon,
    narrated.some((option) => option.kind === 'invest'),
  );

  return { options: narrated, appliedRules, excluded, heard, decision };
}

export function getDefaultSelectedId(options: Option[]): string {
  const first = options[0];
  if (!first || first.kind !== 'redeposit') {
    throw new Error('default selection must be redeposit');
  }
  return first.productId;
}

export type HandoffContext = {
  investInquiry?: boolean;
};

export function needsHandoff(
  persona: Pick<Persona, 'age'>,
  quizFailCount: number,
  context: HandoffContext = {},
): { handoff: boolean; reason?: RuleId; reasons: RuleId[] } {
  const reasons: RuleId[] = [];
  if (context.investInquiry && persona.age >= ELDERLY_AGE) {
    reasons.push('RULE_ELDERLY_HANDOFF');
  }
  if (quizFailCount >= QUIZ_FAIL_LIMIT) {
    reasons.push('RULE_QUIZ_FAIL_HANDOFF');
  }
  return { handoff: reasons.length > 0, reason: reasons[0], reasons };
}

export function executionPath(kind: CatalogProduct['kind']): { steps: string[]; rule?: RuleId } {
  if (kind === 'invest') {
    return {
      rule: 'RULE_COOLING_OFF',
      steps: ['profile', 'explain', 'quiz', 'cooling', 'final'],
    };
  }
  return { steps: ['confirm'] };
}

export function diagnosisStatus(diagnosedAt: string | undefined, today = '2026-10-22'): {
  state: 'valid' | 'expired' | 'none';
  label: string;
} {
  if (!diagnosedAt) return { state: 'none', label: '미진단' };
  const days = Math.round(
    (Date.parse(`${today}T00:00:00`) - Date.parse(`${diagnosedAt}T00:00:00`)) / 86_400_000,
  );
  if (days > DIAGNOSIS_VALID_DAYS) return { state: 'expired', label: '재진단 필요' };
  return { state: 'valid', label: '유효' };
}

export type FitScore = {
  productId: string;
  name: string;
  score: number;
  excluded: boolean;
  reason?: string;
};

export function getFitScores(
  persona: Pick<Persona, 'riskProfile' | 'name'>,
  horizon: Horizon,
  useDate?: string,
): FitScore[] {
  const { options, excluded } = getEligibleOptions(persona, horizon, useDate);
  const scoreOf = (productId: string): number => {
    if (productId === 'super-deposit' && horizon === 'SHORT' && useDate) return 96;
    if (productId === 'duruduru' && horizon === 'LONG') return 90;
    if (productId === 'won-plus' && horizon === 'MID') return 88;
    if (productId === INVEST_ID && (horizon === 'LONG' || horizon === 'MID') && isInvestSuitable(persona)) return 84;
    if (productId === REDEPOSIT_ID) return 78;
    if (productId === 'super-deposit') return 74;
    return 60;
  };
  return [
    ...options.map((option) => ({
      productId: option.productId,
      name: option.name,
      score: scoreOf(option.productId),
      excluded: false,
    })),
    ...excluded.map((item) => ({
      productId: item.productId,
      name: item.name,
      score: 0,
      excluded: true,
      reason: item.reason,
    })),
  ].sort((a, b) => b.score - a.score);
}

export function predictChurn(persona: Pick<Persona, 'id'>): {
  probability: number;
  priority: '상' | '중' | '하';
  isExample: true;
} {
  const probability = persona.id === 'A' || persona.id === 'B' || persona.id === 'C' ? 0.72 : 0.72;
  return { probability, priority: '상', isExample: true };
}

export type EngineSnapshot = {
  horizon: ReturnType<typeof estimateHorizon>;
  timingText: string;
  purposeText: string;
  options: ReturnType<typeof getEligibleOptions>;
  scores: FitScore[];
  churn: ReturnType<typeof predictChurn>;
  handoff: ReturnType<typeof needsHandoff>;
  llm: typeof LLM_SCOPE;
};

export function buildEngineSnapshot(input: {
  persona: Persona;
  answers: Answers;
  quizFailCount: number;
  investInquiry: boolean;
}): EngineSnapshot {
  const horizon = estimateHorizon(input.answers);
  const options = getEligibleOptions(input.persona, horizon.horizon, horizon.useDate, {
    purpose: input.answers.purpose,
  });
  return {
    horizon,
    timingText: input.answers.timing ? TIMING_LABEL[input.answers.timing] : '아직 없음',
    purposeText: input.answers.purpose ? PURPOSE_LABEL[input.answers.purpose] : '아직 없음',
    options,
    scores: getFitScores(input.persona, horizon.horizon, horizon.useDate),
    churn: predictChurn(input.persona),
    handoff: needsHandoff(input.persona, input.quizFailCount, { investInquiry: input.investInquiry }),
    llm: LLM_SCOPE,
  };
}
