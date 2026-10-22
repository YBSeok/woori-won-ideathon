import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ExampleBadge } from '../../components/ui/Badge';
import { buildEngineSnapshot } from '../../engine/rules';
import { getPersona } from '../../mock/personas';
import { INVEST_ID, PIPELINE_PRODUCT, REDEPOSIT_ID } from '../../mock/products';
import { sameQuestionFailCount, useDemoStore } from '../../store/useDemoStore';

export function EnginePanel() {
  const enabled = useDemoStore((state) => state.enginePanelEnabled);
  const expanded = useDemoStore((state) => state.enginePanelExpanded);
  const setExpanded = useDemoStore((state) => state.setEnginePanelExpanded);
  const personaId = useDemoStore((state) => state.personaId);
  const answers = useDemoStore((state) => state.answers);
  const quizFails = useDemoStore((state) => state.quizFails);
  const investInquiry = useDemoStore((state) => state.investInquiry);
  const handoffReason = useDemoStore((state) => state.handoffReason);
  const guard = useDemoStore((state) => state.guard);
  const interpret = useDemoStore((state) => state.interpret);
  const validationNotes = useDemoStore((state) => state.validationNotes);
  const intentConfirmed = useDemoStore((state) => state.intentConfirmed);
  const confirmedAt = useDemoStore((state) => state.confirmedAt);
  const splitLegs = useDemoStore((state) => state.splitLegs);
  const location = useLocation();

  if (!enabled) return null;

  const snapshot = personaId
    ? buildEngineSnapshot({
        persona: getPersona(personaId),
        answers,
        quizFailCount: sameQuestionFailCount(quizFails),
        investInquiry: investInquiry || handoffReason === 'RULE_ELDERLY_HANDOFF',
      })
    : null;
  if (snapshot && splitLegs && splitLegs.length >= 2 && !snapshot.options.appliedRules.includes('RULE_SPLIT_BY_PURPOSE')) {
    snapshot.options.appliedRules.push('RULE_SPLIT_BY_PURPOSE');
  }

  return (
    <section className={`shrink-0 bg-textStrong text-white ${expanded ? 'h-[46%]' : 'h-11'}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex h-11 w-full items-center justify-between px-4 text-left text-[13px] font-bold"
      >
        <span>엔진 패널 · {location.pathname}</span>
        {expanded ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}
      </button>
      {expanded ? (
        <div className="h-[calc(100%-44px)] space-y-3 overflow-y-auto px-4 pb-4 text-[12px] leading-5">
          <p className="sticky top-0 bg-textStrong py-1 font-bold">
            LLM 담당: 발화 해석·문장 생성 / LLM 비담당: 상품 결정·수치 생성·거래 실행
          </p>
          {!snapshot ? (
            <p>고객을 고르면 규칙 엔진의 반환값이 여기 나타나요.</p>
          ) : (
            <>
              <Block title="입력 가드 결과">
                {!guard ? '아직 발화가 없어요.' : guard.ok ? '통과' : `차단 · ${guard.code}`}
              </Block>
              <Block title="LLM 출력 (mock)">
                <pre className="whitespace-pre-wrap break-all">{interpret ? JSON.stringify(interpret, null, 2) : '없음'}</pre>
              </Block>
              <Block title="스키마 검증">
                {!interpret ? '아직 없음' : validationNotes.length ? validationNotes.join(' ') : '통과'}
              </Block>
              <Block title="고객 확인 여부">{intentConfirmed ? `확인함 · ${confirmedAt}` : '아직'}</Block>
              <Block title="만기 이탈 예측">
                이탈 확률 {Math.round(snapshot.churn.probability * 100)}% <ExampleBadge /> · 개입 우선순위{' '}
                {snapshot.churn.priority}
              </Block>
              <Block title="자금 용도·기간 추정">
                {snapshot.horizon.horizon} · 용도 {snapshot.purposeText} · 기간 {snapshot.timingText}
                {snapshot.horizon.useDate ? ` · 사용 예정일 ${snapshot.horizon.useDate}` : ''}
              </Block>
              <Block title="적합도 추천">
                {snapshot.scores
                  .filter((score) => (personaId !== 'A' && personaId !== 'D') || score.productId !== INVEST_ID)
                  .map((score) => (
                  <p key={score.productId}>
                    {score.name} {score.score}점{score.excluded ? ` · 제외 · ${score.reason}` : ''}
                    {score.productId === REDEPOSIT_ID ? ' · 기본 선택' : ''}
                  </p>
                ))}
                <p className="mt-1 text-white/80">점수가 높아도 기본 선택은 재예치로 고정돼요.</p>
              </Block>
              <Block title="적용된 규칙">
                {snapshot.options.appliedRules.map((rule) => (
                  <p key={rule}>{rule}</p>
                ))}
                <p>핸드오프 {snapshot.handoff.handoff ? snapshot.handoff.reasons.join(', ') : '없음'}</p>
              </Block>
              <Block title="연결 예정 상품">
                {PIPELINE_PRODUCT.name} · {PIPELINE_PRODUCT.note}. 화면 선택지에는 나오지 않아요.
              </Block>
              <Block title="LLM 범위">
                <p>담당: {snapshot.llm.does.join(', ')}</p>
                <p>비담당: {snapshot.llm.doesNot.join(', ')}</p>
              </Block>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-bold text-white">{title}</p>
      <div className="text-white/85">{children}</div>
    </div>
  );
}
