import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SurveyFooterProps {
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showPrev?: boolean;
}

export function SurveyFooter({
  onNext,
  onPrev,
  nextLabel = '다음으로',
  prevLabel = '이전으로',
  isNextDisabled = false,
  isNextLoading = false,
  showPrev = false,
}: SurveyFooterProps) {
  return (
    <footer className="bg-white border-t-2 border-border sticky bottom-0 z-40 shadow-2xl">
      <div className="senior-container py-4">
        <div className="flex items-center gap-3">
          {showPrev && onPrev && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onPrev}
              className="flex-1 h-16 text-xl font-bold border-2 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="mr-2 h-6 w-6" />
              {prevLabel}
            </Button>
          )}

          {onNext && (
            <Button
              type="button"
              size="lg"
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="flex-1 h-16 text-xl font-bold border-2 border-primary/30 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isNextLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                  <span className="text-xl">처리 중...</span>
                </span>
              ) : (
                <>
                  <span className="text-xl">{nextLabel}</span>
                  <ArrowRight className="ml-2 h-7 w-7" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
