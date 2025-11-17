'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Heart, Mail } from 'lucide-react';

export default function CompletePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [participantData, setParticipantData] = useState<{
    identifier: string;
    interviewWilling: boolean;
    paymentMethod: string;
  } | null>(null);

  useEffect(() => {
    const fetchParticipantData = async () => {
      try {
        const response = await fetch(`/api/check-progress?participantId=${sessionId}`);
        const data = await response.json();
        if (data.success && data.data) {
          setParticipantData({
            identifier: data.data.participantId,
            interviewWilling: data.data.interviewWilling || false,
            paymentMethod: data.data.paymentMethod || 'bank',
          });
        }
      } catch (error) {
        console.error('Failed to fetch participant data:', error);
      }
    };
    fetchParticipantData();

    // 참여자 상태 업데이트
    const updateStatus = async () => {
      try {
        await fetch('/api/update-participant-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId: sessionId,
            status: 'completed',
          }),
        });
      } catch (error) {
        console.error('Failed to update participant status:', error);
      }
    };
    updateStatus();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* 헤더 */}
      <header className="p-4 bg-white border-b-2 border-primary/20 shadow-sm">
        <div className="max-w-2xl mx-auto">
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
        <div className="w-full max-w-2xl animate-slide-in">
          <Card className="p-8 shadow-xl border-2 border-border bg-white">
            {/* 완료 아이콘 */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-200 shadow-lg">
                <CheckCircle2 className="w-14 h-14 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight text-green-700">
                설문이 완료되었습니다!
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                귀중한 시간을 내어 참여해주셔서<br />
                진심으로 감사드립니다
              </p>
            </div>

            {/* 참여 코드 */}
            {participantData && (
              <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-5 mb-6">
                <div className="text-center">
                  <p className="text-base font-medium text-muted-foreground mb-2">
                    참여 코드
                  </p>
                  <p className="text-3xl font-bold text-primary tracking-wider font-mono">
                    {participantData.identifier}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    문의 시 위 코드를 알려주세요
                  </p>
                </div>
              </div>
            )}

            {/* 안내 사항 */}
            <div className="space-y-4 mb-6">
              <Card className="border-2 border-green-200 bg-green-50 p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-green-800">사례비 지급</h3>
                    <p className="text-base text-green-700 leading-relaxed">
                      설문 참여 사례비 <strong>10,000원</strong>은 <strong>1주일 이내</strong>에 입력하신 계좌로 지급됩니다.
                    </p>
                  </div>
                </div>
              </Card>

              {participantData?.interviewWilling && (
                <Card className="border-2 border-blue-200 bg-blue-50 p-5">
                  <div className="flex gap-3">
                    <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-blue-800">추가 인터뷰</h3>
                      <p className="text-base text-blue-700 leading-relaxed">
                        인터뷰 참여 의향을 밝혀주셔서 감사합니다.<br />
                        선정되실 경우 입력하신 연락처로 개별 연락드리겠습니다.<br />
                        <strong>(인터뷰 참여 시 추가 사례비 30,000원 지급)</strong>
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* 감사 메시지 */}
            <div className="bg-secondary/70 border-2 border-border rounded-xl p-6 text-center">
              <p className="text-lg font-bold mb-3">
                본 연구는
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                노년기 여성의 정신건강 증진을 위한<br />
                자기자비 글쓰기 프로그램 개발에<br />
                소중한 자료로 활용됩니다
              </p>
              <div className="mt-5 pt-5 border-t-2 border-border">
                <p className="text-base font-bold text-primary mb-2">
                  다시 한번 감사드립니다
                </p>
                <p className="text-sm text-muted-foreground">
                  문의: ellenlove@hanmail.net
                </p>
              </div>
            </div>

            {/* 창 닫기 안내 */}
            <div className="mt-6 text-center">
              <p className="text-base text-muted-foreground">
                이 창을 닫으셔도 됩니다
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-4 text-center text-sm text-muted-foreground bg-white/30 border-t border-border">
        <p className="font-medium">자기자비 글쓰기 연구 | ellenlove@hanmail.net</p>
      </footer>
    </div>
  );
}
