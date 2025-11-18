'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { QuestionnaireItem } from '@/components/survey/QuestionnaireItem';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardCheck, Info } from 'lucide-react';
import { SCS_SF_12_QUESTIONS, SCS_OPTIONS, calculateSCSScore } from '@/lib/questionnaires/scs-sf-12';
import { PANAS_SF_10_QUESTIONS, PANAS_OPTIONS, calculatePANASScores } from '@/lib/questionnaires/panas-sf-10';
import { GAS_10_QUESTIONS, GAS_OPTIONS, calculateGASScore } from '@/lib/questionnaires/gas-10';

export default function PreTestPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  // SCS responses
  const [scsResponses, setScsResponses] = useState<Record<string, string>>({});

  // PANAS responses
  const [panasResponses, setPanasResponses] = useState<Record<string, string>>({});

  // GAS responses
  const [gasResponses, setGasResponses] = useState<Record<string, string>>({});

  // 모든 질문에 응답했는지 확인
  const scsComplete = SCS_SF_12_QUESTIONS.every((q) => scsResponses[q.id]);
  const panasComplete = PANAS_SF_10_QUESTIONS.every((q) => panasResponses[q.id]);
  const gasComplete = GAS_10_QUESTIONS.every((q) => gasResponses[q.id]);
  const isFormComplete = scsComplete && panasComplete && gasComplete;

  const handleNext = () => {
    if (isFormComplete) {
      // 점수 계산
      const scsScore = calculateSCSScore(scsResponses);
      const panasScores = calculatePANASScores(panasResponses);
      const gasScore = calculateGASScore(gasResponses);

      console.log('Pre-test scores:', {
        scs: scsScore,
        panas: panasScores,
        gas: gasScore,
      });

      router.push(`/survey/${sessionId}/negative-event`);
    }
  };

  // 진행률 계산
  const totalQuestions = SCS_SF_12_QUESTIONS.length + PANAS_SF_10_QUESTIONS.length + GAS_10_QUESTIONS.length;
  const answeredQuestions = Object.keys(scsResponses).length + Object.keys(panasResponses).length + Object.keys(gasResponses).length;
  const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <SurveyLayout
      currentStep={3}
      totalSteps={13}
      stepTitle="사전 검사"
      onNext={handleNext}
      isNextDisabled={!isFormComplete}
    >
      <div className="space-y-8">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-2xl p-6">
          <div className="flex gap-4">
            <ClipboardCheck className="w-8 h-8 text-primary flex-shrink-0" />
            <div className="space-y-3">
              <h3 className="text-xl font-bold">사전 검사</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                현재 느끼시는 감정과 생각을 솔직하게 답변해주세요.<br />
                정답은 없으며, 편안하게 느끼시는 대로 선택하시면 됩니다.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Info className="w-4 h-4" />
                <span>진행률: {answeredQuestions} / {totalQuestions} 문항 ({progressPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCS-SF-12 섹션 */}
        <div className="space-y-6">
          <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Part 1. 자기자비 척도 (12문항)</h3>
            <p className="text-base text-muted-foreground">
              힘든 시기나 어려운 상황에서 자신을 어떻게 대하는지에 대한 질문입니다.
            </p>
          </div>

          {SCS_SF_12_QUESTIONS.map((question, index) => (
            <QuestionnaireItem
              key={question.id}
              questionNumber={index + 1}
              questionText={question.text}
              value={scsResponses[question.id] || ''}
              onChange={(value) => setScsResponses({ ...scsResponses, [question.id]: value })}
              options={SCS_OPTIONS}
            />
          ))}
        </div>

        {/* PANAS-SF-10 섹션 */}
        <div className="space-y-6">
          <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Part 2. 정서 상태 (10문항)</h3>
            <p className="text-base text-muted-foreground">
              <strong>현재 또는 최근</strong> 다음과 같은 감정을 얼마나 느끼고 계신지 답변해주세요.
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

        {/* GAS-10 섹션 */}
        <div className="space-y-6">
          <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Part 3. 불안 척도 (10문항)</h3>
            <p className="text-base text-muted-foreground">
              <strong>지난 한 달 동안</strong> 다음과 같은 증상을 얼마나 자주 경험하셨는지 답변해주세요.
            </p>
          </div>

          {GAS_10_QUESTIONS.map((question, index) => (
            <QuestionnaireItem
              key={question.id}
              questionNumber={index + 1}
              questionText={question.text}
              value={gasResponses[question.id] || ''}
              onChange={(value) => setGasResponses({ ...gasResponses, [question.id]: value })}
              options={GAS_OPTIONS}
            />
          ))}
        </div>

        {/* 완료 알림 */}
        {isFormComplete && (
          <Alert className="bg-primary/5 border-primary/30">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base font-medium">
              모든 문항에 답변하셨습니다. 다음으로 진행하실 수 있습니다.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SurveyLayout>
  );
}
