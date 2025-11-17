'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { WritingArea } from '@/components/survey/WritingArea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function InterventionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [groupAssignment, setGroupAssignment] = useState<'A' | 'B' | 'C' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isStageCompleted, setIsStageCompleted] = useState(false);
  const [gptFeedback, setGptFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [feedbackMetadata, setFeedbackMetadata] = useState<{
    tokensUsed?: number;
    responseTimeMs?: number;
    systemPrompt?: string;
    userPrompt?: string;
  }>({});

  // A집단: 3단계 (공통인류성, 자기친절, 마음챙김) + GPT 피드백
  // B집단: 3단계 (피드백 없음)
  // C집단: 1단계 (중립적 글쓰기)

  // 참여자 그룹 정보 가져오기
  useEffect(() => {
    const fetchGroupAssignment = async () => {
      try {
        const response = await fetch(`/api/check-progress?participantId=${sessionId}`);
        const result = await response.json();

        if (result.success && result.data.groupAssignment) {
          setGroupAssignment(result.data.groupAssignment as 'A' | 'B' | 'C');
        } else {
          console.error('Failed to fetch group assignment');
          router.push(`/survey/${sessionId}/consent`);
        }
      } catch (error) {
        console.error('Error fetching group assignment:', error);
        router.push(`/survey/${sessionId}/consent`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupAssignment();
  }, [sessionId, router]);

  if (isLoading || !groupAssignment) {
    return (
      <SurveyLayout currentStep={6} totalSteps={10} stepTitle="글쓰기 활동">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SurveyLayout>
    );
  }

  const totalStages = groupAssignment === 'C' ? 1 : 3;

  const prompts = {
    A: [
      {
        title: '공통인류성 (Common Humanity)',
        content: `방금 떠올린 힘든 경험에 대해 생각해보세요.

이런 어려움은 당신만의 것이 아니며, 많은 사람들이 비슷한 경험을 합니다.

• 다른 사람들도 이런 어려움을 겪을 수 있다는 것을 생각해보세요
• 이것은 인간이라면 누구나 겪을 수 있는 경험입니다
• 혼자가 아님을 떠올리며 작성해주세요`,
      },
      {
        title: '자기친절 (Self-Kindness)',
        content: `이제 당신 자신에게 친절하게 말을 걸어보세요.

마치 가까운 친구가 같은 어려움을 겪고 있다면 어떻게 위로할지 생각하며, 자신에게 그렇게 말해주세요.

• 자신을 비난하지 말고, 따뜻하게 대해주세요
• "나는 최선을 다했어" 같은 격려의 말을 건네보세요
• 스스로를 돌보는 것은 이기적인 것이 아닙니다`,
      },
      {
        title: '마음챙김 (Mindfulness)',
        content: `지금 이 순간의 감정을 있는 그대로 관찰해보세요.

판단하지 말고, 그저 느끼고 인정해주세요.

• 지금 어떤 감정이 드시나요?
• 그 감정을 억누르지 말고, 있는 그대로 느껴보세요
• 모든 감정은 자연스러운 것입니다`,
      },
    ],
    B: [
      {
        title: '공통인류성',
        content: `방금 떠올린 힘든 경험에 대해 생각해보세요.

이런 어려움은 당신만의 것이 아니며, 많은 사람들이 비슷한 경험을 합니다.

• 다른 사람들도 이런 어려움을 겪을 수 있다는 것을 생각해보세요
• 이것은 인간이라면 누구나 겪을 수 있는 경험입니다
• 혼자가 아님을 떠올리며 작성해주세요`,
      },
      {
        title: '자기친절',
        content: `이제 당신 자신에게 친절하게 말을 걸어보세요.

마치 가까운 친구가 같은 어려움을 겪고 있다면 어떻게 위로할지 생각하며, 자신에게 그렇게 말해주세요.

• 자신을 비난하지 말고, 따뜻하게 대해주세요
• "나는 최선을 다했어" 같은 격려의 말을 건네보세요
• 스스로를 돌보는 것은 이기적인 것이 아닙니다`,
      },
      {
        title: '마음챙김',
        content: `지금 이 순간의 감정을 있는 그대로 관찰해보세요.

판단하지 말고, 그저 느끼고 인정해주세요.

• 지금 어떤 감정이 드시나요?
• 그 감정을 억누르지 말고, 있는 그대로 느껴보세요
• 모든 감정은 자연스러운 것입니다`,
      },
    ],
    C: [
      {
        title: '일상 활동 기록',
        content: `지난 일주일 동안 하신 활동들을 자세히 설명해주세요.

• 어떤 일과로 하루를 보내셨나요?
• 어떤 활동들을 하셨나요?
• 누구를 만나셨나요?

가능한 구체적으로, 사실 그대로 작성해주세요.`,
      },
    ],
  };

  const currentPrompt = prompts[groupAssignment][currentStage - 1];

  const handleStageComplete = async (content: string, duration: number) => {
    console.log(`Stage ${currentStage} completed:`, { content, duration });

    // 먼저 완료 상태로 전환
    setIsStageCompleted(true);

    // A집단만 GPT 피드백 받기
    if (groupAssignment === 'A') {
      setIsLoadingFeedback(true);

      try {
        console.log('[intervention] Requesting GPT feedback...');
        const response = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userWriting: content,
            stage: currentStage
          }),
        });

        const result = await response.json();

        console.log('[intervention] Full API response:', result);

        if (!response.ok || !result.success) {
          console.error('[intervention] GPT API error:', result);
          throw new Error(result.error || 'Failed to generate feedback');
        }

        console.log('[intervention] GPT feedback received:', {
          feedback: result.feedback,
          feedbackLength: result.feedback?.length,
          tokensUsed: result.metadata?.tokensUsed,
          responseTime: result.metadata?.responseTimeMs,
        });

        // 피드백 설정
        if (result.feedback) {
          console.log('[intervention] Setting feedback state with:', result.feedback.substring(0, 100));
          setGptFeedback(result.feedback);
        } else {
          console.error('[intervention] No feedback in result!');
        }
        setFeedbackMetadata(result.metadata);

        // GPT 피드백과 글쓰기 데이터를 DB에 저장
        const taskTypeMap: Record<number, string> = {
          1: 'common_humanity',
          2: 'self_kindness',
          3: 'mindfulness',
        };

        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

        console.log('[intervention] Saving intervention data with GPT feedback...');
        const saveResponse = await fetch('/api/save-intervention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: sessionId,
            taskType: taskTypeMap[currentStage],
            writingContent: content,
            wordCount,
            durationSeconds: duration,
            gptFeedback: result.feedback,
            gptPrompt: `${result.metadata.systemPrompt}\n\n${result.metadata.userPrompt}`,
            modelVersion: 'gpt-5-mini',
            tokensUsed: result.metadata.tokensUsed,
            responseTimeMs: result.metadata.responseTimeMs,
          }),
        });

        const saveResult = await saveResponse.json();
        if (saveResponse.ok) {
          console.log('[intervention] Data saved successfully:', saveResult);
        } else {
          console.error('[intervention] Save failed:', saveResult);
        }
      } catch (error) {
        console.error('[intervention] Error generating feedback:', error);
        setGptFeedback('피드백 생성 중 오류가 발생했습니다. 다음 단계로 진행해주세요.');
      } finally {
        setIsLoadingFeedback(false);
      }
    } else {
      // B, C 집단은 피드백 없이 글쓰기만 저장
      const taskTypeMap: Record<number, string> = {
        1: groupAssignment === 'C' ? 'neutral' : 'common_humanity',
        2: 'self_kindness',
        3: 'mindfulness',
      };

      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

      try {
        console.log('[intervention] Saving intervention data (no GPT feedback)...');
        const saveResponse = await fetch('/api/save-intervention', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: sessionId,
            taskType: taskTypeMap[currentStage],
            writingContent: content,
            wordCount,
            durationSeconds: duration,
          }),
        });

        const saveResult = await saveResponse.json();
        if (saveResponse.ok) {
          console.log('[intervention] Data saved successfully:', saveResult);
        } else {
          console.error('[intervention] Save failed:', saveResult);
        }
      } catch (error) {
        console.error('[intervention] Error saving intervention:', error);
      }
    }
  };

  const handleNextStage = () => {
    if (currentStage < totalStages) {
      setCurrentStage(currentStage + 1);
      setIsStageCompleted(false);
      setGptFeedback('');
    } else {
      router.push(`/survey/${sessionId}/post-test/self-compassion`);
    }
  };

  const groupInfo = {
    A: { name: 'A집단', description: '자기자비 글쓰기 + AI 피드백' },
    B: { name: 'B집단', description: '자기자비 글쓰기' },
    C: { name: 'C집단', description: '중립적 글쓰기' },
  };

  return (
    <SurveyLayout
      currentStep={6}
      totalSteps={10}
      stepTitle={`글쓰기 활동 (${currentStage}/${totalStages})`}
      onNext={isStageCompleted && !isLoadingFeedback ? handleNextStage : undefined}
      nextLabel={currentStage < totalStages ? '다음 단계로' : '다음으로'}
      showFooter={isStageCompleted}
    >
      <div className="space-y-6">
        {/* 집단 정보 */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex gap-4">
            <Sparkles className="w-7 h-7 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">{groupInfo[groupAssignment].name}</h3>
              <p className="text-base text-muted-foreground">
                {groupInfo[groupAssignment].description}
              </p>
              {groupAssignment !== 'C' && (
                <p className="text-sm text-primary font-medium mt-2">
                  {currentStage}/3단계: {currentPrompt.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 글쓰기 영역 */}
        {!isStageCompleted && (
          <WritingArea
            prompt={currentPrompt.content}
            durationMinutes={groupAssignment === 'C' ? 10 : 3}
            onComplete={handleStageComplete}
            autoSubmit={true}
            isDevelopment={true}
          />
        )}

        {/* GPT 피드백 (A집단만) */}
        {isStageCompleted && groupAssignment === 'A' && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/30 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI 피드백</h3>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingFeedback ? '피드백을 생성하고 있습니다...' : '작성하신 글에 대한 응답입니다'}
                  </p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-6 border border-primary/20 min-h-[120px]">
                {isLoadingFeedback && !gptFeedback ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                    {gptFeedback || '피드백을 기다리는 중...'}
                    {isLoadingFeedback && <span className="inline-block w-2 h-5 bg-primary/50 animate-pulse ml-1"></span>}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 완료 메시지 */}
        {isStageCompleted && (
          <Alert className="bg-primary/5 border-primary/30">
            <Sparkles className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base font-medium">
              {currentStage < totalStages
                ? `${currentStage}단계가 완료되었습니다. 다음 단계로 진행해주세요.`
                : '모든 글쓰기 활동이 완료되었습니다. 수고하셨습니다!'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SurveyLayout>
  );
}
