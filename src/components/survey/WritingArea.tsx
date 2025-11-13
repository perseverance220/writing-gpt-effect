'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface WritingAreaProps {
  prompt: string;
  durationMinutes: number;
  onComplete: (content: string, duration: number) => void;
  placeholder?: string;
  autoSubmit?: boolean;
}

export function WritingArea({
  prompt,
  durationMinutes,
  onComplete,
  placeholder = '이곳에 자유롭게 작성해주세요...',
  autoSubmit = true,
}: WritingAreaProps) {
  const [content, setContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // seconds
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = durationMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // 경고 시점 (2분 남았을 때)
  const isWarning = timeLeft <= 120 && timeLeft > 0;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  useEffect(() => {
    if (content.trim() && !isStarted) {
      // 글쓰기 시작
      setIsStarted(true);
      startTimeRef.current = Date.now();
    }

    if (isStarted && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // 시간 종료
            setIsCompleted(true);
            if (timerRef.current) clearInterval(timerRef.current);

            if (autoSubmit) {
              const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
              onComplete(content, duration);
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
  }, [isStarted, isCompleted, content, autoSubmit, onComplete]);

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

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

      {/* 타이머 */}
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
                {isCompleted ? '작성 완료' : isStarted ? '남은 시간' : '작성 시간'}
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

          <Progress
            value={progress}
            className={`h-2 ${
              isUrgent ? '[&>div]:bg-destructive' :
              isWarning ? '[&>div]:bg-amber-500' :
              ''
            }`}
          />

          {!isStarted && (
            <p className="text-sm text-muted-foreground text-center">
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

      {/* 안내 */}
      <div className="text-center p-4 bg-secondary/30 rounded-xl">
        <p className="text-sm text-muted-foreground">
          천천히 편안하게 작성하시면 됩니다. 중간에 자동으로 저장됩니다.
        </p>
      </div>
    </div>
  );
}
