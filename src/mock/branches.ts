export type Branch = {
  id: string;
  name: string;
  distance: string;
  slot: string;
};

export const BRANCHES: Branch[] = [
  { id: 'gangnam', name: '우리은행 강남역지점', distance: '도보 8분', slot: '내일 10:30' },
  { id: 'yeoksam', name: '우리은행 역삼동지점', distance: '도보 14분', slot: '내일 14:00' },
  { id: 'samseong', name: '우리은행 삼성동지점', distance: '도보 18분', slot: '모레 11:00' },
];
