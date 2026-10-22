import { create } from 'zustand';
import { inspectUtterance, maskUtterance, type GuardResult } from '../engine/guard';
import { mockInterpret, toPurposeId, validateIntent, type InterpretResult } from '../engine/interpret';
import { horizonFromDate, type RuleId } from '../engine/rules';
import { buildSplitPlan, type SplitLeg } from '../engine/split';
import { formatKoreanDate, formatManWon } from '../lib/format';
import type { PurposeId, TimingId } from '../mock/chatScripts';
import { DEMO_TODAY, getPersona, type PersonaId } from '../mock/personas';
import { getProduct, REDEPOSIT_ID } from '../mock/products';

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export type ChatStep = 'timing' | 'purpose' | 'date' | 'interpret' | 'closing' | 'handoff';

export type InvestFlags = {
  profile: boolean;
  explain: boolean;
  quiz: boolean;
  cooling: boolean;
  nextDay: boolean;
  finalApproved: boolean;
};

export type ExplainChecks = {
  loss: boolean;
  protect: boolean;
  fee: boolean;
};

export type Completion = {
  type: 'product';
  productId: string;
  via: 'deposit' | 'invest' | 'no-response' | 'split';
} | null;

type DemoState = {
  personaId: PersonaId | null;
  enginePanelEnabled: boolean;
  enginePanelExpanded: boolean;
  autoRedeposit: boolean;
  answers: { timing?: TimingId; purpose?: PurposeId; useDate?: string };
  messages: ChatMessage[];
  chatStep: ChatStep;
  selectedProductId: string;
  quizFails: Record<string, number>;
  quizIndex: number;
  quizExplain: string | null;
  invest: InvestFlags;
  diagnosisRenewed: boolean;
  explainChecked: ExplainChecks;
  handoffReason?: RuleId;
  handoffNote: string | null;
  completion: Completion;
  consents: string[];
  investInquiry: boolean;
  toast: string | null;
  utterance: string | null;
  maskedUtterance: string | null;
  guard: GuardResult | null;
  interpret: InterpretResult | null;
  validationNotes: string[];
  intentConfirmed: boolean;
  confirmedAt: string | null;
  splitLegs: SplitLeg[] | null;
  selectPersona: (id: PersonaId) => void;
  setEnginePanelEnabled: (on: boolean) => void;
  setEnginePanelExpanded: (on: boolean) => void;
  setAutoRedeposit: (on: boolean) => void;
  appendMessage: (role: ChatMessage['role'], text: string) => void;
  setChatStep: (step: ChatStep) => void;
  setAnswers: (patch: DemoState['answers']) => void;
  selectProduct: (productId: string) => void;
  missQuiz: (questionId: string) => number;
  clearQuizExplain: () => void;
  setQuizExplain: (text: string) => void;
  advanceQuiz: () => void;
  markInvest: (flag: keyof InvestFlags) => void;
  renewDiagnosis: () => void;
  toggleExplain: (key: keyof ExplainChecks) => void;
  setHandoff: (reason: RuleId) => void;
  setHandoffNote: (note: string) => void;
  addConsent: (line: string) => void;
  complete: (via: 'deposit' | 'invest' | 'no-response' | 'split', productId?: string) => void;
  showToast: (message: string) => void;
  submitUtterance: (text: string) => void;
  answerIntentDate: (index: number, date: string) => void;
  answerIntentTiming: (index: number, label: string) => void;
  confirmIntent: () => boolean;
  reviseIntent: () => void;
};

const emptyInvest = (): InvestFlags => ({
  profile: false,
  explain: false,
  quiz: false,
  cooling: false,
  nextDay: false,
  finalApproved: false,
});

const emptyChecks = (): ExplainChecks => ({ loss: false, protect: false, fee: false });

function openingMessages(name: string, productName: string, principal: number): ChatMessage[] {
  return [
    {
      id: 'open-1',
      role: 'ai',
      text: `${name}님, 만기되는 ${productName} ${formatManWon(principal)}의 다음 자리를 같이 볼게요. 어떤 상품을 보여 드릴지는 규칙이 정하고, 저는 질문하고 설명만 해요.`,
    },
    {
      id: 'open-2',
      role: 'ai',
      text: '이 돈은 언제 쓸 예정이세요?',
    },
  ];
}

