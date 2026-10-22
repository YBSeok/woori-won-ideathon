import { Bell, Landmark, PiggyBank, TicketPercent, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AmountText } from '../../components/ui/AmountText';
import { Badge } from '../../components/ui/Badge';
import { BottomTabBar, type TabId } from '../../components/ui/BottomTabBar';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { ProgressSteps } from '../../components/ui/ProgressSteps';
import { formatManWon } from '../../lib/format';
import { daysUntil, getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

const quick = [
  { label: '이체', icon: Wallet },
  { label: '상품', icon: Landmark },
  { label: '혜택', icon: TicketPercent },
  { label: '자산', icon: PiggyBank },
];

export function HomePage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const showToast = useDemoStore((state) => state.showToast);
  if (!personaId) return null;
  const persona = getPersona(personaId);
  const dday = daysUntil(persona.maturityDate);

  const onTab = (id: TabId) => {
    if (id === 'home') return;
    showToast('데모에서는 만기 내비만 이동할 수 있어요.');
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
        <p className="text-[13px] font-bold text-primary">우리WON뱅킹</p>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[22px] font-bold text-textStrong">{persona.name}님</h1>
          <button type="button" className="min-h-tap text-sm font-semibold text-textBody" onClick={() => navigate('/')}>
            시연 처음
          </button>
        </div>
        <Card className="mt-3">
          <p className="text-[13px] text-textBody">만기 예정 {persona.productName}</p>
          <div className="mt-1">
            <AmountText value={persona.principal} />
          </div>
          <p className="mt-1 text-sm text-textBody">만기일 {persona.maturityDate.replaceAll('-', '.')} · D-{dday}</p>
        </Card>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quick.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => showToast('데모에서는 만기 내비만 이동할 수 있어요.')}
                className="flex min-h-tap flex-col items-center justify-center gap-1 rounded-card bg-surface py-2 text-xs font-semibold text-textStrong shadow-card"
              >
                <Icon size={18} className="text-primary" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-bold text-textStrong">
          <Bell size={16} aria-hidden /> 알림
        </div>
        <Card className="mt-2 border border-primary/20">
          <div className="flex items-center gap-2">
            <Badge tone="ai">만기 내비</Badge>
            <Badge tone="neutral">D-{dday}</Badge>
          </div>
          <p className="mt-2 text-[16px] font-bold leading-6 text-textStrong">
            {persona.productName} 만기가 {dday}일 남았어요
          </p>
          <p className="mt-1 text-sm text-textBody">{formatManWon(persona.principal)}</p>
          <div className="mt-3">
            <PrimaryButton onClick={() => navigate('/navi/summary')}>어떻게 할지 같이 정해요</PrimaryButton>
          </div>
          <div className="mt-3">
            <ProgressSteps current={1} />
          </div>
        </Card>
      </div>
      <BottomTabBar active="home" onChange={onTab} />
    </div>
  );
}
