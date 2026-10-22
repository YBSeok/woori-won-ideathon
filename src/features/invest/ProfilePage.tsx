import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { diagnosisStatus, estimateHorizon, getEligibleOptions } from '../../engine/rules';
import { DEMO_TODAY, getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const renewed = useDemoStore((state) => state.diagnosisRenewed);
  const renewDiagnosis = useDemoStore((state) => state.renewDiagnosis);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  const answers = useDemoStore((state) => state.answers);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const estimated = estimateHorizon(answers);
  const chosen = getEligibleOptions(persona, estimated.horizon, estimated.useDate, {
    purpose: answers.purpose,
  }).options.find((option) => option.productId === selectedProductId);
  const status = renewed
    ? { state: 'valid' as const, label: '유효', date: DEMO_TODAY }
    : { ...diagnosisStatus(persona.diagnosedAt, DEMO_TODAY), date: persona.diagnosedAt };
  const blocked = status.state !== 'valid';

  return (
    <Screen
      title="투자성향"
      step={4}
      onBack={() => navigate('/navi/options')}
      footer={
        <PrimaryButton
          disabled={blocked}
          onClick={() => {
            addConsent(`투자성향 ${persona.riskProfile} 결과를 확인했어요.`);
            markInvest('profile');
            navigate('/navi/invest/explain');
          }}
        >
          설명을 이어서 볼게요
        </PrimaryButton>
      }
    >
      <ChatBubble role="ai">
        {chosen?.guide ??
          '투자 상품은 여기서부터 단계가 늘어나요. 성향을 확인한 뒤에만 설명을 이어가요.'}
      </ChatBubble>
      <Card className="mt-3">
        <p className="text-[13px] text-textBody">진단 결과</p>
        <p className="mt-1 text-2xl font-bold text-textStrong">{persona.riskProfile}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={status.state === 'valid' ? 'safe' : 'caution'}>{status.label}</Badge>
          <span className="text-sm text-textBody">
            진단일 {status.date ? status.date.replaceAll('-', '.') : '없음'}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-textBody">
          진단이 1년을 넘으면 다시 진단해야 해요. 지금은 {status.state === 'expired' ? '재진단이 필요한 예시예요.' : '유효 기간 안이에요.'}
        </p>
      </Card>
      {blocked ? (
        <div className="mt-3">
          <PrimaryButton
            onClick={() => {
              renewDiagnosis();
              addConsent('재진단 완료(데모)로 투자성향을 다시 확인했어요.');
            }}
          >
            재진단 완료(데모)
          </PrimaryButton>
        </div>
      ) : null}
    </Screen>
  );
}
