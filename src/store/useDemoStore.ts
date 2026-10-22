import { create } from 'zustand';
import type { RuleId } from '../engine/rules';
import { formatManWon } from '../lib/format';
import type { PurposeId, TimingId } from '../mock/chatScripts';
import { getPersona, type PersonaId } from '../mock/personas';
import { getProduct, REDEPOSIT_ID } from '../mock/products';

export type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

export type ChatStep = 'timing' | 'purpose' | 'date' | 'closing' | 'handoff';

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
  via: 'deposit' | 'invest' | 'no-response';
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
  complete: (via: 'deposit' | 'invest' | 'no-response', productId?: string) => void;
  showToast: (message: string) => void;
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
    const id = productId ?? get().selectedProductId;
    getProduct(id);
    set({ completion: { type: 'product', productId: id, via }, selectedProductId: id });
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
