import { ReactNode } from 'react';
import { SurveyHeader } from './SurveyHeader';
import { SurveyProgress } from './SurveyProgress';
import { SurveyFooter } from './SurveyFooter';

interface SurveyLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showPrev?: boolean;
  showFooter?: boolean;
}

export function SurveyLayout({
  children,
  currentStep,
  totalSteps,
  stepTitle,
  onNext,
  onPrev,
  nextLabel,
  isNextDisabled,
  isNextLoading,
  showPrev = false,
  showFooter = true,
}: SurveyLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SurveyHeader />

      <SurveyProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepTitle={stepTitle}
      />

      <main className="flex-1 animate-slide-in">
        <div className="senior-container py-8">
          {children}
        </div>
      </main>

      {showFooter && (
        <SurveyFooter
          onNext={onNext}
          onPrev={onPrev}
          nextLabel={nextLabel}
          isNextDisabled={isNextDisabled}
          isNextLoading={isNextLoading}
          showPrev={showPrev}
        />
      )}
    </div>
  );
}
