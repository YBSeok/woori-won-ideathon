export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatComma(value: number): string {
  return Math.round(value).toLocaleString('ko-KR');
}

export function formatWon(value: number): string {
  return `${formatComma(value)}원`;
}

export function formatManWon(value: number): string {
  const man = value / 10_000;
  const rounded = Number.isInteger(man) ? man : Math.round(man * 10) / 10;
  return `${rounded.toLocaleString('ko-KR')}만 원`;
}

export function formatEok(value: number): string {
  const eok = value / 100_000_000;
  const abs = Math.abs(eok);
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const text = eok.toLocaleString('ko-KR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
  return `${text}억 원`;
}

export function formatKoreanDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function formatDotDate(iso: string): string {
  return iso.replaceAll('-', '.');
}
