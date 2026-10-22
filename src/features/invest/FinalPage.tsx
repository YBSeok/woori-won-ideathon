import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExampleValue } from '../../components/ui/AmountText';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { formatManWon } from '../../lib/format';
import { getPersona } from '../../mock/personas';
import { REDEPOSIT_ID, getProduct, INVEST_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function FinalPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const approved = useDemoStore((state) => state.invest.finalApproved);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  const complete = useDemoStore((state) => state.complete);
  const selectProduct = useDemoStore((state) => state.selectProduct);
  const [ready, setReady] = useState(approved);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const product = getProduct(INVEST_ID);
  const worst = Math.round(persona.principal * (product.worstLossRate ?? 0));

  return (
    <Screen
      title="다음 날 확인"
      step={4}
      onBack={() => navigate('/navi/invest/cooling')}
      footer={
        <>
          {ready ? (
            <PrimaryButton
              onClick={() => {
                addConsent('다음 날 최종 승인 뒤 인증 완료(데모)로 가입했어요.');
                markInvest('finalApproved');
                complete('invest', INVEST_ID);
                navigate('/navi/done');
              }}
            >
              인증 완료(데모)
            </PrimaryButton>
          ) : (
            <PrimaryButton
              onClick={() => {
                addConsent('다음 날 알림에서 최종 승인을 했어요.');
                markInvest('finalApproved');
                setReady(true);
              }}
            >
              최종 승인
            </PrimaryButton>
          )}
          <SecondaryButton
            onClick={() => {
              selectProduct(REDEPOSIT_ID);
              addConsent('다음 날 확인에서 재예치로 바꿨어요.');
              navigate('/navi/confirm-deposit');
            }}
          >
            재예치로 바꿀게요
          </SecondaryButton>
        </>
      }
    >
      <p className="text-xs font-bold text-primary">내일 오전 9시 알림</p>
      <h2 className="mt-2 text-xl font-bold leading-8 text-textStrong">어제 본 상품, 오늘도 진행할까요?</h2>
      <Card className="mt-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="danger">원금비보장</Badge>
          <Badge tone="caution">예금자보호 없음</Badge>
        </div>
        <h3 className="mt-2 text-lg font-bold text-textStrong">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-textBody">
          과거 기준 최악의 경우 약 <ExampleValue>{formatManWon(worst)}</ExampleValue> 손실이 날 수 있어요.
        </p>
        <div className="mt-2">
          <ExampleValue>{product.rateText}</ExampleValue>
        </div>
        <p className="mt-3 text-sm leading-6 text-textBody">답이 없으면 재예치로 진행돼요.</p>
      </Card>
    </Screen>
  );
}
