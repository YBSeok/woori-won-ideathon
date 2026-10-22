import type { PurposeId, TimingId } from '../mock/chatScripts';
import { PURPOSE_LABEL, TIMING_LABEL } from '../mock/chatScripts';
import type { Persona } from '../mock/personas';
import { INVEST_ID, PRODUCTS, REDEPOSIT_ID, getProduct, type CatalogProduct } from '../mock/products';
import { formatKoreanDate } from '../lib/format';

export type Horizon = 'SHORT' | 'MID' | 'LONG' | 'UNKNOWN';

export type RuleId =
  | 'RULE_DEFAULT_REDEPOSIT'
  | 'RULE_SHORT_TERM_NO_INVEST'
  | 'RULE_SUITABILITY_ONLY'
  | 'RULE_ELDERLY_HANDOFF'
  | 'RULE_QUIZ_FAIL_HANDOFF'
  | 'RULE_COOLING_OFF';

export const ELDERLY_AGE = 65;
export const QUIZ_FAIL_LIMIT = 2;
export const DIAGNOSIS_VALID_DAYS = 365;

export const RULE_COPY: Record<RuleId, string> = {
  RULE_DEFAULT_REDEPOSIT: '재예치는 항상 첫 번째 선택지이자 기본 선택이에요.',
  RULE_SHORT_TERM_NO_INVEST: '6개월 안에 쓸 돈이라 투자 상품은 제외했어요.',
  RULE_SUITABILITY_ONLY: '투자성향이 맞지 않거나 진단이 없으면 투자 상품은 보여 드리지 않아요.',
  RULE_ELDERLY_HANDOFF: '만 65세 이상이 투자 상품을 물으면 영업점 PB·상담원에게 연결해요.',
  RULE_QUIZ_FAIL_HANDOFF: '같은 이해도 문항을 2번 틀리면 사람 연결로 바꿔요.',
  RULE_COOLING_OFF: '투자성 상품은 숙려 다음 날 최종 승인해요. 답이 없으면 재예치로 가요.',
};

export const LLM_SCOPE = {
  does: ['질문 생성', '설명 문장 생성'],
  doesNot: ['상품 결정', '수치 생성', '거래 실행'],
} as const;

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
};

export type ExcludedProduct = {
  productId: string;
  name: string;
  reason: string;
};

const INVEST_SUITABLE: Persona['riskProfile'][] = ['안정추구형'];

export function estimateHorizon(answers: Answers): { horizon: Horizon; useDate?: string } {
  const useDate = answers.useDate && answers.useDate !== 'unknown' ? answers.useDate : undefined;
  if (answers.timing === 'WITHIN_6M') return { horizon: 'SHORT', useDate };
  if (answers.timing === 'Y1_3') return { horizon: 'MID', useDate };
  if (answers.timing === 'OVER_3Y') return { horizon: 'LONG', useDate };
  return { horizon: 'UNKNOWN', useDate };
}

export function isInvestSuitable(persona: Pick<Persona, 'riskProfile'>): boolean {
  return INVEST_SUITABLE.includes(persona.riskProfile);
}

function horizonLabel(horizon: Horizon, useDate?: string): string {
  if (horizon === 'SHORT') {
    return useDate
      ? `자금 기간이 짧고, 사용 예정일이 ${formatKoreanDate(useDate)}이에요.`
      : '6개월 안에 쓸 돈이에요.';
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
  };
}

function depositProcedure(): string {
  return '원클릭 승인';
}

function investProcedure(): string {
  return '이해도 확인 → 다음 날 숙려 → 최종 승인';
}

export function getEligibleOptions(
  persona: Pick<Persona, 'riskProfile' | 'name'>,
  horizon: Horizon,
  useDate?: string,
): { options: Option[]; appliedRules: RuleId[]; excluded: ExcludedProduct[] } {
  const appliedRules: RuleId[] = ['RULE_DEFAULT_REDEPOSIT'];
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

  return { options, appliedRules, excluded };
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
  const options = getEligibleOptions(input.persona, horizon.horizon, horizon.useDate);
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
