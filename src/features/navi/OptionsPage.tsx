import { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { estimateHorizon, getEligibleOptions, type Option } from '../../engine/rules';
import { getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function OptionsPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const answers = useDemoStore((state) => state.answers);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);
  const selectProduct = useDemoStore((state) => state.selectProduct);
  const [why, setWhy] = useState<Option | null>(null);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const estimated = estimateHorizon(answers);
  const result = getEligibleOptions(persona, estimated.horizon, estimated.useDate);
  const selected = result.options.find((option) => option.productId === selectedProductId) ?? result.options[0];
  const hasInvest = result.options.some((option) => option.kind === 'invest');

  const proceed = () => {
    if (!selected) return;
    if (selected.kind === 'invest') navigate('/navi/invest/profile');
    else navigate('/navi/confirm-deposit');
  };

  return (
    <Screen
      title="선택지 비교"
      step={3}
      onBack={() => navigate('/navi/chat')}
      footer={<PrimaryButton onClick={proceed}>이 상품으로 진행</PrimaryButton>}
      overlay={
        <BottomSheet open={Boolean(why)} title="왜 이 제안인가요?" onClose={() => setWhy(null)}>
          {why ? (
            <ul className="space-y-2 pb-2">
              {why.reasons.map((reason) => (
                <li key={reason} className="rounded-button bg-bg px-3 py-3 text-sm leading-6 text-textBody">
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
        </BottomSheet>
      }
    >
      <p className="text-sm leading-6 text-textBody">
        {hasInvest
          ? '예금은 승인 한 번이면 끝나요. 투자 상품은 이해도 확인과 다음 날 숙려가 더 있어요.'
          : '이번 조건에서는 예금 안에서만 골라요. 재예치가 기본으로 선택돼 있어요.'}
      </p>
      <div className="mt-3 space-y-3" role="radiogroup" aria-label="만기 자금 선택지">
        {result.options.map((option) => {
          const checked = option.productId === selected?.productId;
          return (
            <Card key={option.productId} selected={checked} className="p-0">
              <div className="p-4">
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => selectProduct(option.productId)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      checked ? 'border-primary bg-primary text-white' : 'border-line'
                    }`}
                  >
                    {checked ? <Check size={14} aria-hidden /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[16px] font-bold text-textStrong">{option.name}</span>
                      {option.kind === 'redeposit' ? <Badge tone="safe">기본</Badge> : null}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-textBody">{option.summary}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <ExampleValue>{option.rateText}</ExampleValue>
                      <Badge tone={option.principalGuaranteed ? 'safe' : 'danger'}>
                        {option.principalGuaranteed ? '원금보장' : '원금비보장'}
                      </Badge>
                      <Badge tone={option.riskTone}>위험등급 {option.riskLabel}</Badge>
                    </span>
                    <span className="mt-2 block text-[13px] font-semibold text-primary">절차 · {option.procedure}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWhy(option)}
                  className="mt-3 min-h-tap w-full rounded-button bg-bg text-sm font-semibold text-textStrong"
                >
                  왜 이 제안인가요?
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}
