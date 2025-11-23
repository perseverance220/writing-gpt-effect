'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, FileText, Send } from 'lucide-react';

interface WritingAreaProps {
  prompt: string;
  durationMinutes: number; // 최대/권장 시간
  minDurationSeconds?: number; // 최소 체류 시간 (초)
  minLength?: number; // 최소 글자 수
  onComplete: (content: string, duration: number) => void;
  placeholder?: string;
  autoSubmit?: boolean;
}

export function WritingArea({
  prompt,
  durationMinutes,
  minDurationSeconds = 180, // 기본 3분
  minLength = 200, // 기본 200자
  onComplete,
  placeholder = '이곳에 자유롭게 작성해주세요...',
  autoSubmit = true,
}: WritingAreaProps) {
  const [content, setContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // seconds
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const totalSeconds = durationMinutes * 60;
  
  // 타이머 표시용
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // 조건 충족 여부
  const charCount = content.length;
  const isTimeMet = elapsedTime >= minDurationSeconds;
  const isLengthMet = charCount >= minLength;
  const canSubmit = isTimeMet && isLengthMet;

  // 경고 시점 (2분 남았을 때)
  const isWarning = timeLeft <= 120 && timeLeft > 0;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  // content가 변경될 때마다 ref 업데이트
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // 글쓰기 시작 시 textarea를 화면 상단에 보이도록 스크롤
  useEffect(() => {
    if (isStarted && !isCompleted && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setTimeout(() => {
        const currentScroll = window.scrollY;
        window.scrollTo({
          top: Math.max(0, currentScroll - 120),
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isStarted, isCompleted]);

  // Effect 1: 글쓰기 시작 감지
  useEffect(() => {
    if (content.trim() && !isStarted && !isCompleted) {
      setIsStarted(true);
      startTimeRef.current = Date.now();
    }
  }, [content, isStarted, isCompleted]);

  // Effect 2: 타이머 실행
  useEffect(() => {
    if (isStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        // 경과 시간 증가
        setElapsedTime((prev) => prev + 1);
        
        // 남은 시간 감소
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 시간 종료
            setIsCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);

            if (autoSubmit) {
              const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
              onComplete(contentRef.current, duration);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isStarted, isCompleted, autoSubmit, onComplete]);

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // 사용자 수동 제출 핸들러
  const handleSubmit = () => {
    if (canSubmit && !isCompleted) {
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const duration = isStarted
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
      onComplete(content, duration);
    }
  };

  return (
    <div className="space-y-6">
      {/* 프롬프트 */}
      <Card className="bg-primary/5 border-2 border-primary/20 p-6">
        <div className="flex gap-4">
          <FileText className="w-7 h-7 text-primary flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold mb-3">글쓰기 주제</h3>
            <p className="text-lg text-foreground leading-relaxed whitespace-pre-line">
              {prompt}
            </p>
          </div>
        </div>
      </Card>

      {/* 상태 카드 (타이머 & 조건) */}
      <Card className={`p-6 transition-colors ${
        isUrgent ? 'bg-destructive/10 border-destructive/30' :
        isWarning ? 'bg-amber-50 border-amber-300' :
        'bg-card'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className={`w-6 h-6 ${
                isUrgent ? 'text-destructive animate-pulse' :
                isWarning ? 'text-amber-600' :
                'text-primary'
              }`} />
              <span className="text-base font-semibold text-muted-foreground">
                {isCompleted ? '작성 완료' : '남은 시간'}
              </span>
            </div>

            <div className={`text-3xl font-bold tabular-nums ${
              isUrgent ? 'text-destructive' :
              isWarning ? 'text-amber-600' :
              'text-primary'
            }`}>
              {formatTime(minutes, seconds)}
            </div>
          </div>

          {/* 최소 조건 표시 */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">최소 시간</span>
                <span className={isTimeMet ? "text-green-600 font-bold" : "text-muted-foreground"}>
                  {formatTime(Math.floor(elapsedTime/60), elapsedTime%60)} / {formatTime(Math.floor(minDurationSeconds/60), minDurationSeconds%60)}
                </span>
              </div>
              <Progress 
                value={Math.min((elapsedTime / minDurationSeconds) * 100, 100)} 
                className="h-1.5" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">최소 분량</span>
                <span className={isLengthMet ? "text-green-600 font-bold" : "text-muted-foreground"}>
                  {charCount} / {minLength}자
                </span>
              </div>
              <Progress 
                value={Math.min((charCount / minLength) * 100, 100)} 
                className="h-1.5" 
              />
            </div>
          </div>

          {!isStarted && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              글을 작성하시면 타이머가 시작됩니다
            </p>
          )}
        </div>
      </Card>

      {/* 경고 메시지 */}
      {isWarning && !isCompleted && (
        <Alert variant={isUrgent ? 'destructive' : 'default'} className={
          isUrgent ? '' : 'bg-amber-50 border-amber-300'
        }>
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base font-medium">
            {isUrgent
              ? '1분 남았습니다! 곧 자동으로 제출됩니다.'
              : '2분 남았습니다. 마무리해주세요.'}
          </AlertDescription>
        </Alert>
      )}

      {/* 완료 메시지 */}
      {isCompleted && (
        <Alert className="bg-primary/5 border-primary/30">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <AlertDescription className="text-base font-medium">
            작성 시간이 종료되었습니다. 수고하셨습니다!
          </AlertDescription>
        </Alert>
      )}

      {/* 글쓰기 영역 */}
      <Card className="p-6">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isCompleted}
          className="min-h-[320px] text-lg leading-relaxed resize-none border-0 focus-visible:ring-0 p-0"
        />

        <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-border">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              <span className="font-semibold">{wordCount}</span> 단어
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="font-semibold">{charCount}</span> 글자
            </span>
          </div>

          {content.trim() && (
            <span className="text-sm font-medium text-primary">
              작성 중...
            </span>
          )}
        </div>
      </Card>

      {/* 제출 버튼 및 안내 */}
      <div className="space-y-4">
        {!isCompleted && (
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="lg"
            className={`w-full py-6 text-lg font-bold shadow-md transition-all ${
              canSubmit 
                ? 'bg-primary hover:bg-primary/90 animate-pulse-slow' 
                : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed'
            }`}
          >
            {canSubmit ? (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                작성 완료 및 제출하기
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {!isTimeMet ? '충분한 시간 동안 고민해주세요' : '조금 더 작성해주세요'}
                <span className="text-xs font-normal opacity-70">
                  (최소 조건 미충족)
                </span>
              </span>
            )}
          </Button>
        )}

        <div className="text-center p-4 bg-secondary/30 rounded-xl space-y-2">
          <p className="text-base text-muted-foreground font-medium">
            최소 {Math.floor(minDurationSeconds / 60)}분 이상, {minLength}자 이상 작성하시면 완료 버튼이 활성화됩니다.
          </p>
          <p className="text-sm text-muted-foreground">
            최대 {durationMinutes}분이 경과하면 자동으로 제출됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
