import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton, SecondaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { EXAMPLE_UTTERANCES } from '../../engine/interpret';
import { estimateHorizon, getEligibleOptions, needsHandoff } from '../../engine/rules';
import { InterpretCard } from './InterpretCard';
import {
  DATE_CHIPS,
  PURPOSE_CHIPS,
  PURPOSE_LABEL,
  TIMING_CHIPS,
  TIMING_LABEL,
  purposeNeedsDate,
  type PurposeId,
  type TimingId,
} from '../../mock/chatScripts';
import { getPersona } from '../../mock/personas';
import { useDemoStore } from '../../store/useDemoStore';

export function ChatPage() {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const personaId = useDemoStore((state) => state.personaId);
  const messages = useDemoStore((state) => state.messages);
  const chatStep = useDemoStore((state) => state.chatStep);
  const appendMessage = useDemoStore((state) => state.appendMessage);
  const setChatStep = useDemoStore((state) => state.setChatStep);
  const setAnswers = useDemoStore((state) => state.setAnswers);
  const setHandoff = useDemoStore((state) => state.setHandoff);
  const interpret = useDemoStore((state) => state.interpret);
  const validationNotes = useDemoStore((state) => state.validationNotes);
  const submitUtterance = useDemoStore((state) => state.submitUtterance);
  const answerIntentDate = useDemoStore((state) => state.answerIntentDate);
  const answerIntentTiming = useDemoStore((state) => state.answerIntentTiming);
  const confirmIntent = useDemoStore((state) => state.confirmIntent);
  const reviseIntent = useDemoStore((state) => state.reviseIntent);
  const [draft, setDraft] = useState('');
  const [pickingIndex, setPickingIndex] = useState<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, chatStep, interpret]);

  if (!personaId) return null;
  const persona = getPersona(personaId);

  const finish = () => {
    const latest = useDemoStore.getState().answers;
    const estimated = estimateHorizon(latest);
    const choice = getEligibleOptions(persona, estimated.horizon, estimated.useDate, { purpose: latest.purpose });
    appendMessage('ai', '말씀해 주신 내용으로 선택지를 골랐어요. 고르는 기준은 투자성향과 자금 기간이에요.');
    appendMessage('ai', `${choice.heard} ${choice.decision}`);
    setChatStep('closing');
  };

  const askInvest = () => {
    appendMessage('user', '투자 상품이 궁금해요');
    const decision = needsHandoff(persona, 0, { investInquiry: true });
    if (decision.handoff && decision.reason) {
      setHandoff(decision.reason);
      appendMessage(
        'ai',
        '투자 상품 문의는 나이 기준 규칙에 따라 영업점 PB나 상담원에게 연결돼요. 저는 상품을 대신 고르지 않아요.',
      );
      setChatStep('handoff');
      return;
    }
    appendMessage(
      'ai',
      '투자 상품은 자금 기간과 투자성향이 맞을 때만 선택지에 나와요. 언제 쓸 돈인지부터 알려 주실래요?',
    );
  };

  const onTiming = (id: TimingId) => {
    appendMessage('user', TIMING_LABEL[id]);
    setAnswers({ timing: id });
    appendMessage('ai', '어디에 쓰실 돈이에요?');
    setChatStep('purpose');
  };

  const onPurpose = (id: PurposeId) => {
    appendMessage('user', PURPOSE_LABEL[id]);
    setAnswers({ purpose: id });
    if (purposeNeedsDate(id)) {
      appendMessage('ai', '정해진 날짜가 있으면 골라 주세요.');
      setChatStep('date');
      return;
    }
    finish();
  };

  const onDate = (id: string) => {
    const chip = DATE_CHIPS.find((item) => item.id === id);
    appendMessage('user', chip?.label ?? id);
    setAnswers({ useDate: id === 'unknown' ? undefined : id });
    finish();
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setPickingIndex(null);
    submitUtterance(text);
  };

  const acceptIntent = () => {
    const ok = confirmIntent();
    if (!ok) return;
    setPickingIndex(null);
    finish();
  };

  const needsConfirm = interpret?.items.some((item) => item.certainty === 'NEEDS_CONFIRM') ?? true;
  const showSpeech = chatStep === 'timing' || chatStep === 'purpose' || chatStep === 'date';

  return (
    <Screen
      title="자금 용도"
      step={2}
      onBack={() => navigate('/navi/summary')}
      footer={
        chatStep === 'closing' ? (
          <PrimaryButton onClick={() => navigate('/navi/options')}>선택지 보기</PrimaryButton>
        ) : chatStep === 'handoff' ? (
          <PrimaryButton onClick={() => navigate('/navi/handoff')}>전문가에게 연결</PrimaryButton>
        ) : chatStep === 'interpret' ? (
          <div className="space-y-2">
            <PrimaryButton disabled={needsConfirm} onClick={acceptIntent}>
              이대로 맞아요
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                reviseIntent();
                setPickingIndex(null);
                appendMessage('ai', '다시 말씀해 주시거나 아래에서 골라 주세요.');
              }}
            >
              고칠게요
            </SecondaryButton>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {chatStep === 'timing'
                ? TIMING_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onTiming(chip.id as TimingId)} />)
                : null}
              {chatStep === 'purpose'
                ? PURPOSE_CHIPS.map((chip) => (
                    <Chip key={chip.id} label={chip.label} onClick={() => onPurpose(chip.id as PurposeId)} />
                  ))
                : null}
              {chatStep === 'date'
                ? DATE_CHIPS.map((chip) => <Chip key={chip.id} label={chip.label} onClick={() => onDate(chip.id)} />)
                : null}
            </div>
            {showSpeech ? (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-textWeak">직접 말하기</p>
                <div className="flex flex-wrap gap-2">
                  {['학비 반, 나머지는 이사', '내년 봄쯤 이사', '몇 년 묵혀 둘 돈'].map((label, index) => (
                    <Chip key={label} label={label} onClick={() => setDraft(EXAMPLE_UTTERANCES[index] ?? '')} />
                  ))}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendDraft();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    aria-label="직접 말하기"
                    placeholder="평소 말투로 적어 주세요"
                    className="min-h-tap min-w-0 flex-1 rounded-button border border-line bg-surface px-3 text-sm text-textStrong"
                  />
                  <button type="submit" className="min-h-tap shrink-0 rounded-button bg-primary px-3 text-sm font-semibold text-white">
                    보내기
                  </button>
                </form>
              </div>
            ) : null}
            {persona.id !== 'A' && persona.id !== 'D' && (chatStep === 'timing' || chatStep === 'purpose') ? (
              <button type="button" onClick={askInvest} className="min-h-tap text-sm font-semibold text-primary">
                투자 상품이 궁금해요
              </button>
            ) : null}
          </div>
        )
      }
    >
      <div className="space-y-3">
        {messages.map((message) => (
          <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChatBubble role={message.role}>{message.text}</ChatBubble>
          </motion.div>
        ))}
        {chatStep === 'interpret' && interpret ? (
          <InterpretCard
            items={interpret.items}
            notes={validationNotes}
            pickingIndex={pickingIndex}
            onPickDate={(index, date) => {
              answerIntentDate(index, date);
              setPickingIndex(null);
            }}
            onPickTiming={(index, label) => answerIntentTiming(index, label)}
            onAskCustomDate={setPickingIndex}
          />
        ) : null}
        <div ref={bottomRef} />
      </div>
    </Screen>
  );
}
