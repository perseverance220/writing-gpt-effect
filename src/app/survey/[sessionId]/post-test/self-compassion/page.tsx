'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heart } from 'lucide-react';

// SCS-SF-12 문항 (Self-Compassion Scale - Short Form 12 items)
const scsQuestions = [
  { id: 'scs1', text: '나는 나에게 중요한 어떤 일에서 실패를 하면, 내 능력이 부족하다는 느낌에 사로잡힌다', reverse: true }, // Over-identification
  { id: 'scs2', text: '내 성격 중에서 마음에 들지 않는 부분에 대해 이해하고 견디어내려고 한다.', reverse: false }, // Self-Kindness
  { id: 'scs3', text: '나는 뭔가 고통스러운 일이 생기면. 그 상황에 대해 균형 잡힌 시각을 가지려고 노력한다.', reverse: false }, // Mindfulness
  { id: 'scs4', text: '나는 기분이 쳐져 있을 때, 대부분의 다른 사람들은 나보다 더 행복할 거라고 느끼는 경향이 있다.', reverse: true }, // Isolation
  { id: 'scs5', text: '나는 내가 겪은 실패들에 대해서 사람이라면 누구나 겪을 수 있는 일로 보려고 노력한다.', reverse: false }, // Common Humanity
  { id: 'scs6', text: '나는 정말로 힘든 시기를 겪을 때, 내게 필요한 돌봄과 부드러움으로 나를 대한다.', reverse: false }, // Self-Kindness
  { id: 'scs7', text: '나는 어떤 일 때문에 마음이 상하거나 화가 날 때는, 감정의 평정을 유지하려고 노력한다.', reverse: false }, // Mindfulness
  { id: 'scs8', text: '나는 중요한 어떤 일에서 실패하면, 나 혼자만 실패한 기분이 든다.', reverse: true }, // Isolation
  { id: 'scs9', text: '나는 기분이 처질 때, 잘못된 모든 일을 강박적으로 떠올리며 집착하는 경향이 있다.', reverse: true }, // Over-identification
  { id: 'scs10', text: '나는 뭔가 부족한 느낌이 들면, 대부분의 다른 사람들도 그러한 부족감을 느낄 거라는 생각을 떠올리려고 애를 쓴다.', reverse: false }, // Common Humanity
  { id: 'scs11', text: '나는 내 자신의 결점과 부족한 부분을 못마땅하게 여기고 비난하는 편이다.', reverse: true }, // Self-Judgment
  { id: 'scs12', text: '나는 내 성격 중에서 마음에 들지 않는 점을 견디거나 참기 어렵다.', reverse: true }, // Self-Judgment
];

const scaleOptions = [
  { value: '1', label: '거의 아니다' },
  { value: '2', label: '조금 그렇다' },
  { value: '3', label: '웬만큼 그렇다' },
  { value: '4', label: '자주 그렇다' },
  { value: '5', label: '거의 항상 그렇다' },
];


export default function PostTestSelfCompassionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [responses, setResponses] = useState<Record<string, string>>({});

  const isFormComplete = scsQuestions.every((q) => responses[q.id]);

  const handleNext = () => {
    if (isFormComplete) {
      // SCS 응답을 localStorage에 임시 저장
      localStorage.setItem(`posttest_scs_${sessionId}`, JSON.stringify(responses));
      console.log('Post-test SCS-SF-12 data saved to localStorage');
      router.push(`/survey/${sessionId}/post-test/emotion`);
    }
  };

  return (
    <SurveyLayout
      currentStep={8}
      totalSteps={11}
      stepTitle="사후 검사 (1/3)"
      onNext={handleNext}
      isNextDisabled={!isFormComplete}
    >
      <div className="space-y-5">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <Heart className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">자기자비 검사</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                <strong>지금 현재</strong> 자신에 대해 어떻게 생각하고 행동하는지 가장 가까운 답변을 선택해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 진행 상태 */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold">응답 완료</span>
            <span className="text-xl font-bold text-primary">
              {Object.keys(responses).length} / {scsQuestions.length}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(Object.keys(responses).length / scsQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 질문들 */}
        <div className="space-y-4">
          {scsQuestions.map((question, index) => (
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
      </div>
    </SurveyLayout>
  );
}
