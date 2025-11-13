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

    setIsLoading(true);
    setError('');

    // 임시: 목업용으로 바로 이동 (실제로는 API 검증 필요)
    setTimeout(() => {
      router.push(`/survey/${identifier}/consent`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* 헤더 */}
      <header className="p-6">
        <div className="senior-container">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                자기자비 글쓰기 연구
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                노년기 여성 대상 온라인 설문
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-in">
          <Card className="p-8 shadow-xl border-2">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-3">
                연구에 오신 것을<br />환영합니다
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                카카오톡으로 받으신 참여 코드를<br />
                입력해주세요
              </p>
            </div>

            <div className="space-y-6">
              {/* 참여 코드 입력 */}
              <div className="space-y-3">
                <label htmlFor="identifier" className="text-lg font-semibold block">
                  참여 코드
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="예: WGE-2025-001"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="h-16 text-xl text-center tracking-wider font-mono"
                  disabled={isLoading}
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-base">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* 시작 버튼 */}
              <Button
                onClick={handleStart}
                disabled={isLoading || !identifier.trim()}
                className="senior-button w-full"
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
            <div className="mt-8 p-5 bg-secondary/50 rounded-xl border border-border">
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="font-semibold text-base">설문 안내</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>예상 소요 시간: 약 30-35분</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>중간에 자동 저장되어 안전합니다</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>편안한 곳에서 천천히 진행해주세요</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          {/* 하단 안내 */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              참여 코드가 없으신가요?<br />
              <a href="mailto:ellenlove@hanmail.net" className="text-primary font-medium underline">
                연구팀에 문의하기
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p className="mt-1">문의: ellenlove@hanmail.net</p>
      </footer>
    </div>
  );
}
