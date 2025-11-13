'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';

export default function DemographicsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [formData, setFormData] = useState({
    age: '',
    educationLevel: '',
    maritalStatus: '',
    livingArrangement: '',
    mainStressor: '',
  });

  const isFormComplete =
    formData.age &&
    formData.educationLevel &&
    formData.maritalStatus &&
    formData.livingArrangement &&
    formData.mainStressor.trim();

  const handleNext = () => {
    if (isFormComplete) {
      // 임시: 데이터 저장 후 다음 페이지로
      console.log('Demographics data:', formData);
      router.push(`/survey/${sessionId}/pre-test`);
    }
  };

  return (
    <SurveyLayout
      currentStep={2}
      totalSteps={10}
      stepTitle="기본 정보"
      onNext={handleNext}
      isNextDisabled={!isFormComplete}
    >
      <div className="space-y-8">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-2xl p-6">
          <div className="flex gap-4">
            <User className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">기본 정보 입력</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                연구를 위한 기본 정보를 입력해주세요. 모든 정보는 익명으로 처리되며 안전하게 보관됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 질문 1: 연령 */}
        <Card className="senior-card">
          <div className="space-y-4">
            <Label className="question-text">1. 현재 나이를 선택해주세요</Label>
            <RadioGroup value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
              {['60-64세', '65-69세', '70-74세'].map((option) => (
                <label key={option} className="option-item">
                  <RadioGroupItem value={option} className="w-6 h-6" />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 2: 학력 */}
        <Card className="senior-card">
          <div className="space-y-4">
            <Label className="question-text">2. 최종 학력을 선택해주세요</Label>
            <RadioGroup value={formData.educationLevel} onValueChange={(value) => setFormData({ ...formData, educationLevel: value })}>
              {['초등학교 졸업', '중학교 졸업', '고등학교 졸업', '전문대학 졸업', '대학교 졸업', '대학원 졸업'].map((option) => (
                <label key={option} className="option-item">
                  <RadioGroupItem value={option} className="w-6 h-6" />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 3: 결혼 상태 */}
        <Card className="senior-card">
          <div className="space-y-4">
            <Label className="question-text">3. 현재 결혼 상태를 선택해주세요</Label>
            <RadioGroup value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
              {['기혼', '미혼', '이혼', '사별'].map((option) => (
                <label key={option} className="option-item">
                  <RadioGroupItem value={option} className="w-6 h-6" />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 4: 동거 형태 */}
        <Card className="senior-card">
          <div className="space-y-4">
            <Label className="question-text">4. 현재 누구와 함께 살고 계신가요?</Label>
            <RadioGroup value={formData.livingArrangement} onValueChange={(value) => setFormData({ ...formData, livingArrangement: value })}>
              {['혼자 살고 있음', '배우자와 함께', '자녀와 함께', '기타 가족과 함께'].map((option) => (
                <label key={option} className="option-item">
                  <RadioGroupItem value={option} className="w-6 h-6" />
                  <span className="text-lg">{option}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 5: 주요 스트레스 원인 */}
        <Card className="senior-card">
          <div className="space-y-4">
            <Label htmlFor="stressor" className="question-text">
              5. 현재 가장 큰 스트레스나 걱정거리가 있다면 간단히 적어주세요
            </Label>
            <p className="text-sm text-muted-foreground">
              예: 건강 문제, 경제적 어려움, 가족 관계 등
            </p>
            <Textarea
              id="stressor"
              value={formData.mainStressor}
              onChange={(e) => setFormData({ ...formData, mainStressor: e.target.value })}
              placeholder="자유롭게 작성해주세요..."
              className="min-h-[120px] text-lg leading-relaxed resize-none"
            />
            <p className="text-sm text-muted-foreground text-right">
              {formData.mainStressor.length}자
            </p>
          </div>
        </Card>
      </div>
    </SurveyLayout>
  );
}
