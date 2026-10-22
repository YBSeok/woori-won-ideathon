import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { Screen } from '../../components/ui/Screen';
import { EFFECT_DEFAULTS, annualEffect } from '../../engine/effect';
import { formatEok } from '../../lib/format';

export function SimulatorPage() {
  const navigate = useNavigate();
  const [volumeJo, setVolumeJo] = useState(EFFECT_DEFAULTS.maturityVolume / 1_000_000_000_000);
  const [retentionPp, setRetentionPp] = useState(EFFECT_DEFAULTS.retentionDelta * 100);
  const [fundingPp, setFundingPp] = useState(EFFECT_DEFAULTS.fundingGap * 100);
  const [conversionEok, setConversionEok] = useState(EFFECT_DEFAULTS.conversionAmount / 100_000_000);
  const [feePct, setFeePct] = useState(EFFECT_DEFAULTS.feeRate * 100);

  const result = useMemo(
    () =>
      annualEffect({
        maturityVolume: volumeJo * 1_000_000_000_000,
        retentionDelta: retentionPp / 100,
        fundingGap: fundingPp / 100,
        conversionAmount: conversionEok * 100_000_000,
        feeRate: feePct / 100,
      }),
    [volumeJo, retentionPp, fundingPp, conversionEok, feePct],
  );

  return (
    <Screen title="수익성 시뮬레이터" onBack={() => navigate('/')}>
      <p className="text-sm leading-6 text-textBody">은행 관점에서, 만기 자금을 지키면 비용과 수수료가 어떻게 달라지는지 봐요.</p>
      <Card className="mt-3 space-y-4">
        <Slider label="연간 만기 도래액" value={volumeJo} min={10} max={200} step={10} suffix="조 원" onChange={setVolumeJo} />
        <Slider label="Δ유지율" value={retentionPp} min={0.5} max={3} step={0.1} suffix="%p" onChange={setRetentionPp} />
        <Slider label="조달비용 차이" value={fundingPp} min={0.1} max={0.8} step={0.1} suffix="%p" onChange={setFundingPp} />
        <NumberField label="투자 전환액 (억 원)" value={conversionEok} onChange={setConversionEok} />
        <NumberField label="수수료율 (%)" value={feePct} onChange={setFeePct} />
      </Card>
      <Card className="mt-3">
        <p className="text-[13px] leading-5 text-textBody">
          연간 효과 = 만기 도래액 × Δ유지율 × 조달비용 차이 + 투자 전환액 × 수수료율
        </p>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center justify-between gap-2">
            <span className="text-textBody">조달비용 절감</span>
            <ExampleValue>{`약 ${formatEok(result.fundingSave)}`}</ExampleValue>
          </p>
          <p className="flex items-center justify-between gap-2">
            <span className="text-textBody">비이자수익</span>
            <ExampleValue>{`약 ${formatEok(result.feeIncome)}`}</ExampleValue>
          </p>
          <p className="flex items-center justify-between gap-2 border-t border-line pt-2 text-base font-bold">
            <span>합계</span>
            <ExampleValue>{`약 ${formatEok(result.total)}`}</ExampleValue>
          </p>
        </div>
      </Card>
      <p className="mt-3 text-[13px] leading-5 text-textWeak">모든 값은 산식 설명을 위한 가정값입니다.</p>
    </Screen>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const shown = Number.isInteger(step) ? value.toFixed(0) : value.toFixed(1);
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold text-textStrong">
        <span>{label}</span>
        <span>
          {shown}
          {suffix}
        </span>
      </span>
      <input
        className="mt-2 h-11 w-full accent-primary"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-textStrong">{label}</span>
      <input
        className="mt-1 min-h-tap w-full rounded-button border border-line bg-bg px-3 text-base text-textStrong"
        inputMode="decimal"
        value={Number.isFinite(value) ? String(value) : ''}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
      />
    </label>
  );
}
