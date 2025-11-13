'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Heart, Download, Mail } from 'lucide-react';

export default function CompletePage() {
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
                설문이 완료되었습니다
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-slide-in space-y-6">
          {/* 완료 카드 */}
          <Card className="p-8 shadow-xl border-2 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-14 h-14 text-primary" />
            </div>

            <h2 className="text-3xl font-bold mb-4">
              설문을 완료하셨습니다!
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              소중한 시간을 내어 참여해주셔서 진심으로 감사드립니다.<br />
              여러분의 응답은 노년기 여성의 정신건강 증진에 큰 도움이 될 것입니다.
            </p>

            <div className="bg-primary/5 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4 text-left">
                <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">다음 단계</h3>
                  <ul className="space-y-2 text-base text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>인터뷰에 동의하신 분들께는 별도로 연락드리겠습니다</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>연구 결과는 2025년 하반기에 공유될 예정입니다</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>참여 수고비는 일주일 내로 지급됩니다</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="senior-button flex-1"
                onClick={() => window.print()}
              >
                <Download className="mr-2 h-5 w-5" />
                참여 확인서 출력
              </Button>
              <Button
                size="lg"
                className="senior-button flex-1"
                onClick={() => window.location.href = 'mailto:research@example.com'}
              >
                <Mail className="mr-2 h-5 w-5" />
                문의하기
              </Button>
            </div>
          </Card>

          {/* 추가 정보 */}
          <Card className="p-6 border-2">
            <h3 className="text-lg font-bold mb-4">자기자비 실천 팁</h3>
            <div className="space-y-3 text-base text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>힘들 때 자신을 비난하지 말고, 친한 친구에게 하듯 따뜻하게 대해주세요</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>어려움은 인간이라면 누구나 겪는 경험임을 기억하세요</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>감정을 억누르지 말고, 있는 그대로 인정하고 느껴보세요</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>자기 돌봄은 이기적인 것이 아니라 건강한 행동입니다</span>
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>본 연구는 IRB 승인을 받았습니다 (승인번호: 추후 기입)</p>
        <p className="mt-1">문의: research@example.com | 전화: 02-1234-5678</p>
      </footer>
    </div>
  );
}
