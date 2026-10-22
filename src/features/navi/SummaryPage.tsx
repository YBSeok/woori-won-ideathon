import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AmountText } from '../../components/ui/AmountText';
import { ExampleValue } from '../../components/ui/AmountText';
import { Card } from '../../components/ui/Card';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { formatDotDate } from '../../lib/format';
import { daysUntil, exampleInterest, getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function SummaryPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const autoRedeposit = useDemoStore((state) => state.autoRedeposit);
  const setAutoRedeposit = useDemoStore((state) => state.setAutoRedeposit);
  const [open, setOpen] = useState(false);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const interest = exampleInterest(persona.principal, persona.annualRate);

  return (
    <Screen
      title="만기 상품 요약"
      step={1}
      onBack={() => navigate('/home')}
      footer={
        <>
          <PrimaryButton onClick={() => navigate('/navi/chat')}>용도부터 이야기해요</PrimaryButton>
          <SecondaryButton onClick={() => navigate('/navi/no-response')}>아무것도 안 하면?</SecondaryButton>
        </>
      }
    >
      <p className="text-sm leading-6 text-textBody">
        안전한 기본값이에요. 응답이 없어도 미리 동의한 재예치만 실행돼요.
      </p>
      <Card className="mt-3 space-y-3">
        <div>
          <p className="text-[13px] text-textBody">원금</p>
          <AmountText value={persona.principal} />
        </div>
        <div>
          <p className="text-[13px] text-textBody">예상 이자 · 1년 단순 계산</p>
          <AmountText value={interest} example />
        </div>
        <div>
          <p className="text-[13px] text-textBody">현재 금리</p>
          <ExampleValue>{`연 ${(persona.annualRate * 100).toFixed(2)}%`}</ExampleValue>
        </div>
        <div>
          <p className="text-[13px] text-textBody">만기일</p>
          <p className="text-lg font-bold text-textStrong">
            {formatDotDate(persona.maturityDate)} · D-{daysUntil(persona.maturityDate)}
          </p>
        </div>
      </Card>
      <Card className="mt-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold text-textStrong">사전 동의된 자동 재예치</p>
            <p className="mt-1 text-[13px] leading-5 text-textBody">켜져 있으면 만기일에 같은 조건으로 다시 맡겨요.</p>
          </div>
          <button
            type="button"
            aria-pressed={autoRedeposit}
            aria-label="자동 재예치"
            onClick={() => setAutoRedeposit(!autoRedeposit)}
            className={`relative h-8 w-14 shrink-0 rounded-chip ${autoRedeposit ? 'bg-primary' : 'bg-line'}`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-surface ${autoRedeposit ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <p className="mt-2 text-sm font-semibold text-primary">{autoRedeposit ? 'ON' : 'OFF'}</p>
      </Card>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-3 flex min-h-tap w-full items-center justify-between rounded-card bg-surface px-4 text-left shadow-card"
        aria-expanded={open}
      >
        <span className="text-sm font-bold text-textStrong">아무것도 하지 않으면 어떻게 되나요?</span>
        <ChevronDown size={18} className={`text-textWeak ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <p className="mt-2 rounded-card bg-surface px-4 py-3 text-sm leading-6 text-textBody shadow-card">
          {autoRedeposit
            ? '만기일에 같은 조건으로 자동 재예치돼요.'
            : '자동 재예치가 꺼져 있어요. 만기 금액은 연결 계좌로 들어와요.'}
        </p>
      ) : null}
    </Screen>
  );
}
