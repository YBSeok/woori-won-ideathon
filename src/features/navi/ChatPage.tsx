import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Chip } from '../../components/ui/Chip';
import { PrimaryButton } from '../../components/ui/Buttons';
import { Screen } from '../../components/ui/Screen';
import { needsHandoff } from '../../engine/rules';
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, chatStep]);

  if (!personaId) return null;
  const persona = getPersona(personaId);

  const finish = () => {
    appendMessage('ai', '말씀해 주신 내용으로 선택지를 골랐어요. 고르는 기준은 투자성향과 자금 기간이에요.');
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
            {persona.id !== 'A' && (chatStep === 'timing' || chatStep === 'purpose') ? (
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
        <div ref={bottomRef} />
      </div>
    </Screen>
  );
}
