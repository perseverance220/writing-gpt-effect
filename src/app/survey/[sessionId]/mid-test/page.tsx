'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { QuestionnaireItem } from '@/components/survey/QuestionnaireItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Info } from 'lucide-react';
import { PANAS_SF_10_QUESTIONS, PANAS_OPTIONS, calculatePANASScores } from '@/lib/questionnaires/panas-sf-10';

export default function MidTestPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [panasResponses, setPanasResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [participantGroup, setParticipantGroup] = useState<string>('');

  const isFormComplete = PANAS_SF_10_QUESTIONS.every((q) => panasResponses[q.id]);

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

  const handleNext = async () => {
    if (!isFormComplete) return;

    setIsSaving(true);
    setError('');

    try {
      const scores = calculatePANASScores(panasResponses);
      console.log('Mid-test PANAS scores:', scores);

      // API로 전송
      const response = await fetch('/api/save-mid-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          responses: panasResponses,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '중간 검사 결과 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      console.log('Mid-test completed and saved:', data);

      // 그룹에 따라 다음 페이지 결정
      if (participantGroup === 'C') {
        // C 그룹은 중립 글쓰기로 이동
        router.push(`/survey/${sessionId}/neutral-writing`);
      } else {
        // A, B 그룹은 자기자비 글쓰기로 이동
        router.push(`/survey/${sessionId}/intervention`);
      }
    } catch (error) {
      console.error('Mid-test save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  const answeredQuestions = Object.keys(panasResponses).length;
  const progressPercent = Math.round((answeredQuestions / PANAS_SF_10_QUESTIONS.length) * 100);

  return (
    <SurveyLayout
      currentStep={7}
      totalSteps={13}
      stepTitle="중간 검사"
      onNext={handleNext}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : "다음"}
    >
      <div className="space-y-8">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-2xl p-6">
          <div className="flex gap-4">
            <Heart className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="text-xl font-bold">잠시 멈추고 현재 감정 체크</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                힘든 경험을 떠올리신 <strong>지금 현재</strong>, 어떤 감정을 느끼고 계신지 답변해주세요.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Info className="w-4 h-4" />
                <span>진행률: {answeredQuestions} / {PANAS_SF_10_QUESTIONS.length} 문항 ({progressPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANAS 질문들 */}
        <div className="space-y-6">
          <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">정서 상태 검사 (10문항)</h3>
            <p className="text-base text-muted-foreground">
              <strong>지금 이 순간</strong> 다음과 같은 감정을 얼마나 느끼고 계신지 답변해주세요.
            </p>
          </div>

          {PANAS_SF_10_QUESTIONS.map((question, index) => (
            <div key={question.id} className="space-y-3 bg-white border-2 border-border rounded-xl shadow-sm p-5">
              <div className="text-lg font-bold">
                {index + 1}. 지금 현재 <span className="text-primary">&ldquo;{question.text}&rdquo;</span> 느낌이 드시나요?
              </div>
              <QuestionnaireItem
                questionNumber={0}
                questionText=""
                value={panasResponses[question.id] || ''}
                onChange={(value) => setPanasResponses({ ...panasResponses, [question.id]: value })}
                options={PANAS_OPTIONS}
              />
            </div>
          ))}
        </div>

        {/* 완료 알림 */}
        {isFormComplete && !error && (
          <Alert className="bg-primary/5 border-primary/30">
            <Heart className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base font-medium">
              모든 문항에 답변하셨습니다.
            </AlertDescription>
          </Alert>
        )}

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
