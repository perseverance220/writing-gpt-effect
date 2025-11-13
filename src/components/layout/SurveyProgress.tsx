import { Progress } from '@/components/ui/progress';

interface SurveyProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function SurveyProgress({ currentStep, totalSteps, stepTitle }: SurveyProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="bg-secondary/50 border-b-2 border-border">
      <div className="senior-container py-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="progress-indicator">
              {currentStep}단계 / 총 {totalSteps}단계
            </p>
            <p className="text-sm font-semibold text-primary">
              {Math.round(progress)}% 완료
            </p>
          </div>

          <Progress value={progress} className="h-3" />

          <h2 className="text-xl font-bold text-foreground mt-4">
            {stepTitle}
          </h2>
        </div>
      </div>
    </div>
  );
}
