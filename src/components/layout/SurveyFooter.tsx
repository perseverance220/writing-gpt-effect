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
    <footer className="bg-white border-t-2 border-border sticky bottom-0 z-40 shadow-lg">
      <div className="senior-container py-6">
        <div className="flex items-center gap-4">
          {showPrev && onPrev && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onPrev}
              className="senior-button flex-1"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {prevLabel}
            </Button>
          )}

          {onNext && (
            <Button
              type="button"
              size="lg"
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="senior-button flex-1"
            >
              {isNextLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                  처리 중...
                </span>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