let toastTimer = 0;
let messageSeq = 0;

export const useDemoStore = create<DemoState>((set, get) => ({
  personaId: null,
  enginePanelEnabled: false,
  enginePanelExpanded: false,
  autoRedeposit: true,
  answers: {},
  messages: [],
  chatStep: 'timing',
  selectedProductId: REDEPOSIT_ID,
  quizFails: {},
  quizIndex: 0,
  quizExplain: null,
  invest: emptyInvest(),
  diagnosisRenewed: false,
  explainChecked: emptyChecks(),
  handoffNote: null,
  completion: null,
  consents: [],
  investInquiry: false,
  toast: null,
  utterance: null,
  maskedUtterance: null,
  guard: null,
  interpret: null,
  validationNotes: [],
  intentConfirmed: false,
  confirmedAt: null,
  splitLegs: null,
  selectPersona: (id) => {
    const persona = getPersona(id);
    messageSeq = 0;
    set({
      personaId: id,
      autoRedeposit: persona.autoRedeposit,
      answers: {},
      messages: openingMessages(persona.name, persona.productName, persona.principal),
      chatStep: 'timing',
      selectedProductId: REDEPOSIT_ID,
      quizFails: {},
      quizIndex: 0,
      quizExplain: null,
      invest: emptyInvest(),
      diagnosisRenewed: false,
      explainChecked: emptyChecks(),
      handoffReason: undefined,
      handoffNote: null,
      completion: null,
      consents: [],
      investInquiry: false,
      utterance: null,
      maskedUtterance: null,
      guard: null,
      interpret: null,
      validationNotes: [],
      intentConfirmed: false,
      confirmedAt: null,
      splitLegs: null,
    });
  },
  setEnginePanelEnabled: (on) => set({ enginePanelEnabled: on, enginePanelExpanded: false }),
  setEnginePanelExpanded: (on) => set({ enginePanelExpanded: on }),
  setAutoRedeposit: (on) => set({ autoRedeposit: on }),
  appendMessage: (role, text) => {
    messageSeq += 1;
    set({ messages: [...get().messages, { id: `m-${messageSeq}`, role, text }] });
  },
  setChatStep: (step) => set({ chatStep: step }),
  setAnswers: (patch) => set({ answers: { ...get().answers, ...patch }, selectedProductId: REDEPOSIT_ID }),
  selectProduct: (productId) => set({ selectedProductId: productId }),
  missQuiz: (questionId) => {
    const next = (get().quizFails[questionId] ?? 0) + 1;
    set({ quizFails: { ...get().quizFails, [questionId]: next } });
    return next;
  },
  clearQuizExplain: () => set({ quizExplain: null }),
  setQuizExplain: (text) => set({ quizExplain: text }),
  advanceQuiz: () => set({ quizIndex: get().quizIndex + 1, quizExplain: null }),
  markInvest: (flag) => set({ invest: { ...get().invest, [flag]: true } }),
  renewDiagnosis: () => set({ diagnosisRenewed: true }),
  toggleExplain: (key) =>
    set({ explainChecked: { ...get().explainChecked, [key]: !get().explainChecked[key] } }),
  setHandoff: (reason) => set({ handoffReason: reason, investInquiry: reason === 'RULE_ELDERLY_HANDOFF' ? true : get().investInquiry }),
  setHandoffNote: (note) => set({ handoffNote: note }),
  addConsent: (line) => {
    if (get().consents.includes(line)) return;
    set({ consents: [...get().consents, line] });
  },
  complete: (via, productId) => {
    if (via === 'split') {
      set({ completion: { type: 'product', productId: 'super-deposit', via }, selectedProductId: 'purpose-split' });
      return;
    }
    const id = productId ?? get().selectedProductId;
    getProduct(id);
    set({ completion: { type: 'product', productId: id, via }, selectedProductId: id });
  },
  submitUtterance: (text) => {
    const trimmed = text.trim();
    const personaId = get().personaId;
    if (!trimmed || !personaId) return;
    const verdict = inspectUtterance(trimmed);
    if (!verdict.ok) {
      get().appendMessage('ai', verdict.message);
      set({
        guard: verdict,
        utterance: null,
        maskedUtterance: null,
        interpret: null,
        validationNotes: [],
        intentConfirmed: false,
        splitLegs: null,
        chatStep: verdict.code === 'GUARD_PROMPT_INJECTION' ? 'timing' : get().chatStep,
      });
      return;
    }
    const persona = getPersona(personaId);
    const checked = validateIntent(mockInterpret(trimmed, DEMO_TODAY), persona.principal);
    if (checked.result.items.length === 0) {
      get().appendMessage('user', trimmed);
      get().appendMessage('ai', '잘 이해하지 못했어요. 아래에서 골라 주세요.');
      set({
        guard: verdict,
        utterance: trimmed,
        maskedUtterance: maskUtterance(trimmed),
        interpret: null,
        validationNotes: [],
        intentConfirmed: false,
        chatStep: 'timing',
      });
      return;
    }
    get().appendMessage('user', trimmed);
    set({
      guard: verdict,
      utterance: trimmed,
      maskedUtterance: maskUtterance(trimmed),
      interpret: checked.result,
      validationNotes: checked.fixes,
      intentConfirmed: false,
      confirmedAt: null,
      splitLegs: null,
      chatStep: 'interpret',
    });
  },
  answerIntentDate: (index, date) => {
    const current = get().interpret;
    const personaId = get().personaId;
    if (!current || !personaId) return;
    const persona = getPersona(personaId);
    const items = current.items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const amount = item.amount ?? (current.items.length === 1 ? persona.principal : item.amount);
      return { ...item, date, amount, timeText: formatKoreanDate(date), certainty: 'CONFIRMED' as const };
    });
    const checked = validateIntent({ ...current, items }, persona.principal);
    set({ interpret: checked.result, validationNotes: checked.fixes });
  },
  answerIntentTiming: (index, label) => {
    const current = get().interpret;
    const personaId = get().personaId;
    if (!current || !personaId) return;
    const persona = getPersona(personaId);
    const items = current.items.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const amount = item.amount ?? (current.items.length === 1 ? persona.principal : item.amount);
      return { ...item, amount, timeText: label, date: undefined, certainty: 'CONFIRMED' as const };
    });
    const checked = validateIntent({ ...current, items }, persona.principal);
    set({ interpret: checked.result, validationNotes: checked.fixes });
  },
  confirmIntent: () => {
    const current = get().interpret;
    if (!current || current.items.some((item) => item.certainty !== 'CONFIRMED')) return false;
    const primary = current.items.find((item) => item.purpose === 'TUITION') ?? current.items[0];
    if (!primary) return false;
    const purpose = toPurposeId(primary.purpose);
    const useDate = primary.date;
    const horizon = useDate
      ? horizonFromDate(useDate)
      : primary.timeText.includes('3년')
        ? 'LONG'
        : primary.timeText.includes('1~3') || primary.timeText.includes('1년에서')
          ? 'MID'
          : primary.timeText.includes('1년')
            ? 'SHORT'
            : 'UNKNOWN';
    const timing: TimingId =
      horizon === 'SHORT' ? 'WITHIN_6M' : horizon === 'MID' ? 'Y1_3' : horizon === 'LONG' ? 'OVER_3Y' : 'UNKNOWN';
    set({
      answers: { timing, purpose, useDate },
      selectedProductId: REDEPOSIT_ID,
      splitLegs: buildSplitPlan(current.items),
      intentConfirmed: true,
      confirmedAt: `${DEMO_TODAY} 09:41`,
    });
    return true;
  },
  reviseIntent: () => {
    set({
      interpret: null,
      utterance: null,
      maskedUtterance: null,
      guard: null,
      validationNotes: [],
      intentConfirmed: false,
      confirmedAt: null,
      splitLegs: null,
      chatStep: 'timing',
    });
  },
  showToast: (message) => {
    window.clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = window.setTimeout(() => set({ toast: null }), 2400);
  },
}));

export function sameQuestionFailCount(fails: Record<string, number>): number {
  return Object.values(fails).reduce((max, count) => Math.max(max, count), 0);
}
