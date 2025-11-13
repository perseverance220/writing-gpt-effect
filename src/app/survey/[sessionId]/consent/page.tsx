'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, FileText } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [consents, setConsents] = useState({
    purpose: false,
    privacy: false,
    voluntary: false,
    dataUsage: false,
  });

  const allAgreed = Object.values(consents).every(Boolean);

  const handleNext = () => {
    if (allAgreed) {
      router.push(`/survey/${sessionId}/demographics`);
    }
  };

  const consentItems = [
    {
      id: 'purpose',
      title: '연구 목적 및 절차',
      description: '본 연구는 노년기 여성의 자기자비 글쓰기가 불안 감소에 미치는 영향을 탐색하는 연구입니다. 설문은 약 30-35분 소요되며, 사전 검사, 글쓰기 활동, 사후 검사로 구성됩니다.',
    },
    {
      id: 'privacy',
      title: '개인정보 보호',
      description: '수집된 정보는 연구 목적으로만 사용되며, 개인 식별 정보는 암호화되어 안전하게 보관됩니다. 연구 종료 후 7년간 보관 후 폐기됩니다.',
    },
    {
      id: 'voluntary',
      title: '자발적 참여 및 중단',
      description: '참여는 자발적이며, 언제든지 중단할 수 있습니다. 중단해도 어떠한 불이익도 없습니다.',
    },
    {
      id: 'dataUsage',
      title: '데이터 사용 동의',
      description: '연구 결과는 학술 논문 및 학회 발표에 사용될 수 있으며, 개인 식별이 불가능한 형태로만 공개됩니다.',
    },
  ];

  return (
    <SurveyLayout
      currentStep={1}
      totalSteps={10}
      stepTitle="연구 참여 동의"
      onNext={handleNext}
      isNextDisabled={!allAgreed}
      nextLabel="동의하고 계속하기"
    >
      <div className="space-y-6">
        {/* 안내 문구 */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
          <div className="flex gap-4">
            <FileText className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2">연구 참여 동의서</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                아래 내용을 주의 깊게 읽어주시고, 모든 항목에 동의하시면 설문을 시작하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 동의 항목들 */}
        <div className="space-y-4">
          {consentItems.map((item) => (
            <Card key={item.id} className="p-6 border-2 hover:border-primary/50 transition-colors">
              <label className="flex gap-4 cursor-pointer">
                <Checkbox
                  checked={consents[item.id as keyof typeof consents]}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({
                      ...prev,
                      [item.id]: checked === true,
                    }))
                  }
                  className="w-7 h-7 mt-1 flex-shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-2">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    {consents[item.id as keyof typeof consents] && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </label>
            </Card>
          ))}
        </div>

        {/* 전체 동의 확인 */}
        {allAgreed && (
          <Alert className="bg-primary/5 border-primary/30">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertDescription className="text-base font-medium">
              모든 항목에 동의하셨습니다. 다음으로 진행하실 수 있습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* IRB 정보 */}
        <div className="text-center p-4 bg-secondary/30 rounded-xl border border-border">
          <p className="text-sm text-muted-foreground">
            본 연구를 통해 확보된 내용은 본 연구목적 이외에 활용되지 않습니다.
          </p>
        </div>
      </div>
    </SurveyLayout>
  );
}
