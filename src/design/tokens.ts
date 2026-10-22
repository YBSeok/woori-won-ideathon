/**
 * 디자인 토큰.
 * /reference 캡처가 없어 프롬프트의 기본값을 사용한다.
 * TODO: reference에서 확인
 */
export const colors = {
  primary: '#0067AC',
  primaryPressed: '#00508A',
  bg: '#F4F6F9',
  surface: '#FFFFFF',
  textStrong: '#191F28',
  textBody: '#4E5968',
  // 기본 제안 #8B95A1 은 흰 배경 대비가 약 3:1이라 본문 보조색은 4.5:1 이상으로 조정
  // TODO: reference에서 확인
  textWeak: '#5C6770',
  line: '#E5E8EB',
  success: '#0E9F6E',
  successText: '#067647',
  caution: '#E8890C',
  cautionText: '#8A4B00',
  danger: '#E5484D',
  dangerText: '#B42318',
  stage: '#0B1220',
  ai: '#0067AC',
} as const;

export const radius = {
  card: 16,
  button: 12,
  chip: 999,
} as const;

export const layout = {
  screenPadding: 20,
  grid: 4,
  buttonMinHeight: 44,
  frameWidth: 390,
  frameHeight: 844,
} as const;
