'use client';

import { useState } from 'react';
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

  const isFormComplete = PANAS_SF_10_QUESTIONS.every((q) => panasResponses[q.id]);

  const handleNext = () => {
    if (isFormComplete) {
      const scores = calculatePANASScores(panasResponses);
      console.log('Mid-test PANAS scores:', scores);

      router.push(`/survey/${sessionId}/intervention`);
    }
  };

  const answeredQuestions = Object.keys(panasResponses).length;
  const progressPercent = Math.round((answeredQuestions / PANAS_SF_10_QUESTIONS.length) * 100);

  return (
    <SurveyLayout
      currentStep={5}
      totalSteps={10}
      stepTitle="중간 측정"
      onNext={handleNext}
      isNextDisabled={!isFormComplete}
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
            <h3 className="text-xl font-bold mb-2">정서 척도 (10문항)</h3>
            <p className="text-base text-muted-foreground">
              <strong>지금 이 순간</strong> 다음과 같은 감정을 얼마나 느끼고 계신지 답변해주세요.
            </p>
          </div>

          {PANAS_SF_10_QUESTIONS.map((question, index) => (
            <QuestionnaireItem
              key={question.id}
              questionNumber={index + 1}
              questionText={question.text}
              value={panasResponses[question.id] || ''}
              onChange={(value) => setPanasResponses({ ...panasResponses, [question.id]: value })}
              options={PANAS_OPTIONS}
            />
          ))}
        </div>

        {/* 완료 알림 */}
        {isFormComplete && (
          <Alert className="bg-primary/5 border-primary/30">
            <Heart className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base font-medium">
              모든 문항에 답변하셨습니다. 잠시 쉬어가셔도 좋습니다.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SurveyLayout>
  );
}
