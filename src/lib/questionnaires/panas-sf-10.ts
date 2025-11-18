// PANAS-SF-10: Positive and Negative Affect Schedule - Short Form
// 정서 척도 단축형 (긍정 5문항, 부정 5문항)
// 사전/중간/사후 검사 모두 동일한 문항 사용

export interface PANASQuestion {
  id: string;
  text: string;
  type: 'positive' | 'negative';
}

export const PANAS_SF_10_QUESTIONS: PANASQuestion[] = [
  // Positive items: 1, 3, 5, 9, 10
  { id: 'panas1', text: '흥미로운', type: 'positive' },
  { id: 'panas2', text: '괴로운', type: 'negative' },
  { id: 'panas3', text: '신나는', type: 'positive' },
  { id: 'panas4', text: '마음이 상한', type: 'negative' },
  { id: 'panas5', text: '기운이 나는', type: 'positive' },
  { id: 'panas6', text: '죄책감이 드는', type: 'negative' },
  { id: 'panas7', text: '겁이 나는', type: 'negative' },
  { id: 'panas8', text: '적대적인', type: 'negative' },
  { id: 'panas9', text: '열정적인', type: 'positive' },
  { id: 'panas10', text: '자랑스러운', type: 'positive' },
];

export const PANAS_OPTIONS = [
  { value: '1', label: '전혀 아니다' },
  { value: '2', label: '조금 그렇다' },
  { value: '3', label: '보통이다' },
  { value: '4', label: '상당히 그렇다' },
  { value: '5', label: '매우 그렇다' },
];

// 점수 계산 함수
export function calculatePANASScores(responses: Record<string, string>): {
  positive: number;
  negative: number;
} {
  // Positive items: 1, 3, 5, 9, 10
  const positiveItems = ['panas1', 'panas3', 'panas5', 'panas9', 'panas10'];
  // Negative items: 2, 4, 6, 7, 8
  const negativeItems = ['panas2', 'panas4', 'panas6', 'panas7', 'panas8'];

  let positiveTotal = 0;
  let negativeTotal = 0;

  positiveItems.forEach((item) => {
    const value = parseInt(responses[item]);
    if (!isNaN(value)) {
      positiveTotal += value;
    }
  });

  negativeItems.forEach((item) => {
    const value = parseInt(responses[item]);
    if (!isNaN(value)) {
      negativeTotal += value;
    }
  });

  return {
    positive: positiveTotal,
    negative: negativeTotal,
  };
}
