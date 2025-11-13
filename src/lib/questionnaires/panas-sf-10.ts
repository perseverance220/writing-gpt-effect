// PANAS-SF-10: Positive and Negative Affect Schedule - Short Form
// 정서 척도 단축형 (긍정 5문항, 부정 5문항)

export interface PANASQuestion {
  id: string;
  text: string;
  type: 'positive' | 'negative';
}

export const PANAS_SF_10_QUESTIONS: PANASQuestion[] = [
  // 긍정 정서
  {
    id: 'panas_positive_1',
    text: '흥미진진한',
    type: 'positive',
  },
  {
    id: 'panas_positive_2',
    text: '강한',
    type: 'positive',
  },
  {
    id: 'panas_positive_3',
    text: '열정적인',
    type: 'positive',
  },
  {
    id: 'panas_positive_4',
    text: '자랑스러운',
    type: 'positive',
  },
  {
    id: 'panas_positive_5',
    text: '활기찬',
    type: 'positive',
  },
  // 부정 정서
  {
    id: 'panas_negative_1',
    text: '괴로운',
    type: 'negative',
  },
  {
    id: 'panas_negative_2',
    text: '두려운',
    type: 'negative',
  },
  {
    id: 'panas_negative_3',
    text: '죄책감 드는',
    type: 'negative',
  },
  {
    id: 'panas_negative_4',
    text: '적대적인',
    type: 'negative',
  },
  {
    id: 'panas_negative_5',
    text: '신경질적인',
    type: 'negative',
  },
];

export const PANAS_OPTIONS = [
  { value: '1', label: '1 - 전혀 그렇지 않다' },
  { value: '2', label: '2 - 조금 그렇다' },
  { value: '3', label: '3 - 보통이다' },
  { value: '4', label: '4 - 상당히 그렇다' },
  { value: '5', label: '5 - 매우 많이 그렇다' },
];

// 점수 계산 함수
export function calculatePANASScores(responses: Record<string, string>): {
  positive: number;
  negative: number;
} {
  let positiveTotal = 0;
  let negativeTotal = 0;
  let positiveCount = 0;
  let negativeCount = 0;

  PANAS_SF_10_QUESTIONS.forEach((question) => {
    const response = parseInt(responses[question.id]);
    if (!isNaN(response)) {
      if (question.type === 'positive') {
        positiveTotal += response;
        positiveCount++;
      } else {
        negativeTotal += response;
        negativeCount++;
      }
    }
  });

  return {
    positive: positiveCount > 0 ? positiveTotal / positiveCount : 0,
    negative: negativeCount > 0 ? negativeTotal / negativeCount : 0,
  };
}
