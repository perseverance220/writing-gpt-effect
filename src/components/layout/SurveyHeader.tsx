import { Heart } from 'lucide-react';

export function SurveyHeader() {
  return (
    <header className="bg-white border-b-2 border-primary/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center gap-3 py-4">
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
  );
}
