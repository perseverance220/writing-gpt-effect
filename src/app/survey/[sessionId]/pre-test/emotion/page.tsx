'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Smile } from 'lucide-react';

// PANAS-SF-10 문항 (Positive and Negative Affect Schedule - Short Form)
const panasQuestions = [
  { id: 'panas1', text: '흥미진진한', type: 'positive' },
  { id: 'panas2', text: '괴로운', type: 'negative' },
  { id: 'panas3', text: '신나는', type: 'positive' },
  { id: 'panas4', text: '마음이 상한', type: 'negative' },
  { id: 'panas5', text: '강한', type: 'positive' },
  { id: 'panas6', text: '죄책감 드는', type: 'negative' },
  { id: 'panas7', text: '겁에 질린', type: 'negative' },
  { id: 'panas8', text: '적대적인', type: 'negative' },
  { id: 'panas9', text: '열정적인', type: 'positive' },
  { id: 'panas10', text: '자랑스러운', type: 'positive' },
];

const scaleOptions = [
  { value: '1', label: '전혀 아니다' },
  { value: '2', label: '아니다' },
  { value: '3', label: '보통이다' },
  { value: '4', label: '그렇다' },
  { value: '5', label: '매우 그렇다' },
];

export default function EmotionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [responses, setResponses] = useState<Record<string, string>>({});

  const isFormComplete = panasQuestions.every((q) => responses[q.id]);

  const handleNext = () => {
    if (isFormComplete) {
      // PANAS 응답을 localStorage에 임시 저장
      localStorage.setItem(`pretest_panas_${sessionId}`, JSON.stringify(responses));
      console.log('PANAS-SF-10 data saved to localStorage');
      router.push(`/survey/${sessionId}/pre-test/anxiety`);
    }
  };

  return (
    <SurveyLayout
      currentStep={4}
      totalSteps={10}
      stepTitle="사전 검사 (2/3)"
      onNext={handleNext}
      isNextDisabled={!isFormComplete}
    >
      <div className="space-y-5">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <Smile className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">정서 상태 검사</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong>지금 현재</strong> 기분이나 느낌을<br />
                가장 잘 나타내는 답변을 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold">응답 완료</span>
            <span className="text-xl font-bold text-primary">
              {Object.keys(responses).length} / {panasQuestions.length}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(Object.keys(responses).length / panasQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문들 */}
        <div className="space-y-4">
          {panasQuestions.map((question, index) => (
            <Card key={question.id} className="border-2 border-border rounded-xl shadow-sm p-5">
              <div className="space-y-3">
                <Label className="text-lg font-bold block">
                  {index + 1}. 지금 현재 <span className="text-primary">&ldquo;{question.text}&rdquo;</span> 느낌이 드시나요?
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
      </div>
    </SurveyLayout>
  );
}
