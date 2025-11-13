'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { WritingArea } from '@/components/survey/WritingArea';

export default function NegativeEventPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isCompleted, setIsCompleted] = useState(false);

  const prompt = `과거에 겪으셨던 힘들고 어려웠던 경험을 떠올려주세요.

그때 어떤 일이 있었는지, 어떤 감정을 느끼셨는지 자유롭게 작성해주세요.

• 어떤 상황이었나요?
• 그때 어떤 생각과 감정이 드셨나요?
• 지금도 그 기억이 어떻게 느껴지시나요?

편안하게, 떠오르는 대로 작성하시면 됩니다.`;

  const handleComplete = (content: string, duration: number) => {
    console.log('Negative event writing:', { content, duration });
    setIsCompleted(true);
  };

  const handleNext = () => {
    router.push(`/survey/${sessionId}/mid-test`);
  };

  return (
    <SurveyLayout
      currentStep={4}
      totalSteps={10}
      stepTitle="부정적 경험 회상"
      onNext={isCompleted ? handleNext : undefined}
      nextLabel="다음으로"
      showFooter={isCompleted}
    >
      <WritingArea
        prompt={prompt}
        durationMinutes={10}
        onComplete={handleComplete}
        placeholder="이곳에 자유롭게 작성해주세요. 정답은 없으며, 솔직한 감정을 표현하시면 됩니다..."
        autoSubmit={true}
      />
    </SurveyLayout>
  );
}
