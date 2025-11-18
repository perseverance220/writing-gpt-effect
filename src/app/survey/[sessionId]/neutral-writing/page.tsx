'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { WritingArea } from '@/components/survey/WritingArea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NeutralWritingPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isCompleted, setIsCompleted] = useState(false);
  const [writingData, setWritingData] = useState<{ content: string; duration: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const prompt = `오늘 하루 동안 있었던 일상적인 일들을 자유롭게 작성해주세요.

어떤 일을 하셨는지, 어디를 가셨는지, 무엇을 드셨는지 등 일상의 모습을 편안하게 적어주시면 됩니다.

작성 예시:
• "오늘 아침에는 평소보다 늦게 일어났습니다. 창문을 열어보니 날씨가 맑아서 기분이 좋았습니다."
• "점심에는 집에서 된장찌개를 끓여 먹었습니다. 저녁에는 산책을 나갔다가 이웃을 만나 인사를 나눴습니다."
• "오늘은 책을 읽으며 시간을 보냈습니다. 저녁에는 TV에서 뉴스를 봤습니다."

다음 질문을 참고하여 작성해주세요:
• 오늘 어떤 활동을 하셨나요?
• 어떤 음식을 드셨나요?
• 누구를 만나셨나요?

떠오르는 대로 편안하게 작성해주세요.`;

  const handleComplete = (content: string, duration: number) => {
    console.log('Neutral writing:', { content, duration });
    setWritingData({ content, duration });
    setIsCompleted(true);
  };

  const handleNext = async () => {
    if (!writingData) return;

    setIsSaving(true);
    setError('');

    try {
      // 글쓰기 내용 저장
      const response = await fetch('/api/save-writing-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          taskType: 'neutral',
          writingContent: writingData.content,
          wordCount: writingData.content.length,
          durationSeconds: writingData.duration,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '글쓰기 내용 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      console.log('Neutral writing saved:', data);

      // C 그룹: 중립 글쓰기 후 사후 측정(post-test)으로 이동
      router.push(`/survey/${sessionId}/post-test/self-compassion`);

    } catch (error) {
      console.error('Writing task save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  return (
    <SurveyLayout
      currentStep={7}
      totalSteps={13}
      stepTitle="일상 글쓰기"
      onNext={isCompleted ? handleNext : undefined}
      nextLabel={isSaving ? "저장 중..." : "다음으로"}
      showFooter={isCompleted}
      isNextDisabled={isSaving}
    >
      <div className="space-y-4">
        <WritingArea
          prompt={prompt}
          durationMinutes={10}
          onComplete={handleComplete}
          placeholder="이곳에 자유롭게 작성해주세요. 오늘 하루 일상을 편안하게 표현하시면 됩니다..."
          autoSubmit={true}
          isDevelopment={true} // TODO: 배포 시 false로 변경
        />

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertDescription className="text-lg font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SurveyLayout>
  );
}
