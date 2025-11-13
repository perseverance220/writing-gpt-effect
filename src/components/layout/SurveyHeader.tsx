import { Heart } from 'lucide-react';

export function SurveyHeader() {
  return (
    <header className="bg-white border-b-2 border-border sticky top-0 z-50 shadow-sm">
      <div className="senior-container">
        <div className="flex items-center gap-3 py-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              자기자비 글쓰기 연구
            </h1>
            <p className="text-sm text-muted-foreground">
              60-74세 여성을 위한 설문
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
