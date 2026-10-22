import { useNavigate } from 'react-router-dom';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { formatManWon } from '../../lib/format';
import { getPersona } from '../../mock/personas';
import { getProduct, INVEST_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

const rows = [
  { key: 'loss' as const, label: '원금 손실이 날 수 있어요' },
  { key: 'protect' as const, label: '예금자보호가 적용되지 않아요' },
  { key: 'fee' as const, label: '수수료가 있어요' },
];

export function ExplainPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const checked = useDemoStore((state) => state.explainChecked);
  const toggleExplain = useDemoStore((state) => state.toggleExplain);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const product = getProduct(INVEST_ID);
  const worst = product.worstLossRate ?? 0;
  const ready = rows.every((row) => checked[row.key]);

  return (
    <Screen
      title="핵심 설명"
      step={4}
      onBack={() => navigate('/navi/invest/profile')}
      footer={
        <PrimaryButton
          disabled={!ready}
          onClick={() => {
            rows.forEach((row) => addConsent(`${row.label}를 확인했어요.`));
            markInvest('explain');
            navigate('/navi/invest/quiz');
          }}
        >
          이해도 확인하기
        </PrimaryButton>
      }
    >
      <div className="rounded-card bg-danger/10 px-4 py-3 text-sm font-semibold leading-6 text-dangerText">
        원금 손실이 날 수 있고, 예금자보호가 적용되지 않아요.
      </div>
      <Card className="mt-3">
        <h2 className="text-lg font-bold text-textStrong">{product.name}</h2>
        <p className="mt-2 text-sm leading-6 text-textBody">
          1,000만 원을 넣으면 과거 기준 최악의 경우 약{' '}
          <ExampleValue>{formatManWon(Math.round(10_000_000 * worst))}</ExampleValue> 손실
        </p>
        <div className="mt-1">
          <ExampleValue>{`손실률 ${Math.round(worst * 100)}%`}</ExampleValue>
        </div>
        <p className="mt-3 text-sm leading-6 text-textBody">
          {persona.name}님 원금 기준으로는 약{' '}
          <ExampleValue>{formatManWon(Math.round(persona.principal * worst))}</ExampleValue>까지 줄 수 있어요.
        </p>
        <p className="mt-3 text-sm text-textBody">
          연 수수료 <ExampleValue>{`연 ${((product.feeRate ?? 0) * 100).toFixed(2)}%`}</ExampleValue>
          {' · 약 '}
          <ExampleValue>{formatManWon(Math.round(persona.principal * (product.feeRate ?? 0)))}</ExampleValue>
        </p>
      </Card>
      <p className="mb-2 mt-4 text-sm font-bold text-textStrong">확인하고 체크해 주세요</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <button
            key={row.key}
            type="button"
            aria-pressed={checked[row.key]}
            onClick={() => toggleExplain(row.key)}
            className="flex min-h-tap w-full items-center gap-3 rounded-card bg-surface px-4 text-left shadow-card"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${
                checked[row.key] ? 'border-primary bg-primary text-white' : 'border-line'
              }`}
            >
              {checked[row.key] ? '✓' : ''}
            </span>
            <span className="text-sm font-semibold text-textStrong">{row.label}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
