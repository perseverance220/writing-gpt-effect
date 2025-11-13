// GAS-10: Geriatric Anxiety Scale
// 노인 불안 척도 (10문항)

export interface GASQuestion {
  id: string;
  text: string;
}

export const GAS_10_QUESTIONS: GASQuestion[] = [
  {
    id: 'gas_1',
    text: '사소한 일에도 걱정이 됩니까?',
  },
  {
    id: 'gas_2',
    text: '긴장되거나 불안하다고 느낍니까?',
  },
  {
    id: 'gas_3',
    text: '뭔가 나쁜 일이 일어날 것 같다는 생각이 듭니까?',
  },
  {
    id: 'gas_4',
    text: '마음을 편하게 가질 수가 없습니까?',
  },
  {
    id: 'gas_5',
    text: '신경이 예민해지거나 몸이 떨립니까?',
  },
  {
    id: 'gas_6',
    text: '잠들기가 어렵거나 자주 깹니까?',
  },
  {
    id: 'gas_7',
    text: '머릿속이 복잡하거나 생각이 정리되지 않습니까?',
  },
  {
    id: 'gas_8',
    text: '가슴이 두근거리거나 숨이 가빠집니까?',
  },
  {
    id: 'gas_9',
    text: '어지럽거나 몸이 떨립니까?',
  },
  {
    id: 'gas_10',
    text: '근육이 긴장되거나 몸이 굳어집니까?',
  },
];

export const GAS_OPTIONS = [
  { value: '0', label: '0 - 전혀 아니다' },
  { value: '1', label: '1 - 가끔 그렇다' },
  { value: '2', label: '2 - 자주 그렇다' },
  { value: '3', label: '3 - 항상 그렇다' },
];

// 점수 계산 함수
export function calculateGASScore(responses: Record<string, string>): number {
  let total = 0;

  GAS_10_QUESTIONS.forEach((question) => {
    const response = parseInt(responses[question.id]);
    if (!isNaN(response)) {
      total += response;
    }
  });

  // 총점 반환 (0-30점 범위)
  return total;
}
