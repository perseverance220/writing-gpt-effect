'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SurveyLayout } from '@/components/layout/SurveyLayout';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Phone, CreditCard, Info, CheckCircle2, ArrowRight, Edit2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BANK_LIST = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '농협은행',
  '기업은행',
  '카카오뱅크',
  '토스뱅크',
  '우체국',
  'SC제일은행',
  '새마을금고',
  '부산은행',
  '대구은행',
  '광주은행',
  '경남은행',
  '전북은행',
  '제주은행',
  '수협',
  '신협',
  '기타(직접입력)',
];

export default function InterviewPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [interviewWilling, setInterviewWilling] = useState<string>('');
  const [interviewContact, setInterviewContact] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankSelection, setBankSelection] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  
  const [isReviewing, setIsReviewing] = useState(false); // 리뷰 모드 상태
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 전화번호 포맷팅 (010-0000-0000)
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    
    if (value.length > 3 && value.length <= 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    
    setInterviewContact(formatted);
  };

  // 계좌번호 숫자만 입력
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAccountNumber(value);
  };

  const bankName = bankSelection === '기타(직접입력)' ? customBankName : bankSelection;

  // 유효성 검사
  const isContactValid = interviewWilling === 'no' || (interviewContact.length >= 12 && interviewContact.startsWith('010'));
  const isAccountNumberValid = accountNumber.length >= 10 && accountNumber.length <= 16;
  const isBankValid = bankSelection !== '' && (bankSelection !== '기타(직접입력)' || customBankName.trim().length > 0);
  
  const isFormComplete =
    interviewWilling !== '' &&
    isContactValid &&
    accountName.trim().length > 0 &&
    isBankValid &&
    isAccountNumberValid;

  const handleReview = () => {
    if (isFormComplete) {
      setIsReviewing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = () => {
    setIsReviewing(false);
  };

  const handleSubmit = async () => {
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
      onNext={isReviewing ? handleSubmit : handleReview}
      isNextDisabled={!isFormComplete || isSaving}
      nextLabel={isSaving ? "저장 중..." : (isReviewing ? "확인 및 제출" : "다음")}
      showFooter={!isReviewing}
    >
      <div className="space-y-6">
        {/* 안내 */}
        <div className="bg-secondary/50 border-2 border-border rounded-xl p-5">
          <div className="flex gap-3">
            <Info className="w-7 h-7 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold mb-1">
                {isReviewing ? '입력 정보 확인' : '거의 다 끝났습니다!'}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                {isReviewing 
                  ? '입력하신 정보가 정확한지 마지막으로 확인해주세요.' 
                  : '마지막으로 인터뷰 참여 의향과 사례비 지급 정보를 입력해주세요'}
              </p>
            </div>
          </div>
        </div>

        {/* 입력 폼 모드 */}
        {!isReviewing && (
          <>
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
                  <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-lg font-bold">연락처 (휴대전화)</Label>
                    <Input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={interviewContact}
                      onChange={handleContactChange}
                      className="h-14 text-lg border-2"
                      maxLength={13}
                    />
                    {interviewContact && !isContactValid && (
                      <p className="text-sm text-destructive font-medium">
                        올바른 휴대전화 번호 형식이 아닙니다.
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      숫자만 입력하시면 자동으로 형식이 변환됩니다.
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

                <div className="space-y-4">
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

                  {/* 은행명 (Select) */}
                  <div className="space-y-2">
                    <Label className="text-lg font-bold">은행명</Label>
                    <Select value={bankSelection} onValueChange={setBankSelection}>
                      <SelectTrigger className="h-14 text-lg border-2">
                        <SelectValue placeholder="은행을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANK_LIST.map((bank) => (
                          <SelectItem key={bank} value={bank} className="text-lg py-2">
                            {bank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {bankSelection === '기타(직접입력)' && (
                      <div className="mt-2 animate-in fade-in">
                        <Input
                          placeholder="은행명을 직접 입력해주세요"
                          value={customBankName}
                          onChange={(e) => setCustomBankName(e.target.value)}
                          className="h-12 text-lg border-2"
                        />
                      </div>
                    )}
                  </div>

                  {/* 계좌번호 */}
                  <div className="space-y-2">
                    <Label className="text-lg font-bold">계좌번호</Label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="하이픈(-) 없이 숫자만 입력"
                      value={accountNumber}
                      onChange={handleAccountNumberChange}
                      className="h-14 text-lg border-2"
                    />
                    {accountNumber && !isAccountNumberValid && (
                      <p className="text-sm text-destructive font-medium">
                        계좌번호는 10~16자리 숫자여야 합니다. ({accountNumber.length}자)
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      숫자만 입력해주세요 (하이픈 자동 제거)
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* 리뷰 모드 */}
        {isReviewing && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-2 border-primary bg-primary/5 p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                입력 정보 확인
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">인터뷰 참여 여부</Label>
                  <p className="text-xl font-bold">
                    {interviewWilling === 'yes' ? '참여함' : '참여하지 않음'}
                  </p>
                  {interviewWilling === 'yes' && (
                    <div className="mt-1 p-3 bg-white rounded-lg border border-primary/20">
                      <Label className="text-sm text-muted-foreground">연락처</Label>
                      <p className="text-lg font-semibold text-primary">{interviewContact}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t border-primary/20 pt-4">
                  <Label className="text-base text-muted-foreground">사례비 입금 계좌</Label>
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    <div className="p-3 bg-white rounded-lg border border-primary/20">
                      <Label className="text-sm text-muted-foreground">예금주</Label>
                      <p className="text-lg font-semibold">{accountName}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-primary/20">
                      <Label className="text-sm text-muted-foreground">은행 / 계좌번호</Label>
                      <p className="text-lg font-semibold">
                        {bankName} <span className="text-muted-foreground mx-1">|</span> {accountNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-dashed border-primary/30 flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:flex-1 border-2 h-14 sm:h-12 text-lg"
                  onClick={handleEdit}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  정보 수정하기
                </Button>
                <Button 
                  className="w-full sm:flex-1 h-14 sm:h-12 text-lg font-bold"
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  {isSaving ? '제출 중...' : '제출하기'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

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
