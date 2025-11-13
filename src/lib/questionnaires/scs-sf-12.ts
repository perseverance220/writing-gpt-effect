// SCS-SF-12: Self-Compassion Scale - Short Form
// 자기자비 척도 단축형 (12문항)

export interface SCSQuestion {
  id: string;
  text: string;
  reverse: boolean; // 역채점 문항 여부
}

export const SCS_SF_12_QUESTIONS: SCSQuestion[] = [
  {
    id: 'scs_1',
    text: '내가 실패했을 때, 나 자신의 약점을 비판하는 경향이 있다',
    reverse: true,
  },
  {
    id: 'scs_2',
    text: '기분이 안 좋을 때, 잘못된 모든 것에 집착하는 경향이 있다',
    reverse: true,
  },
  {
    id: 'scs_3',
    text: '힘든 시기에는, 나 자신을 친절하게 대한다',
    reverse: false,
  },
  {
    id: 'scs_4',
    text: '기분이 우울할 때, 내가 뭔가 잘못된 것처럼 느낀다',
    reverse: true,
  },
  {
    id: 'scs_5',
    text: '정말 힘든 일이 생기면, 필요한 친절함으로 나 자신을 대한다',
    reverse: false,
  },
  {
    id: 'scs_6',
    text: '화가 나면, 내 감정을 균형 있게 유지하려고 노력한다',
    reverse: false,
  },
  {
    id: 'scs_7',
    text: '내 성격 중 마음에 들지 않는 부분에 대해 자기 비판적이고 판단하는 경향이 있다',
    reverse: true,
  },
  {
    id: 'scs_8',
    text: '고통을 겪을 때, 그것은 인간 경험의 일부임을 떠올리려고 노력한다',
    reverse: false,
  },
  {
    id: 'scs_9',
    text: '뭔가 고통스러운 일이 생기면, 상황을 과장하는 경향이 있다',
    reverse: true,
  },
  {
    id: 'scs_10',
    text: '무언가 중요한 것에서 실패하면, 혼자서만 그런 것처럼 느낀다',
    reverse: true,
  },
  {
    id: 'scs_11',
    text: '나 자신의 결점과 부적절함에 대해 이해하고 관대하려고 노력한다',
    reverse: false,
  },
  {
    id: 'scs_12',
    text: '기분이 안 좋을 때, 호기심과 개방성으로 내 감정에 다가간다',
    reverse: false,
  },
];

export const SCS_OPTIONS = [
  { value: '1', label: '1 - 전혀 그렇지 않다' },
  { value: '2', label: '2 - 그렇지 않다' },
  { value: '3', label: '3 - 보통이다' },
  { value: '4', label: '4 - 그렇다' },
  { value: '5', label: '5 - 매우 그렇다' },
];

// 점수 계산 함수
export function calculateSCSScore(responses: Record<string, string>): number {
  let total = 0;
  let count = 0;

  SCS_SF_12_QUESTIONS.forEach((question) => {
    const response = parseInt(responses[question.id]);
    if (!isNaN(response)) {
      // 역채점 문항 처리
      const score = question.reverse ? 6 - response : response;
      total += score;
      count++;
    }
  });

  // 평균 점수 반환 (1-5점 범위)
  return count > 0 ? total / count : 0;
}
