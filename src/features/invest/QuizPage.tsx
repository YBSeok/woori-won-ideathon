import { Navigate, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { needsHandoff } from '../../engine/rules';
import { QUIZ } from '../../mock/quiz';
import { getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function QuizPage() {
  const navigate = useNavigate();
  const personaId = useDemoStore((state) => state.personaId);
  const quizIndex = useDemoStore((state) => state.quizIndex);
  const quizExplain = useDemoStore((state) => state.quizExplain);
  const missQuiz = useDemoStore((state) => state.missQuiz);
  const setQuizExplain = useDemoStore((state) => state.setQuizExplain);
  const clearQuizExplain = useDemoStore((state) => state.clearQuizExplain);
  const advanceQuiz = useDemoStore((state) => state.advanceQuiz);
  const markInvest = useDemoStore((state) => state.markInvest);
  const addConsent = useDemoStore((state) => state.addConsent);
  const setHandoff = useDemoStore((state) => state.setHandoff);
  const handoffReason = useDemoStore((state) => state.handoffReason);
  if (!personaId) return null;
  if (handoffReason === 'RULE_QUIZ_FAIL_HANDOFF') return <Navigate to="/navi/handoff" replace />;
  const persona = getPersona(personaId);
  const question = QUIZ[quizIndex];
  if (!question) return null;

  const choose = (choiceId: string) => {
    const choice = question.choices.find((item) => item.id === choiceId);
    if (!choice || quizExplain) return;
    if (choice.correct) {
      if (quizIndex >= QUIZ.length - 1) {
        addConsent('이해도 확인 문항을 통과했어요.');
        markInvest('quiz');
        navigate('/navi/invest/cooling');
        return;
      }
      advanceQuiz();
      return;
    }
    const fails = missQuiz(question.id);
    const decision = needsHandoff(persona, fails);
    if (decision.handoff && decision.reason) {
      setHandoff(decision.reason);
      addConsent('같은 문항을 두 번 틀려 사람 연결로 바꿨어요.');
      navigate('/navi/handoff');
      return;
    }
    setQuizExplain(question.explain);
  };

  return (
    <Screen
      title={`이해도 확인 ${quizIndex + 1}/${QUIZ.length}`}
      step={4}
      onBack={() => navigate('/navi/invest/explain')}
      footer={
        quizExplain ? (
          <PrimaryButton onClick={() => clearQuizExplain()}>같은 문항 다시 확인</PrimaryButton>
        ) : null
      }
    >
      <p className="text-sm leading-6 text-textBody">틀려도 바로 막지 않아요. 같은 문항을 두 번 틀리면 전문가에게 연결해요.</p>
      <h2 className="mt-3 text-lg font-bold leading-7 text-textStrong">{question.prompt}</h2>
      <div className="mt-3 space-y-2">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={Boolean(quizExplain)}
            onClick={() => choose(choice.id)}
            className="min-h-tap w-full rounded-card bg-surface px-4 py-3 text-left text-sm font-semibold text-textStrong shadow-card disabled:opacity-60"
          >
            {choice.label}
          </button>
        ))}
      </div>
      {quizExplain ? (
        <Card className="mt-4">
          <p className="text-sm font-bold text-textStrong">쉽게 다시 설명할게요</p>
          <p className="mt-1 text-sm leading-6 text-textBody">{quizExplain}</p>
        </Card>
      ) : null}
    </Screen>
  );
}
