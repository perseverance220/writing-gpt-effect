'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, CreditCard, Info } from 'lucide-react';

export default function InterviewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [interviewWilling, setInterviewWilling] = useState<string>('');
  const [interviewContact, setInterviewContact] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isFormComplete =
    interviewWilling !== '' &&
    (interviewWilling === 'no' || interviewContact.trim().length > 0) &&
    accountName.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0;

  const handleNext = async () => {
    if (!isFormComplete) return;

    setIsSaving(true);
    setError('');

    try {
      const paymentInfo = `${accountName}|${bankName}|${accountNumber}`;

      const response = await fetch('/api/save-interview-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: sessionId,
          interviewWilling: interviewWilling === 'yes',
          interviewContact: interviewWilling === 'yes' ? interviewContact : null,
          paymentMethod: 'bank',
          paymentInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '정보 저장에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      console.log('Interview and payment info saved:', data);

      // 완료 페이지로 이동
      router.push(`/survey/${sessionId}/post-test/complete`);
    } catch (error) {
      console.error('Save interview-payment error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
    }
  };

  return (
    <SurveyLayout
      currentStep={13}
      totalSteps={13}
      stepTitle="추가 정보"
      onNext={handleNext}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : "완료"}
    >
      <div className="space-y-5">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <Info className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">거의 다 끝났습니다!</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                마지막으로 인터뷰 참여 의향과 사례비 지급 정보를 입력해주세요
              </p>
            </div>
          </div>
        </div>

        {/* 인터뷰 참여 의향 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <Label className="text-xl font-bold block mb-2">
                  추가 인터뷰 참여 의향
                </Label>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  설문 결과에 따라 일부 참여자분께 추가 전화 인터뷰(약 30분)를 요청드릴 수 있습니다.
                  <br /><br />
                  <strong>⚠️ 의향을 밝혀주신 분 중 연구 목적에 따라 선별적으로 인터뷰가 진행됩니다.</strong>
                  <br />
                  인터뷰 참여 시 추가 사례비 30,000원이 지급됩니다.
                </p>
              </div>
            </div>

            <RadioGroup value={interviewWilling || undefined} onValueChange={setInterviewWilling}>
              <div className="space-y-3">
                <label className="flex items-start gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <RadioGroupItem value="yes" className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span className="text-lg font-medium">예, 인터뷰 참여 의향이 있습니다</span>
                </label>
                <label className="flex items-start gap-3 py-3 px-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                  <RadioGroupItem value="no" className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span className="text-lg font-medium">아니오, 인터뷰는 참여하지 않겠습니다</span>
                </label>
              </div>
            </RadioGroup>

            {interviewWilling === 'yes' && (
              <div className="space-y-2 pt-2">
                <Label className="text-lg font-bold">연락처</Label>
                <Input
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={interviewContact}
                  onChange={(e) => setInterviewContact(e.target.value)}
                  className="h-14 text-lg border-2"
                />
                <p className="text-sm text-muted-foreground">
                  전화번호 또는 카카오톡 ID를 입력해주세요
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* 사례비 지급 정보 */}
        <Card className="border-2 border-border rounded-xl shadow-sm p-5">
          <div className="space-y-4">
            <div className="flex gap-3">
              <CreditCard className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <Label className="text-xl font-bold block mb-2">
                  사례비 지급 정보
                </Label>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  설문 참여 사례비 <strong>10,000원</strong>을 지급해드립니다.
                  <br />
                  <strong className="text-primary">본인 명의가 아니어도 괜찮습니다.</strong>
                  <br />
                  지급 시기: 설문 완료 후 1주일 이내
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* 예금주명 */}
              <div className="space-y-2">
                <Label className="text-lg font-bold">예금주명</Label>
                <Input
                  type="text"
                  placeholder="예: 홍길동"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-14 text-lg border-2"
                />
                <p className="text-sm text-muted-foreground">
                  타인 명의도 가능합니다 (예: 자녀 이름)
                </p>
              </div>

              {/* 은행명 */}
              <div className="space-y-2">
                <Label className="text-lg font-bold">은행명</Label>
                <Input
                  type="text"
                  placeholder="예: 국민은행"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-14 text-lg border-2"
                />
              </div>

              {/* 계좌번호 */}
              <div className="space-y-2">
                <Label className="text-lg font-bold">계좌번호</Label>
                <Input
                  type="text"
                  placeholder="예: 123-456-789012"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-14 text-lg border-2"
                />
                <p className="text-sm text-muted-foreground">
                  하이픈(-) 포함 또는 제외 모두 가능합니다
                </p>
              </div>
            </div>
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
