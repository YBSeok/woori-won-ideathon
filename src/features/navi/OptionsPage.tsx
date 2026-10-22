import { useState } from 'react';
import { Check } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AmountText, ExampleValue } from '../../components/ui/AmountText';
import { Badge } from '../../components/ui/Badge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { HIGH_BALANCE_THRESHOLD, RULE_COPY, estimateHorizon, getEligibleOptions, type Option } from '../../engine/rules';
import { SPLIT_PRODUCT_ID, comparePurposeSplit } from '../../engine/split';
import { formatKoreanDate } from '../../lib/format';
import { getPersona } from '../../mock/personas';
import { HOUSING_INFO } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function OptionsPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const answers = useDemoStore((state) => state.answers);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);
  const selectProduct = useDemoStore((state) => state.selectProduct);
  const setHandoff = useDemoStore((state) => state.setHandoff);
  const interpret = useDemoStore((state) => state.interpret);
  const intentConfirmed = useDemoStore((state) => state.intentConfirmed);
  const splitLegs = useDemoStore((state) => state.splitLegs);
  const [why, setWhy] = useState<Option | 'split' | null>(null);
  if (!personaId) return null;
  if (interpret && !intentConfirmed) return <Navigate to="/navi/chat" replace />;
  const persona = getPersona(personaId);
  const estimated = estimateHorizon(answers);
  const splitOn = Boolean(splitLegs && splitLegs.length >= 2);
  const result = getEligibleOptions(persona, estimated.horizon, estimated.useDate, {
    purpose: answers.purpose,
    split: splitOn,
  });
  const splitSelected = selectedProductId === SPLIT_PRODUCT_ID;
  const selected = splitSelected
    ? undefined
    : (result.options.find((option) => option.productId === selectedProductId) ?? result.options[0]);
  const comparison = splitLegs && splitLegs.length >= 2 ? comparePurposeSplit(splitLegs, persona.principal, persona.maturityDate) : null;

  const proceed = () => {
    if (splitSelected) {
      navigate('/navi/confirm-deposit');
      return;
    }
    if (!selected) return;
    if (selected.kind === 'invest') navigate('/navi/invest/profile');
    else navigate('/navi/confirm-deposit');
  };

  return (
    <Screen
      title="선택지 비교"
      step={3}
      onBack={() => navigate('/navi/chat')}
      footer={
        <PrimaryButton onClick={proceed}>
          {splitSelected ? '두 예금으로 나눠 진행할게요' : (selected?.proceedLabel ?? '이 상품으로 진행')}
        </PrimaryButton>
      }
      overlay={
        <BottomSheet open={Boolean(why)} title="왜 이 제안인가요?" onClose={() => setWhy(null)}>
          {why && why !== 'split' ? (
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
          {why === 'split' ? (
            <ul className="space-y-2 pb-2">
              {result.appliedRules
                .filter((rule) => rule === 'RULE_SPLIT_BY_PURPOSE' || rule === 'RULE_SHORT_TERM_NO_INVEST')
                .map((rule) => (
                  <li key={rule} className="rounded-button bg-bg px-3 py-3 text-sm leading-6 text-textBody">
                    {rule} · {RULE_COPY[rule]}
                  </li>
                ))}
            </ul>
          ) : null}
        </BottomSheet>
      }
    >
      <div className="space-y-3">
        <ChatBubble role="ai">{result.heard}</ChatBubble>
        <ChatBubble role="ai">{result.decision}</ChatBubble>
      </div>
      {persona.principal >= HIGH_BALANCE_THRESHOLD ? (
        <Card className="mt-3">
          <p className="text-[16px] font-bold text-textStrong">Two Chairs PB 상담 예약</p>
          <p className="mt-1 text-sm leading-6 text-textBody">원금이 1억 원 이상이라 전문가와 먼저 이야기하는 선택이에요.</p>
          <button
            type="button"
            onClick={() => {
              setHandoff('RULE_HIGH_BALANCE_PB');
              navigate('/navi/handoff');
            }}
            className="mt-3 min-h-tap w-full rounded-button bg-bg text-sm font-semibold text-textStrong"
          >
            예약 시간 보기
          </button>
        </Card>
      ) : null}
      <div className="mt-3 space-y-3" role="radiogroup" aria-label="만기 자금 선택지">
        {splitLegs && comparison ? (
          <Card selected={splitSelected} className="p-0">
            <div className="p-4">
              <button
                type="button"
                role="radio"
                aria-checked={splitSelected}
                onClick={() => selectProduct(SPLIT_PRODUCT_ID)}
                className="flex w-full items-start gap-3 text-left"
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    splitSelected ? 'border-primary bg-primary text-white' : 'border-line'
                  }`}
                >
                  {splitSelected ? <Check size={14} aria-hidden /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold text-textStrong">목적별로 나눠 맞추기</span>
                  <span className="mt-2 block space-y-2">
                    {splitLegs.map((leg) => (
                      <span key={`${leg.purpose}-${leg.date}`} className="block text-sm leading-6 text-textBody">
                        {leg.purposeLabel} {formatKoreanDate(leg.date)} 만기 {leg.productName}
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          <AmountText value={leg.amount} size="sm" />
                          <ExampleValue>연 3.00%</ExampleValue>
                        </span>
                      </span>
                    ))}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-textBody">
                    1년 그대로 재예치 후 학비 날 중도해지하면 · 세전
                    <span className="mt-1 block">
                      <AmountText value={comparison.earlyInterest} example size="sm" />
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-textBody">
                    쓰는 날에 맞춰 나누면 · 세전
                    <span className="mt-1 block">
                      <AmountText value={comparison.splitInterest} example size="sm" />
                    </span>
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-textStrong">쓰는 날에 맞추면 중도해지 없이 찾을 수 있어요.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWhy('split')}
                className="mt-3 min-h-tap w-full rounded-button bg-bg text-sm font-semibold text-textStrong"
              >
                왜 이 제안인가요?
              </button>
            </div>
          </Card>
        ) : null}
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
      {answers.purpose === 'HOUSING' ? (
        <div className="mt-3 space-y-3">
          {HOUSING_INFO.map((info) => (
            <Card key={info.id}>
              <p className="text-[13px] font-semibold text-primary">안내</p>
              <p className="mt-1 text-[16px] font-bold text-textStrong">{info.name}</p>
              <p className="mt-1 text-sm leading-6 text-textBody">{info.summary}</p>
            </Card>
          ))}
        </div>
      ) : null}
    </Screen>
  );
}
