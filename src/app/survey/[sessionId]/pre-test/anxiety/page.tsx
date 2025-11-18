'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// GAS-10 문항 (Geriatric Anxiety Scale - 10 items)
const gasQuestions = [
  { id: 'gas1', text: '저는 쉽게 짜증이 났습니다.' },
  { id: 'gas2', text: '저는 다른 사람들과 단절되거나 고립된 느낌이 들었습니다.' },
  { id: 'gas3', text: '저는 멍한 느낌이 들었습니다.' },
  { id: 'gas4', text: '저는 가만히 앉아 있기 어려웠습니다.' },
  { id: 'gas5', text: '저는 제 걱정을 스스로 통제할 수 없었습니다.' },
  { id: 'gas6', text: '저는 안절부절하거나 예민하고 불안정한 느낌이 들었습니다.' },
  { id: 'gas7', text: '저는 쉽게 피곤함을 느꼈습니다.' },
  { id: 'gas8', text: '저는 근육이 긴장되는 느낌이 들었습니다.' },
  { id: 'gas9', text: '저는 제 삶을 통제할 수 없다는 느낌이 들었습니다.' },
  { id: 'gas10', text: '저는 무언가 끔찍한 일이 일어날 것 같은 느낌이 들었습니다.' },
];

const scaleOptions = [
  { value: '0', label: '전혀 아니다' },
  { value: '1', label: '가끔 그렇다' },
  { value: '2', label: '대부분 그렇다' },
  { value: '3', label: '항상 그렇다' },
];

export default function AnxietyPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isFormComplete = gasQuestions.every((q) => responses[q.id]);

  const handleNext = async () => {
    if (!isFormComplete) return;

    setIsSaving(true);
    setError('');

    try {
      // localStorage에서 이전 단계 응답 가져오기
      const scsData = localStorage.getItem(`pretest_scs_${sessionId}`);
      const panasData = localStorage.getItem(`pretest_panas_${sessionId}`);

      if (!scsData || !panasData) {
        setError('이전 단계 데이터를 찾을 수 없습니다. 처음부터 다시 시작해주세요.');
        setIsSaving(false);
        return;
      }

      const scsResponses = JSON.parse(scsData);
      const panasResponses = JSON.parse(panasData);

      // 모든 응답 데이터 합치기
      const allResponses = {
        ...scsResponses,
        ...panasResponses,
        ...responses,
      };

      // API로 전송
      const response = await fetch('/api/save-pre-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          responses: allResponses,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '사전 검사 결과 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      // 저장 성공 - localStorage 정리
      localStorage.removeItem(`pretest_scs_${sessionId}`);
      localStorage.removeItem(`pretest_panas_${sessionId}`);

      console.log('Pre-test completed and saved:', data);

      // 다음 페이지로 이동
      router.push(`/survey/${sessionId}/negative-event`);
    } catch (error) {
      console.error('Pre-test save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  return (
    <SurveyLayout
      currentStep={5}
      totalSteps={10}
      stepTitle="사전 검사 (3/3)"
      onNext={handleNext}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : "다음"}
    >
      <div className="space-y-5">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <AlertCircle className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">불안 검사</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong>지난 일주일 동안</strong> 다음과 같은 경험을<br />
                얼마나 자주 하셨는지 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold">응답 완료</span>
            <span className="text-xl font-bold text-primary">
              {Object.keys(responses).length} / {gasQuestions.length}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(Object.keys(responses).length / gasQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문들 */}
        <div className="space-y-4">
          {gasQuestions.map((question, index) => (
            <Card key={question.id} className="border-2 border-border rounded-xl shadow-sm p-5">
              <div className="space-y-3">
                <Label className="text-lg font-bold block">
                  {index + 1}. {question.text}
                </Label>
                <RadioGroup
                  value={responses[question.id]}
                  onValueChange={(value) =>
                    setResponses({ ...responses, [question.id]: value })
                  }
                >
                  <div className="space-y-2">
                    {scaleOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                      >
                        <RadioGroupItem value={option.value} className="w-6 h-6 flex-shrink-0" />
                        <span className="text-lg font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </Card>
          ))}
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
