'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ArrowRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!identifier.trim()) {
      setError('참여 코드를 입력해주세요.');
      return;
    }

    // 6자리 숫자 형식 검증
    if (!/^\d{6}$/.test(identifier.trim())) {
      setError('참여 코드는 6자리 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. 참여자 검증
      const verifyResponse = await fetch('/api/verify-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.valid) {
        setError(verifyData.error || '유효하지 않은 참여 코드입니다.');
        setIsLoading(false);
        return;
      }

      // 2. 진행 상황 확인
      const progressResponse = await fetch(`/api/check-progress?participantId=${identifier.trim()}`);
      const progressData = await progressResponse.json();

      if (!progressResponse.ok || !progressData.success) {
        // 진행 상황 조회 실패 시 기본 consent 페이지로
        console.warn('Progress check failed, redirecting to consent');
        router.push(`/survey/${verifyData.participantId}/consent`);
        return;
      }

      // 3. 마지막 미완료 단계로 이동
      console.log('Participant progress:', progressData.data);
      router.push(`/survey/${verifyData.participantId}${progressData.data.nextStep}`);
    } catch (error) {
      console.error('Verification error:', error);
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* 헤더 */}
      <header className="p-4 bg-white border-b-2 border-primary/20 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-md">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                자기자비 글쓰기 연구
              </h1>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                노년기 여성 대상 온라인 설문
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-in">
          <Card className="p-6 shadow-xl border-2 border-border bg-white">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6 border-3 border-primary/30 shadow-lg">
                <Heart className="w-11 h-11 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                연구에 오신 것을<br />환영합니다
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                카카오톡으로 받으신<br />참여 코드를 입력해주세요
              </p>
            </div>

            <div className="space-y-5">
              {/* 참여 코드 입력 */}
              <div className="space-y-3">
                <label htmlFor="identifier" className="text-xl font-bold block text-foreground">
                  참여 코드
                </label>
                <Input
                  id="identifier"
                  type="text"
                  inputMode="numeric"
                  placeholder="예: 123456"
                  maxLength={6}
                  value={identifier}
                  onChange={(e) => {
                    // 숫자만 입력 가능
                    const value = e.target.value.replace(/\D/g, '');
                    setIdentifier(value);
                    setError('');
                  }}
                  className="h-16 text-2xl text-center tracking-wider font-mono border-2 shadow-md"
                  disabled={isLoading}
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <Alert variant="destructive" className="border-2">
                  <AlertDescription className="text-lg font-semibold">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* 시작 버튼 */}
              <Button
                onClick={handleStart}
                disabled={isLoading || !identifier.trim()}
                className="w-full h-16 text-xl font-bold shadow-lg border-2 border-primary/30 rounded-xl hover:shadow-xl transition-all"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    확인 중...
                  </span>
                ) : (
                  <>
                    설문 시작하기
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </>
                )}
              </Button>
            </div>

            {/* 안내 사항 */}
            <div className="mt-6 p-5 bg-secondary/70 rounded-xl border-2 border-border shadow-inner">
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-bold text-lg">설문 안내</p>
                  <ul className="space-y-2 text-base text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary text-lg font-bold">•</span>
                      <span className="font-medium">예상 소요 시간: 약 30분</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary text-lg font-bold">•</span>
                      <span className="font-medium">중간에 자동 저장되어 안전합니다</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* 하단 안내 */}
          <div className="text-center mt-5 p-4 bg-white/50 rounded-xl border border-border shadow-sm">
            <p className="text-base text-muted-foreground leading-relaxed">
              참여 코드가 없으신가요?<br />
              <a href="mailto:ellenlove@hanmail.net" className="text-primary text-lg font-bold underline hover:text-primary/80 transition-colors">
                연구팀에 문의하기
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-4 text-center text-sm text-muted-foreground bg-white/30 border-t border-border">
        <p className="font-medium">문의: ellenlove@hanmail.net</p>
      </footer>
    </div>
  );
}
