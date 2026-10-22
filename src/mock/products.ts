export type ProductKind = 'redeposit' | 'deposit' | 'invest';

export type CatalogProduct = {
  id: string;
  name: string;
  summary: string;
  annualRate: number | null;
  rateText: string;
  isExample: true;
  principalGuaranteed: boolean;
  riskLabel: string;
  riskTone: 'safe' | 'caution' | 'danger';
  kind: ProductKind;
  worstLossRate?: number;
  feeRate?: number;
};

export const REDEPOSIT_ID = 'redeposit';
export const INVEST_ID = 'virtual-bond-mix';

export const PRODUCTS: CatalogProduct[] = [
  {
    id: REDEPOSIT_ID,
    name: '지금 예금 그대로 재예치',
    summary: '만기일에 지금과 같은 조건으로 다시 맡겨요.',
    annualRate: 0.031,
    rateText: '연 3.10%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'redeposit',
  },
  {
    id: 'super-deposit',
    name: '우리 SUPER 정기예금',
    summary: '만기일을 일·월 단위로 자유롭게 고를 수 있어요.',
    annualRate: 0.032,
    rateText: '연 3.20%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: 'won-plus',
    name: 'WON 플러스 예금',
    summary: '시장금리 변동을 적시에 반영해요.',
    annualRate: 0.0305,
    rateText: '연 3.05%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: 'duruduru',
    name: '두루두루정기예금',
    summary: '회전복리식이라 이자가 다음 이자의 밑천이 돼요.',
    annualRate: 0.0325,
    rateText: '연 3.25%',
    isExample: true,
    principalGuaranteed: true,
    riskLabel: '매우낮음',
    riskTone: 'safe',
    kind: 'deposit',
  },
  {
    id: INVEST_ID,
    name: '가상 채권혼합형 펀드 A',
    summary: '채권과 주식을 섞은 가상 투자 상품이에요. 원금이 줄 수 있어요.',
    annualRate: null,
    rateText: '과거 1년 수익률 4.80%',
    isExample: true,
    principalGuaranteed: false,
    riskLabel: '중간위험',
    riskTone: 'caution',
    kind: 'invest',
    worstLossRate: 0.12,
    feeRate: 0.005,
  },
];

export function getProduct(id: string): CatalogProduct {
  const found = PRODUCTS.find((product) => product.id === id);
  if (!found) throw new Error(`unknown product ${id}`);
  return found;
}
