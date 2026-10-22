import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { RULE_COPY } from '../../engine/rules';
import { BRANCHES, TWO_CHAIRS } from '../../mock/branches';
import { getPersona } from '../../mock/personas';
import { REDEPOSIT_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function HandoffPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const reason = useDemoStore((state) => state.handoffReason);
  const note = useDemoStore((state) => state.handoffNote);
  const setHandoffNote = useDemoStore((state) => state.setHandoffNote);
  const showToast = useDemoStore((state) => state.showToast);
  const selectProduct = useDemoStore((state) => state.selectProduct);
  const addConsent = useDemoStore((state) => state.addConsent);
  const [branchId, setBranchId] = useState<string | null>(null);
  if (!personaId) return null;
  const persona = getPersona(personaId);

  return (
    <Screen
      title="사람 연결"
      step={4}
      onBack={() => navigate(reason === 'RULE_QUIZ_FAIL_HANDOFF' ? '/navi/options' : '/navi/chat')}
      footer={
        <SecondaryButton
          onClick={() => {
            selectProduct(REDEPOSIT_ID);
            addConsent('전문가 연결 대신 재예치를 골랐어요.');
            navigate('/navi/confirm-deposit');
          }}
        >
          그냥 재예치하기
        </SecondaryButton>
      }
    >
      <h2 className="text-xl font-bold leading-8 text-textStrong">이 결정은 전문가와 함께 하는 게 좋아요.</h2>
      <p className="mt-2 text-sm leading-6 text-textBody">
        {persona.name}님은 {persona.age}세 · {persona.riskProfile}이에요. 취약 고객의 투자 결정은 사람이 이어받아요.
      </p>
      {reason ? <p className="mt-3 rounded-card bg-primary/10 px-4 py-3 text-sm leading-6 text-primary">{RULE_COPY[reason]}</p> : null}
      <h3 className="mb-1 mt-5 text-sm font-bold text-textStrong">
        {reason === 'RULE_HIGH_BALANCE_PB' ? 'Two Chairs PB 상담' : '가까운 영업점 PB 상담'}
      </h3>
      <Card className="p-0 px-4">
        {(reason === 'RULE_HIGH_BALANCE_PB' ? TWO_CHAIRS : BRANCHES).map((branch) => (
          <ListItem
            key={branch.id}
            title={branch.name}
            description={`${branch.distance} · ${branch.slot}`}
            onClick={() => {
              setBranchId(branch.id);
              const text = `${branch.name} ${branch.slot} 상담을 예약했어요(데모).`;
              setHandoffNote(text);
              showToast(text);
            }}
            right={
              <span className="text-xs font-bold text-primary">{branchId === branch.id ? '예약됨' : '예약'}</span>
            }
          />
        ))}
      </Card>
      {note ? <p className="mt-3 text-sm font-semibold text-successText">{note}</p> : null}
      <div className="mt-4">
        <PrimaryButton
          onClick={() => {
            const text = '상담원이 오늘 중으로 전화를 드려요(데모).';
            setHandoffNote(text);
            showToast(text);
          }}
        >
          상담원 콜백 요청
        </PrimaryButton>
      </div>
    </Screen>
  );
}
