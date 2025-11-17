'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { WritingArea } from '@/components/survey/WritingArea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NegativeEventPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isCompleted, setIsCompleted] = useState(false);
  const [writingData, setWritingData] = useState<{ content: string; duration: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [participantGroup, setParticipantGroup] = useState<string>('');

  // 참여자 그룹 정보 가져오기
  useEffect(() => {
    const fetchParticipantGroup = async () => {
      try {
        const response = await fetch(`/api/check-progress?participantId=${sessionId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setParticipantGroup(data.data.groupAssignment);
        }
      } catch (error) {
        console.error('Failed to fetch participant group:', error);
      }
    };
    fetchParticipantGroup();
  }, [sessionId]);

  const prompt = `과거에 겪으셨던 힘들고 어려웠던 경험을 떠올려주세요.

그때 어떤 일이 있었는지, 어떤 감정을 느끼셨는지 자유롭게 작성해주세요.

작성 예시:
• "몇 년 전 건강이 나빠져서 병원에 입원했을 때가 떠오릅니다. 혼자서 모든 것을 해결해야 한다는 두려움과 외로움이 컸습니다."
• "배우자와 갈등이 있었던 일이 생각납니다. 이해받지 못한다는 서운함과 답답함을 느꼈습니다."
• "자녀가 멀리 이사를 가면서 자주 보지 못하게 되었습니다. 쓸쓸함과 허전함이 느껴졌습니다."

다음 질문을 참고하여 작성해주세요:
• 어떤 상황이었나요?
• 그때 어떤 생각과 감정이 드셨나요?
• 지금도 그 기억이 어떻게 느껴지시나요?

편안하게, 떠오르는 대로 작성하시면 됩니다.`;

  const handleComplete = (content: string, duration: number) => {
    console.log('Negative event writing:', { content, duration });
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
          taskType: 'negative_event',
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

      console.log('Negative event writing saved:', data);

      // 모든 그룹 공통: 중간 측정(mid-test)으로 이동
      router.push(`/survey/${sessionId}/mid-test`);

    } catch (error) {
      console.error('Writing task save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  return (
    <SurveyLayout
      currentStep={4}
      totalSteps={10}
      stepTitle="부정적 경험 회상"
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
          placeholder="이곳에 자유롭게 작성해주세요. 정답은 없으며, 솔직한 감정을 표현하시면 됩니다..."
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
