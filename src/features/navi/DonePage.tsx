import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { RULE_COPY, estimateHorizon, getEligibleOptions } from '../../engine/rules';
import { PURPOSE_LABEL, TIMING_LABEL } from '../../mock/chatScripts';
import { DEMO_TODAY, getPersona } from '../../mock/personas';
import { getProduct } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function DonePage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const completion = useDemoStore((state) => state.completion);
  const answers = useDemoStore((state) => state.answers);
  const consents = useDemoStore((state) => state.consents);
  if (!personaId || !completion) return null;
  const persona = getPersona(personaId);
  const product = getProduct(completion.productId);
  const estimated = estimateHorizon(answers);
  const result = getEligibleOptions(persona, estimated.horizon, estimated.useDate);
  const chosen = result.options.find((option) => option.productId === product.id);

  const headline =
    completion.via === 'no-response'
      ? '응답이 없어 재예치로 진행했어요.'
      : completion.via === 'invest'
        ? '투자 상품 가입까지 마쳤어요.'
        : '예금 쪽으로 실행을 마쳤어요.';

  const events = [
    { title: '만기 감지', detail: `${DEMO_TODAY}에 D-30 알림을 띄웠어요.` },
    {
      title: '자금 용도',
      detail: answers.timing
        ? `${TIMING_LABEL[answers.timing]} · ${answers.purpose ? PURPOSE_LABEL[answers.purpose] : '용도 미입력'}${
            estimated.useDate ? ` · ${estimated.useDate}` : ''
          }`
        : '대화를 거치지 않은 경로예요.',
    },
    {
      title: '본 선택지',
      detail: result.options.map((option) => option.name).join(' / '),
    },
    {
      title: '제안 근거',
      detail: chosen ? chosen.reasons.join(' ') : '재예치 기본 규칙을 적용했어요.',
    },
    {
      title: '적용된 규칙',
      detail: result.appliedRules.map((rule) => `${rule} · ${RULE_COPY[rule]}`).join(' '),
    },
    {
      title: '동의한 내용',
      detail: consents.length ? consents.join(' ') : '저장된 동의 문장이 없어요.',
    },
    {
      title: '실행',
      detail:
        completion.via === 'no-response'
          ? '고객 응답 없이 사전 동의된 재예치를 실행했어요.'
          : `${product.name}으로 데모 실행을 기록했어요.`,
    },
  ];

  return (
    <Screen
      title="완료와 기록"
      step={5}
      onBack={() => navigate('/home')}
      footer={<SecondaryButton onClick={() => navigate('/')}>다른 고객 시연</SecondaryButton>}
    >
      <h2 className="text-xl font-bold leading-7 text-textStrong">{headline}</h2>
      <p className="mt-2 text-sm leading-6 text-textBody">{persona.name}님 · {product.name}</p>
      <Card className="mt-4">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">기록 보기</Badge>
          <Badge tone={product.kind === 'invest' ? 'caution' : 'safe'}>
            {product.kind === 'invest' ? '투자' : '예금'}
          </Badge>
        </div>
        <ol className="mt-3 space-y-3">
          {events.map((event, index) => (
            <li key={event.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-bold text-textStrong">{event.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-textBody">{event.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>
      <Card className="mt-3">
        <p className="text-sm font-bold text-textStrong">사후 점검</p>
        <p className="mt-1 text-sm leading-6 text-textBody">가입 후 이상 패턴이 보이면 다시 연락드려요.</p>
      </Card>
    </Screen>
  );
}
