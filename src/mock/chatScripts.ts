export type TimingId = 'WITHIN_6M' | 'Y1_3' | 'OVER_3Y' | 'UNKNOWN';
export type PurposeId = 'JEONSE' | 'TUITION' | 'RETIREMENT' | 'SPARE' | 'INVEST_INQUIRY';

export type ChipOption = {
  id: string;
  label: string;
};

export const TIMING_CHIPS: ChipOption[] = [
  { id: 'WITHIN_6M', label: '6개월 안' },
  { id: 'Y1_3', label: '1~3년' },
  { id: 'OVER_3Y', label: '3년 이상' },
  { id: 'UNKNOWN', label: '아직 몰라요' },
];

export const PURPOSE_CHIPS: ChipOption[] = [
  { id: 'JEONSE', label: '전세·이사' },
  { id: 'TUITION', label: '학비' },
  { id: 'RETIREMENT', label: '노후' },
  { id: 'SPARE', label: '여유자금' },
];

export const DATE_CHIPS: ChipOption[] = [
  { id: '2027-05-20', label: '2027년 5월 20일' },
  { id: '2027-02-28', label: '2027년 2월 28일' },
  { id: 'unknown', label: '날짜는 아직 몰라요' },
];

export const TIMING_LABEL: Record<TimingId, string> = {
  WITHIN_6M: '6개월 안',
  Y1_3: '1~3년',
  OVER_3Y: '3년 이상',
  UNKNOWN: '아직 모름',
};

export const PURPOSE_LABEL: Record<PurposeId, string> = {
  JEONSE: '전세·이사',
  TUITION: '학비',
  RETIREMENT: '노후',
  SPARE: '여유자금',
  INVEST_INQUIRY: '투자 상품 문의',
};

export function purposeNeedsDate(purpose?: PurposeId): boolean {
  return purpose === 'JEONSE' || purpose === 'TUITION';
}
