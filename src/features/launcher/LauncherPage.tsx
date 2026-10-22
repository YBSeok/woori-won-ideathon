import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SecondaryButton } from '../../components/ui/Buttons';
import { PERSONAS } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

const principles = [
  ['안전한 기본값', '무응답이면 재예치'],
  ['위험할수록 절차', '투자는 숙려까지'],
  ['AI는 해석', '판단은 규칙'],
  ['취약 고객', '사람에게 연결'],
];

export function LauncherPage() {
  const navigate = useNavigate();
  const selectPersona = useDemoStore((state) => state.selectPersona);
  const engineOn = useDemoStore((state) => state.enginePanelEnabled);
  const setEngine = useDemoStore((state) => state.setEnginePanelEnabled);

  return (
    <div className="h-full overflow-y-auto bg-bg px-5 py-5">
      <p className="text-sm font-semibold text-primary">우리WON뱅킹</p>
      <h1 className="mt-1 text-[26px] font-bold leading-8 text-textStrong">WON하는 만기</h1>
      <p className="mt-2 text-sm leading-6 text-textBody">
        만기 자금이 고객이 이해한 만큼만, 우리은행 상품 안에서 다음 자리를 찾게 하는 시연이에요.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {principles.map(([title, detail]) => (
          <li key={title} className="rounded-card bg-surface px-3 py-2 shadow-card">
            <p className="text-[13px] font-bold text-textStrong">{title}</p>
            <p className="text-xs text-textBody">{detail}</p>
          </li>
        ))}
      </ul>
      <h2 className="mb-2 mt-5 text-sm font-bold text-textStrong">시연할 고객</h2>
      <div className="space-y-3">
        {PERSONAS.map((persona) => (
          <Card key={persona.id} className="p-0">
            <button
              type="button"
              className="w-full p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              onClick={() => {
                selectPersona(persona.id);
                navigate('/home');
              }}
            >
              <div className="flex items-center gap-2">
                <Badge tone="neutral">페르소나 {persona.id}</Badge>
                <span className="text-[15px] font-bold text-textStrong">
                  {persona.name} · {persona.age}세
                </span>
              </div>
              <p className="mt-1 text-[13px] text-textBody">{persona.riskProfile} · 정기예금</p>
              <p className="mt-2 text-sm leading-6 text-textStrong">{persona.outcome}</p>
              <span className="mt-3 inline-flex min-h-tap items-center text-sm font-bold text-primary">이 고객으로 시작</span>
            </button>
          </Card>
        ))}
      </div>
      <div className="mt-4 space-y-2 pb-4">
        <SecondaryButton onClick={() => navigate('/simulator')}>수익성 시뮬레이터 보기</SecondaryButton>
        <SecondaryButton onClick={() => navigate('/navi/no-response')}>무응답이면 어떻게 되나요</SecondaryButton>
        <button
          type="button"
          aria-pressed={engineOn}
          onClick={() => setEngine(!engineOn)}
          className="flex min-h-tap w-full items-center justify-between rounded-button border border-line bg-surface px-4 text-sm font-semibold text-textStrong"
        >
          <span>엔진 패널 {engineOn ? '끄기' : '켜기'}</span>
          <span className={`relative h-6 w-11 rounded-chip ${engineOn ? 'bg-primary' : 'bg-line'}`}>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition ${engineOn ? 'left-5' : 'left-0.5'}`}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
