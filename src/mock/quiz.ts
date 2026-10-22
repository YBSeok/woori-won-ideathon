export type QuizChoice = {
  id: string;
  label: string;
  correct: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  explain: string;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: 'principal',
    prompt: '이 상품은 넣은 돈을 항상 그대로 돌려받을 수 있나요?',
    choices: [
      { id: 'always', label: '항상 그대로 받을 수 있어요', correct: false },
      { id: 'loss', label: '원금 손실이 날 수 있어요', correct: true },
      { id: 'bank', label: '은행이 손실을 채워 줘요', correct: false },
    ],
    explain:
      '가상 채권혼합형 펀드 A는 예금이 아니에요. 가격이 내리면 넣은 돈보다 적어질 수 있어요.',
  },
  {
    id: 'today',
    prompt: '오늘 버튼을 누르면 가입이 바로 끝나나요?',
    choices: [
      { id: 'now', label: '지금 바로 가입이 끝나요', correct: false },
      { id: 'tomorrow', label: '오늘은 여기까지고, 내일 다시 확인해요', correct: true },
      { id: 'week', label: '일주일 뒤에 자동으로 가입돼요', correct: false },
    ],
    explain:
      '투자성 상품은 오늘 바로 가입하지 않아요. 내일 다시 확인한 뒤에 최종 승인을 해요. 답이 없으면 재예치로 진행돼요.',
  },
  {
    id: 'protect',
    prompt: '이 상품에 예금자보호가 적용되나요?',
    choices: [
      { id: 'fifty', label: '5천만 원까지 보호돼요', correct: false },
      { id: 'no', label: '적용되지 않아요', correct: true },
      { id: 'all', label: '원금과 이자가 모두 보호돼요', correct: false },
    ],
    explain: '예금자보호는 예금에 적용돼요. 이 투자 상품에는 적용되지 않아요.',
  },
];
