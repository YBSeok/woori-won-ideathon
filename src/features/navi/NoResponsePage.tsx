import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { formatManWon } from '../../lib/format';
import { getPersona } from '../../mock/personas';
import { REDEPOSIT_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

const steps = [
  { id: 'd30', when: 'D-30 · 10월 22일', title: '만기 알림을 보냈어요', detail: '아직 고르지 않으셔도 괜찮아요.' },
  { id: 'd7', when: 'D-7 · 11월 14일', title: '한 번 더 알림을 보냈어요', detail: '선택이 없으면 기본값으로 가요.' },
  { id: 'd0', when: 'D-0 · 11월 21일', title: '사전 동의된 재예치를 실행해요', detail: '새로 위험한 상품으로는 가지 않아요.' },
];

export function NoResponsePage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const autoRedeposit = useDemoStore((state) => state.autoRedeposit);
  const addConsent = useDemoStore((state) => state.addConsent);
  const complete = useDemoStore((state) => state.complete);
  const [visible, setVisible] = useState(1);
  const persona = personaId ? getPersona(personaId) : null;
  const redepositOn = persona ? autoRedeposit : true;

  useEffect(() => {
    setVisible(1);
    const a = window.setTimeout(() => setVisible(2), 700);
    const b = window.setTimeout(() => setVisible(3), 1400);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [personaId]);

  const replay = () => {
    setVisible(1);
    window.setTimeout(() => setVisible(2), 700);
    window.setTimeout(() => setVisible(3), 1400);
  };

  return (
    <Screen
      title="무응답 시뮬레이션"
      step={1}
      onBack={() => navigate(persona ? '/navi/summary' : '/')}
      footer={
        <>
          <SecondaryButton onClick={replay}>타임라인 다시 보기</SecondaryButton>
          {persona && redepositOn ? (
            <PrimaryButton
              onClick={() => {
                addConsent('응답이 없어 사전 동의된 재예치에 동의된 상태로 실행했어요.');
                complete('no-response', REDEPOSIT_ID);
                navigate('/navi/done');
              }}
            >
              재예치 기록 보기
            </PrimaryButton>
          ) : null}
        </>
      }
    >
      <h2 className="text-xl font-bold leading-8 text-textStrong">
        {redepositOn ? '아무것도 하지 않아도 손해 보지 않아요.' : '자동 재예치가 꺼져 있어요.'}
      </h2>
      <p className="mt-2 text-sm leading-6 text-textBody">
        {persona ? `${persona.name}님의 ${formatManWon(persona.principal)}` : '예시 고객의 3,000만 원'} 만기 자금이에요.
        {redepositOn
          ? ' 답이 없으면 미리 동의한 재예치만 실행돼요.'
          : ' 만기 금액은 연결 계좌로 들어와요.'}
      </p>
      <ol className="mt-4 space-y-3">
        {steps.slice(0, visible).map((step, index) => (
          <motion.li key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <p className="text-xs font-bold text-primary">{step.when}</p>
              <p className="mt-1 text-[15px] font-bold text-textStrong">
                {index === 2 && !redepositOn ? '연결 계좌로 들어와요' : step.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-textBody">
                {index === 2 && !redepositOn ? '새로 가입하거나 다른 상품으로 옮기지 않아요.' : step.detail}
              </p>
            </Card>
          </motion.li>
        ))}
      </ol>
    </Screen>
  );
}
