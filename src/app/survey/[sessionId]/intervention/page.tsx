'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { WritingArea } from '@/components/survey/WritingArea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, MessageCircle } from 'lucide-react';

// 임시: 실제로는 세션에서 집단 정보를 가져와야 함
const MOCK_GROUP: 'A' | 'B' | 'C' = 'A';

export default function InterventionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isStageCompleted, setIsStageCompleted] = useState(false);
  const [gptFeedback, setGptFeedback] = useState<string>('');

  // A집단: 3단계 (공통인류성, 자기친절, 마음챙김) + GPT 피드백
  // B집단: 3단계 (피드백 없음)
  // C집단: 1단계 (중립적 글쓰기)

  const totalStages = MOCK_GROUP === 'C' ? 1 : 3;

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

  const currentPrompt = prompts[MOCK_GROUP][currentStage - 1];

  const handleStageComplete = async (content: string, duration: number) => {
    console.log(`Stage ${currentStage} completed:`, { content, duration });

    // A집단만 GPT 피드백 받기 (목업)
    if (MOCK_GROUP === 'A') {
      // 임시 피드백 (실제로는 API 호출)
      const mockFeedback = `많은 분들이 비슷한 어려움을 경험하고 계십니다. 혼자가 아니라는 것을 기억해 주세요. 이런 경험을 통해 우리는 서로를 더 깊이 이해할 수 있습니다.`;
      setGptFeedback(mockFeedback);
    }

    setIsStageCompleted(true);
  };

  const handleNextStage = () => {
    if (currentStage < totalStages) {
      setCurrentStage(currentStage + 1);
      setIsStageCompleted(false);
      setGptFeedback('');
    } else {
      router.push(`/survey/${sessionId}/post-test`);
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
      onNext={isStageCompleted ? handleNextStage : undefined}
      nextLabel={currentStage < totalStages ? '다음 단계로' : '다음으로'}
      showFooter={isStageCompleted}
    >
      <div className="space-y-6">
        {/* 집단 정보 (목업용) */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex gap-4">
            <Sparkles className="w-7 h-7 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">{groupInfo[MOCK_GROUP].name}</h3>
              <p className="text-base text-muted-foreground">
                {groupInfo[MOCK_GROUP].description}
              </p>
              {MOCK_GROUP !== 'C' && (
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
            durationMinutes={MOCK_GROUP === 'C' ? 10 : currentStage === 3 ? 4 : 3}
            onComplete={handleStageComplete}
            autoSubmit={true}
          />
        )}

        {/* GPT 피드백 (A집단만) */}
        {isStageCompleted && MOCK_GROUP === 'A' && gptFeedback && (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/30 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI 피드백</h3>
                  <p className="text-sm text-muted-foreground">작성하신 글에 대한 응답입니다</p>
                </div>
              </div>

              <div className="bg-white/80 rounded-xl p-6 border border-primary/20">
                <p className="text-lg leading-relaxed text-foreground">
                  {gptFeedback}
                </p>
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
