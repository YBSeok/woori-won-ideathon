export type PersonaId = 'A' | 'B' | 'C' | 'D';

export type RiskProfile = '안정형' | '안정추구형' | '미진단';

export type Persona = {
  id: PersonaId;
  name: string;
  age: number;
  riskProfile: RiskProfile;
  diagnosedAt?: string;
  productName: string;
  principal: number;
  maturityDate: string;
  annualRate: number;
  autoRedeposit: boolean;
  outcome: string;
};

export const DEMO_TODAY = '2026-10-22';

export const PERSONAS: Persona[] = [
  {
    id: 'D',
    name: '정하늘',
    age: 39,
    riskProfile: '안정형',
    diagnosedAt: '2026-08-01',
    productName: '정기예금',
    principal: 30_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '학비와 이사 자금을 말해 주면, 쓰는 날에 맞춰 예금 두 건으로 나눠요.',
  },
  {
    id: 'A',
    name: '김민준',
    age: 34,
    riskProfile: '안정형',
    diagnosedAt: '2026-04-02',
    productName: '정기예금',
    principal: 30_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '내년 전세 잔금에 만기를 맞춘 예금으로 가요. 투자 상품은 나오지 않아요.',
  },
  {
    id: 'B',
    name: '이서연',
    age: 45,
    riskProfile: '안정추구형',
    diagnosedAt: '2025-09-01',
    productName: '정기예금',
    principal: 50_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '3년 이상 여유자금이면 투자 상품을 비교하고, 이해도 확인과 숙려를 거쳐요.',
  },
  {
    id: 'C',
    name: '박영자',
    age: 72,
    riskProfile: '미진단',
    productName: '정기예금',
    principal: 20_000_000,
    maturityDate: '2026-11-21',
    annualRate: 0.031,
    autoRedeposit: true,
    outcome: '투자 상품을 물으면 영업점 PB나 상담원에게 연결돼요.',
  },
];

export function getPersona(id: PersonaId): Persona {
  const found = PERSONAS.find((persona) => persona.id === id);
  if (!found) throw new Error(`unknown persona ${id}`);
  return found;
}

export function daysUntil(iso: string, today = DEMO_TODAY): number {
  const ms = Date.parse(`${iso}T00:00:00`) - Date.parse(`${today}T00:00:00`);
  return Math.round(ms / 86_400_000);
}

export function exampleInterest(principal: number, annualRate: number): number {
  return Math.round(principal * annualRate);
}
