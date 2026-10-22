export type GuardCode = 'GUARD_PII' | 'GUARD_PROMPT_INJECTION';

export type GuardResult =
  | { ok: true }
  | { ok: false; code: GuardCode; message: string };

const PII_MESSAGE = '계좌번호나 주민번호 같은 개인정보는 입력하지 말아 주세요.';

function hasAccountNumber(text: string): boolean {
  const matches = text.match(/\d{2,6}-\d{2,6}-\d{2,6}/g) ?? [];
  return matches.some((token) => !/^\d{4}-\d{2}-\d{2}$/.test(token));
}

export function inspectUtterance(text: string): GuardResult {
  if (/\d{6}-\d{7}/.test(text) || hasAccountNumber(text) || /\d{10,}/.test(text)) {
    return { ok: false, code: 'GUARD_PII', message: PII_MESSAGE };
  }
  if (/이전 지시(?:는|를) 무시/.test(text)) {
    return {
      ok: false,
      code: 'GUARD_PROMPT_INJECTION',
      message: '그 말씀은 자금 용도로 이해하지 못했어요. 아래에서 골라 주세요.',
    };
  }
  return { ok: true };
}

export function maskUtterance(text: string): string {
  return text
    .replace(/\d{6}-\d{7}/g, '******-*******')
    .replace(/\d{2,6}-\d{2,6}-\d{2,6}/g, (token) => (/^\d{4}-\d{2}-\d{2}$/.test(token) ? token : '***-***-***'))
    .replace(/\d{10,}/g, (digits) => '*'.repeat(digits.length));
}
