import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

interface Option {
  value: string;
  label: string;
}

interface QuestionnaireItemProps {
  questionNumber: number;
  questionText: string;
  value: string;
  onChange: (value: string) =>void;
  options: Option[];
}

export function QuestionnaireItem({
  questionNumber,
  questionText,
  value,
  onChange,
  options,
}: QuestionnaireItemProps) {
  return (
    <Card className="senior-card">
      <div className="space-y-5">
        <Label className="question-text">
          {questionNumber}. {questionText}
        </Label>

        <RadioGroup value={value} onValueChange={onChange}>
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.value} className="option-item">
                <RadioGroupItem value={option.value} className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg flex-1">{option.label}</span>
              </label>
            ))}
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
}
