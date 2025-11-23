'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DemographicsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [formData, setFormData] = useState({
    age: '',
    educationLevel: '',
    educationOther: '', // 학력 기타 입력값
    maritalStatus: '',
    maritalOther: '', // 결혼 상태 기타 입력값
    livingArrangement: '',
    livingOther: '', // 동거 형태 기타 입력값
    mainStressor: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [ineligibleError, setIneligibleError] = useState(''); // 연구 대상 제외 알림

  // 연구 대상 연령 범위 (만 60세 ~ 74세) -> 1951년생 ~ 1965년생
  // 2025년 기준
  const ELIGIBLE_START_YEAR = 1951; // 만 74세
  const ELIGIBLE_END_YEAR = 1965; // 만 60세

  const handleAgeChange = (value: string) => {
    if (value === 'not_applicable') {
      setFormData(prev => ({ ...prev, age: '' }));
      setIneligibleError('본 연구는 만 60세에서 74세(1951년생 ~ 1965년생) 여성을 대상으로 합니다. 죄송하지만 연구 대상 연령에 포함되지 않아 참여하실 수 없습니다.');
      return;
    }

    setFormData(prev => ({ ...prev, age: value }));
    setIneligibleError('');
  };

  const isFormComplete =
    formData.age && !ineligibleError &&
    formData.educationLevel && (formData.educationLevel !== '기타' || formData.educationOther.trim()) &&
    formData.maritalStatus && (formData.maritalStatus !== '기타' || formData.maritalOther.trim()) &&
    formData.livingArrangement && (formData.livingArrangement !== '기타' || formData.livingOther.trim()) &&
    formData.mainStressor.trim();

  const handleNext = async () => {
    if (!isFormComplete) return;

    setIsSaving(true);
    setError('');

    try {
      // 기타 항목 데이터 병합
      const finalDemographics = {
        age: formData.age,
        educationLevel: formData.educationLevel === '기타' ? `기타: ${formData.educationOther}` : formData.educationLevel,
        maritalStatus: formData.maritalStatus === '기타' ? `기타: ${formData.maritalOther}` : formData.maritalStatus,
        livingArrangement: formData.livingArrangement === '기타' ? `기타: ${formData.livingOther}` : formData.livingArrangement,
        mainStressor: formData.mainStressor,
      };

      // 인구통계 정보를 DB에 저장
      const response = await fetch('/api/save-demographics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          demographics: finalDemographics,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '정보 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      // 저장 성공 - 다음 페이지로 이동
      router.push(`/survey/${sessionId}/pre-test/self-compassion`);
    } catch (error) {
      console.error('Demographics save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  const educationOptions = [
    '초등학교 졸업',
    '중학교 졸업',
    '고등학교 졸업',
    '전문대학 졸업',
    '대학교 졸업',
    '대학원 졸업(석사)',
    '대학원 졸업(박사)',
    '기타'
  ];

  const maritalOptions = ['기혼', '미혼', '이혼', '사별', '기타'];

  const livingOptions = ['혼자 살고 있음', '배우자와 함께', '자녀와 함께', '기타'];

  return (
    <SurveyLayout
      currentStep={2}
      totalSteps={13}
      stepTitle="기본 정보"
      onNext={handleNext}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : "다음"}
    >
      <div className="space-y-6">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <User className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">기본 정보 입력</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                연구를 위한 기본 정보를 입력해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 질문 1: 출생연도 */}
        <Card className={`border-2 rounded-xl shadow-sm p-5 ${ineligibleError ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
          <div className="space-y-3">
            <Label className="text-lg font-bold block">1. 출생연도를 선택해주세요</Label>
            {!ineligibleError && (
              <p className="text-sm text-muted-foreground">
                본 연구는 만 60세~74세 여성을 대상으로 합니다
              </p>
            )}
            <Select value={formData.age} onValueChange={handleAgeChange}>
              <SelectTrigger className="h-14 text-lg border-2">
                <SelectValue placeholder="출생연도를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: ELIGIBLE_END_YEAR - ELIGIBLE_START_YEAR + 1 }, (_, i) => {
                  const year = ELIGIBLE_END_YEAR - i; // 1965부터 시작
                  const age = 2025 - year;
                  return { year, age };
                }).map(({ year, age }) => (
                  <SelectItem key={year} value={`${year}년생`} className="text-lg py-3">
                    {year}년생 (만 {age}세)
                  </SelectItem>
                ))}
                <SelectItem value="not_applicable" className="text-lg py-3 text-muted-foreground font-medium">
                  해당 연도 없음 (그 외 연령)
                </SelectItem>
              </SelectContent>
            </Select>
            
            {ineligibleError && (
              <Alert variant="destructive" className="mt-3 bg-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {ineligibleError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Card>

        {/* 질문 2: 학력 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-3">
            <Label className="text-lg font-bold block">2. 최종 학력을 선택해주세요</Label>
            <RadioGroup 
              value={formData.educationLevel || undefined} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, educationLevel: value }))}
            >
              <div className="space-y-2">
                {educationOptions.map((option) => (
                  <div key={option}>
                    <label className="flex items-center gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                      <RadioGroupItem value={option} className="w-6 h-6 flex-shrink-0" />
                      <span className="text-lg font-medium">{option}</span>
                    </label>
                    {option === '기타' && formData.educationLevel === '기타' && (
                      <div className="mt-2 ml-4 animate-in fade-in slide-in-from-top-2">
                        <Input
                          placeholder="학력을 직접 입력해주세요"
                          value={formData.educationOther}
                          onChange={(e) => setFormData(prev => ({ ...prev, educationOther: e.target.value }))}
                          className="text-lg h-12"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 3: 결혼 상태 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-3">
            <Label className="text-lg font-bold block">3. 현재 결혼 상태를 선택해주세요</Label>
            <RadioGroup 
              value={formData.maritalStatus || undefined} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}
            >
              <div className="space-y-2">
                {maritalOptions.map((option) => (
                  <div key={option}>
                    <label className="flex items-center gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                      <RadioGroupItem value={option} className="w-6 h-6 flex-shrink-0" />
                      <span className="text-lg font-medium">{option}</span>
                    </label>
                    {option === '기타' && formData.maritalStatus === '기타' && (
                      <div className="mt-2 ml-4 animate-in fade-in slide-in-from-top-2">
                        <Input
                          placeholder="상태를 직접 입력해주세요"
                          value={formData.maritalOther}
                          onChange={(e) => setFormData(prev => ({ ...prev, maritalOther: e.target.value }))}
                          className="text-lg h-12"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 4: 동거 형태 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-3">
            <Label className="text-lg font-bold block">4. 현재 누구와 함께 살고 계신가요?</Label>
            <RadioGroup 
              value={formData.livingArrangement || undefined} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, livingArrangement: value }))}
            >
              <div className="space-y-2">
                {livingOptions.map((option) => (
                  <div key={option}>
                    <label className="flex items-center gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                      <RadioGroupItem value={option} className="w-6 h-6 flex-shrink-0" />
                      <span className="text-lg font-medium">{option}</span>
                    </label>
                    {option === '기타' && formData.livingArrangement === '기타' && (
                      <div className="mt-2 ml-4 animate-in fade-in slide-in-from-top-2">
                        <Input
                          placeholder="누구와 함께 사는지 입력해주세요"
                          value={formData.livingOther}
                          onChange={(e) => setFormData(prev => ({ ...prev, livingOther: e.target.value }))}
                          className="text-lg h-12"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </Card>

        {/* 질문 5: 주요 스트레스 원인 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-3">
            <Label htmlFor="stressor" className="text-lg font-bold block">
              5. 현재 가장 큰 스트레스나 걱정거리가 있다면 간단히 적어주세요
            </Label>
            <p className="text-sm text-muted-foreground">
              예: 건강 문제, 경제적 어려움, 가족 관계 등
            </p>
            <Textarea
              id="stressor"
              value={formData.mainStressor}
              onChange={(e) => setFormData(prev => ({ ...prev, mainStressor: e.target.value }))}
              placeholder="자유롭게 작성해주세요..."
              className="min-h-[100px] text-lg leading-relaxed resize-none border-2"
            />
            <p className="text-sm text-muted-foreground text-right">
              {formData.mainStressor.length}자
            </p>
          </div>
        </Card>

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
