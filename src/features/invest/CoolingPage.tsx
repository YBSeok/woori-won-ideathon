import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { REDEPOSIT_ID } from '../../mock/products';
import { useDemoStore } from '../../store/useDemoStore';

export function CoolingPage() {
  const navigate = useNavigate();
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  const selectProduct = useDemoStore((state) => state.selectProduct);

  return (
    <Screen
      title="숙려"
      step={4}
      onBack={() => navigate('/navi/invest/quiz')}
      footer={
        <>
          <PrimaryButton
            onClick={() => {
              addConsent('오늘은 가입하지 않고 다음 날 다시 확인하기로 했어요.');
              markInvest('cooling');
              markInvest('nextDay');
              navigate('/navi/invest/final');
            }}
          >
            ⏩ 다음 날로 이동(데모)
          </PrimaryButton>
          <SecondaryButton
            onClick={() => {
              selectProduct(REDEPOSIT_ID);
              addConsent('숙려 중에 재예치로 바꿨어요.');
              navigate('/navi/confirm-deposit');
            }}
          >
            재예치로 진행
          </SecondaryButton>
        </>
      }
    >
      <Card>
        <p className="text-xs font-bold text-primary">오늘은 여기까지예요</p>
        <h2 className="mt-2 text-xl font-bold leading-8 text-textStrong">내일 오전 9시에 다시 확인 알림을 드릴게요.</h2>
        <p className="mt-3 text-sm leading-6 text-textBody">답이 없으면 재예치로 진행돼요. 오늘은 투자 상품 가입이 끝나지 않아요.</p>
      </Card>
      <ol className="mt-4 space-y-2 text-sm text-textBody">
        <li className="rounded-card bg-surface px-4 py-3">1. 이해도 확인을 통과했어요.</li>
        <li className="rounded-card bg-primary/10 px-4 py-3 font-semibold text-primary">2. 지금 이 자리, 하루 숙려.</li>
        <li className="rounded-card bg-surface px-4 py-3">3. 내일 최종 승인과 인증.</li>
      </ol>
    </Screen>
  );
}
