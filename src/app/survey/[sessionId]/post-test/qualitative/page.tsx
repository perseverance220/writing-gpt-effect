'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare } from 'lucide-react';

// 그룹별 2번 질문
const groupSpecificQuestions: Record<string, string> = {
  'A': 'ChatGPT 피드백을 받으며 자기자비 글쓰기를 하신 경험이 어떠셨나요? 피드백이 도움이 되었나요?',
  'B': '피드백 없이 자기자비 글쓰기를 하신 경험이 어떠셨나요? 스스로 자기자비를 실천하는 것이 어떠셨나요?',
  'C': '오늘의 일상에 대해 글을 쓰신 경험이 어떠셨나요?',
};

export default function QualitativePage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [participantGroup, setParticipantGroup] = useState<string>('');
  const [responses, setResponses] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 참여자 그룹 확인
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

  // 모든 질문이 답변되었는지 확인 (최소 10자 이상)
  const isFormComplete = Object.values(responses).every((r) => r.trim().length >= 10);

  const handleNext = async () => {
    if (!isFormComplete) return;

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/save-qualitative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          responses,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '서술형 응답 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      console.log('Qualitative responses saved:', data);

      // 다음 페이지로 이동 (인터뷰 의향 및 계좌 정보)
      router.push(`/survey/${sessionId}/post-test/interview-payment`);
    } catch (error) {
      console.error('Qualitative save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  const getQ2Text = () => {
    return groupSpecificQuestions[participantGroup] || groupSpecificQuestions['C'];
  };

  const responseCount = Object.values(responses).filter((r) => r.trim().length >= 10).length;

  return (
    <SurveyLayout
      currentStep={12}
      totalSteps={13}
      stepTitle="소감 및 경험"
      onNext={handleNext}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : "다음"}
    >
      <div className="space-y-5">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <MessageSquare className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">설문 소감</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                오늘 경험하신 내용에 대해 자유롭게 작성해주세요.<br />
                각 질문당 <strong>최소 10자 이상</strong> 작성해주시면 됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold">응답 완료</span>
            <span className="text-xl font-bold text-primary">
              {responseCount} / 6
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(responseCount / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문들 */}
        <div className="space-y-5">
          {/* Q1 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                1. 부정적 경험을 떠올리고 글을 쓰는 과정이 어떠셨나요?
              </Label>
              <Textarea
                value={responses.q1}
                onChange={(e) => setResponses({ ...responses, q1: e.target.value })}
                placeholder="예: 처음에는 힘들었지만, 글을 쓰면서 조금씩 마음이 정리되는 느낌이었습니다..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q1.length}자 {responses.q1.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>

          {/* Q2 - 그룹별 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                2. {getQ2Text()}
              </Label>
              <Textarea
                value={responses.q2}
                onChange={(e) => setResponses({ ...responses, q2: e.target.value })}
                placeholder="오늘의 경험에 대해 자유롭게 작성해주세요..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q2.length}자 {responses.q2.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>

          {/* Q3 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                3. 불안이나 스트레스에 변화가 있으셨나요? 어떤 변화가 있었는지 말씀해주세요.
              </Label>
              <Textarea
                value={responses.q3}
                onChange={(e) => setResponses({ ...responses, q3: e.target.value })}
                placeholder="예: 조금 마음이 가벼워진 것 같습니다... 또는 아직 큰 변화는 없는 것 같습니다..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q3.length}자 {responses.q3.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>

          {/* Q4 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                4. 자기 자신을 돌보는 것에 대해 어떻게 생각하시나요?
              </Label>
              <Textarea
                value={responses.q4}
                onChange={(e) => setResponses({ ...responses, q4: e.target.value })}
                placeholder="예: 나 자신을 돌보는 것이 이기적이라고 생각했는데, 필요한 것이라는 생각이 들었습니다..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q4.length}자 {responses.q4.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>

          {/* Q5 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                5. 온라인으로 진행된 이 프로그램 경험이 어떠셨나요?
              </Label>
              <Textarea
                value={responses.q5}
                onChange={(e) => setResponses({ ...responses, q5: e.target.value })}
                placeholder="예: 집에서 편하게 할 수 있어서 좋았습니다... 또는 직접 만나는 것이 더 좋을 것 같습니다..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q5.length}자 {responses.q5.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>

          {/* Q6 */}
          <Card className="border-2 border-border rounded-xl shadow-sm p-5">
            <div className="space-y-3">
              <Label className="text-lg font-bold block">
                6. 오늘의 경험이 일상생활에 어떤 영향을 미칠 것 같으신가요?
              </Label>
              <Textarea
                value={responses.q6}
                onChange={(e) => setResponses({ ...responses, q6: e.target.value })}
                placeholder="예: 앞으로 나를 좀 더 이해하고 돌보려고 노력할 것 같습니다..."
                className="min-h-[120px] text-base border-2 rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {responses.q6.length}자 {responses.q6.length >= 10 ? '✓' : '(최소 10자)'}
              </p>
            </div>
          </Card>
        </div>

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
