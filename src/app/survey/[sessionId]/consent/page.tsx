'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

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

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    purpose: true,
    privacy: false,
    voluntary: false,
    dataUsage: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const allAgreed = Object.values(consents).every(Boolean);

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNext = async () => {
    if (!allAgreed) return;

    setIsSaving(true);
    setError('');

    try {
      // 동의 정보를 DB에 저장
      const response = await fetch('/api/save-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          consents: {
            purpose: consents.purpose,
            privacy: consents.privacy,
            voluntary: consents.voluntary,
            dataUsage: consents.dataUsage,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '동의 정보 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      // 저장 성공 - 다음 페이지로 이동
      router.push(`/survey/${sessionId}/demographics`);
    } catch (error) {
      console.error('Consent save error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  const consentItems = [
    {
      id: 'purpose',
      title: '연구 목적 및 절차',
      description: '본 연구는 노년기 여성의 자기자비 글쓰기가 불안 감소에 미치는 영향을 탐색하는 연구입니다. 설문은 약 30분 소요되며, 사전 검사, 글쓰기 활동, 사후 검사, 서술형 질문으로 구성됩니다.',
    },
    {
      id: 'privacy',
      title: '개인정보 보호',
      description: '수집된 정보는 연구 목적으로만 사용되며, 개인 식별 정보는 암호화되어 안전하게 보관됩니다.',
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
    }
  ];

  return (
    <SurveyLayout
      currentStep={1}
      totalSteps={10}
      stepTitle="연구 참여 동의"
      onNext={handleNext}
      isNextDisabled={!allAgreed || isSaving}
      nextLabel={isSaving ? "저장 중..." : "동의하고 계속하기"}
    >
      <div className="space-y-5">
        {/* 안내 문구 */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-5 shadow-sm">
          <div className="flex gap-3">
            <FileText className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xl font-bold mb-2">연구 참여 동의서</h3>
              <p className="text-base text-foreground leading-relaxed font-medium">
                아래 4가지 항목을 확인하시고<br />
                <span className="text-primary font-bold">모두 체크</span>해주셔야 다음으로 진행됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 진행 상태 표시 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">동의 완료</span>
            <span className="text-2xl font-bold text-primary">
              {Object.values(consents).filter(Boolean).length} / 4
            </span>
          </div>
          <div className="mt-3 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${(Object.values(consents).filter(Boolean).length / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 동의 항목들 - 아코디언 형식 */}
        <div className="space-y-3">
          {consentItems.map((item, index) => {
            const isChecked = consents[item.id as keyof typeof consents];
            const isExpanded = expandedItems[item.id];

            return (
              <Card
                key={item.id}
                className={`border-2 transition-all ${
                  isChecked
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                {/* 헤더 - 항상 표시 */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* 큰 체크박스 */}
                    <div
                      onClick={() => {
                        setConsents((prev) => ({
                          ...prev,
                          [item.id]: !isChecked,
                        }));
                      }}
                      className="cursor-pointer"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          setConsents((prev) => ({
                            ...prev,
                            [item.id]: checked === true,
                          }))
                        }
                        className="w-8 h-8 rounded-md"
                      />
                    </div>

                    {/* 제목과 펼치기 버튼 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-sm font-bold">
                              {index + 1}
                            </span>
                            <h4 className="text-lg font-bold text-foreground">
                              {item.title}
                            </h4>
                          </div>
                          {isChecked && (
                            <div className="flex items-center gap-1.5 text-primary mt-1">
                              <CheckCircle2 className="w-5 h-5" />
                              <span className="text-sm font-semibold">동의 완료</span>
                            </div>
                          )}
                        </div>

                        {/* 펼치기/접기 버튼 */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          aria-label={isExpanded ? "내용 접기" : "내용 펼치기"}
                        >
                          <span className="text-sm font-semibold">
                            {isExpanded ? '접기' : '자세히'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* 설명 - 펼쳤을 때만 표시 */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t-2 border-border">
                          <p className="text-base text-foreground leading-relaxed font-medium">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <Alert variant="destructive" className="border-2">
            <AlertDescription className="text-lg font-semibold">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 전체 동의 확인 */}
        {allAgreed ? (
          <Alert className="bg-primary border-2 border-primary shadow-lg">
            <CheckCircle2 className="h-6 w-6 text-white" />
            <AlertDescription className="text-lg font-bold text-white">
              ✓ 모든 항목에 동의 완료! 아래 버튼을 눌러 다음으로 진행해주세요
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 border-2 border-amber-300">
            <AlertDescription className="text-base font-semibold text-amber-900">
              아직 {4 - Object.values(consents).filter(Boolean).length}개 항목이 남았습니다
            </AlertDescription>
          </Alert>
        )}

        {/* IRB 정보 */}
        <div className="text-center p-4 bg-secondary/50 rounded-xl border-2 border-border">
          <p className="text-base text-foreground font-medium leading-relaxed">
            본 연구를 통해 확보된 내용은<br />
            연구목적 이외에 활용되지 않습니다
          </p>
        </div>
      </div>
    </SurveyLayout>
  );
}
