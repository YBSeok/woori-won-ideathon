import { useState } from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
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
  const result = getEligibleOptions(persona, estimated.horizon, estimated.useDate, {
    purpose: answers.purpose,
  });
  const selected = result.options.find((option) => option.productId === selectedProductId) ?? result.options[0];

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
      footer={<PrimaryButton onClick={proceed}>{selected?.proceedLabel ?? '이 상품으로 진행'}</PrimaryButton>}
      overlay={
        <BottomSheet open={Boolean(why)} title="왜 이 제안인가요?" onClose={() => setWhy(null)}>
          {why ? (
            <div className="space-y-3 pb-2">
              <p className="text-sm leading-7 text-textStrong">{why.guide}</p>
              <ul className="space-y-2">
                {why.reasons.map((reason) => (
                  <li key={reason} className="rounded-button bg-bg px-3 py-3 text-sm leading-6 text-textBody">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </BottomSheet>
      }
    >
      <div className="space-y-3">
        <ChatBubble role="ai">{result.heard}</ChatBubble>
        <ChatBubble role="ai">{result.decision}</ChatBubble>
      </div>
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
                    <span className="mt-1 block text-sm leading-6 text-textBody">
                      {checked ? option.guide : option.summary}
                    </span>
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
