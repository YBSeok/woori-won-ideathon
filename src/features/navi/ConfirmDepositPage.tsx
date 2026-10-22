import { Navigate, useNavigate } from 'react-router-dom';
import { AmountText, ExampleValue } from '../../components/ui/AmountText';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { estimateHorizon, getEligibleOptions } from '../../engine/rules';
import { SPLIT_PRODUCT_ID, comparePurposeSplit } from '../../engine/split';
import { formatKoreanDate } from '../../lib/format';
import { exampleInterest, getPersona } from '../../mock/personas';
import { getProduct } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function ConfirmDepositPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const selectedProductId = useDemoStore((state) => state.selectedProductId);
  const answers = useDemoStore((state) => state.answers);
  const splitLegs = useDemoStore((state) => state.splitLegs);
  const addConsent = useDemoStore((state) => state.addConsent);
  const complete = useDemoStore((state) => state.complete);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  if (selectedProductId === SPLIT_PRODUCT_ID && splitLegs && splitLegs.length >= 2) {
    const comparison = comparePurposeSplit(splitLegs, persona.principal, persona.maturityDate);
    const approveSplit = () => {
      addConsent('목적별로 나눈 예금 두 건의 조건을 확인하고 승인했어요.');
      addConsent('인증 완료(데모)로 실행을 대신했어요.');
      complete('split');
      navigate('/navi/done');
    };
    return (
      <Screen
        title="예금 승인"
        step={4}
        onBack={() => navigate('/navi/options')}
        footer={<PrimaryButton onClick={approveSplit}>인증 완료(데모)</PrimaryButton>}
      >
        <ChatBubble role="ai">쓰는 날에 맞춰 예금 두 건으로 나눴어요. 아래 금액과 만기만 확인하면 둘 다 진행돼요.</ChatBubble>
        <p className="mt-3 text-sm leading-6 text-textBody">
          나눠 맡길 때 예상 이자 · 세전 <AmountText value={comparison.splitInterest} example size="sm" />
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {splitLegs.map((leg) => (
            <Card key={`${leg.purpose}-${leg.date}`} className="space-y-2">
              <Badge tone="safe">원금보장</Badge>
              <h2 className="text-[15px] font-bold leading-5 text-textStrong">{leg.productName}</h2>
              <p className="text-sm text-textBody">{leg.purposeLabel}</p>
              <AmountText value={leg.amount} size="sm" />
              <ExampleValue>연 3.00%</ExampleValue>
              <p className="text-sm font-semibold text-textStrong">{formatKoreanDate(leg.date)}에 맞춰요.</p>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-5 text-textWeak">키패드나 비밀번호 입력은 없어요. 이 버튼이 두 건의 인증을 대신해요.</p>
      </Screen>
    );
  }
  const product = getProduct(selectedProductId);
  if (product.kind === 'invest') return <Navigate to="/navi/invest/profile" replace />;
  const estimated = estimateHorizon(answers);
  const choice = getEligibleOptions(persona, estimated.horizon, estimated.useDate, { purpose: answers.purpose });
  const chosen = choice.options.find((option) => option.productId === product.id);
  const interest = product.annualRate ? exampleInterest(persona.principal, product.annualRate) : 0;
  const matched = product.id === 'super-deposit' && estimated.useDate;

  const approve = () => {
    addConsent(`${product.name} 조건을 확인하고 승인했어요.`);
    addConsent('인증 완료(데모)로 실행을 대신했어요.');
    complete('deposit', product.id);
    navigate('/navi/done');
  };

  return (
    <Screen
      title="예금 승인"
      step={4}
      onBack={() => navigate('/navi/options')}
      footer={<PrimaryButton onClick={approve}>인증 완료(데모)</PrimaryButton>}
    >
      <ChatBubble role="ai">
        {chosen?.guide ?? '고르신 예금의 금액과 금리만 확인하면 진행이 끝나요.'} 아래 숫자만 보고 승인하시면 돼요.
      </ChatBubble>
      <Card className="mt-3 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={product.principalGuaranteed ? 'safe' : 'danger'}>원금보장</Badge>
          <Badge tone="neutral">위험등급 {product.riskLabel}</Badge>
        </div>
        <h2 className="text-lg font-bold text-textStrong">{product.name}</h2>
        <p className="text-sm leading-6 text-textBody">{product.summary}</p>
        <div>
          <p className="text-[13px] text-textBody">금액</p>
          <AmountText value={persona.principal} />
        </div>
        <div>
          <p className="text-[13px] text-textBody">금리</p>
          <ExampleValue>{product.rateText}</ExampleValue>
        </div>
        <div>
          <p className="text-[13px] text-textBody">예상 이자 · 1년 단순 계산</p>
          <AmountText value={interest} example />
        </div>
        <div>
          <p className="text-[13px] text-textBody">만기</p>
          <p className="font-semibold text-textStrong">
            {matched && estimated.useDate
              ? `${formatKoreanDate(estimated.useDate)}에 맞춰요.`
              : product.kind === 'redeposit'
                ? `${formatKoreanDate(persona.maturityDate)}에 같은 조건으로 다시 시작해요.`
                : '상품에서 고른 기간을 따라요.'}
          </p>
        </div>
      </Card>
      <p className="mt-3 text-[13px] leading-5 text-textWeak">키패드나 비밀번호 입력은 없어요. 이 버튼이 인증을 대신해요.</p>
    </Screen>
  );
}
