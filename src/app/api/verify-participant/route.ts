import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 균형 무작위 배정 함수
 * 현재 A/B/C 집단 중 가장 인원이 적은 집단에 배정
 */
async function assignBalancedGroup(): Promise<'A' | 'B' | 'C'> {
  // 현재 각 집단의 인원수 조회
  const { data: participants } = await supabase
    .from('thesis_participants')
    .select('group_assignment')
    .not('group_assignment', 'is', null);

  // 집단별 인원수 카운트
  const groupCounts = {
    A: participants?.filter(p => p.group_assignment === 'A').length || 0,
    B: participants?.filter(p => p.group_assignment === 'B').length || 0,
    C: participants?.filter(p => p.group_assignment === 'C').length || 0,
  };

  console.log('Current group counts:', groupCounts);

  // 가장 적은 인원수 찾기
  const minCount = Math.min(groupCounts.A, groupCounts.B, groupCounts.C);

  // 가장 인원이 적은 집단들 (동점일 경우 여러 개)
  const availableGroups = (['A', 'B', 'C'] as const).filter(
    group => groupCounts[group] === minCount
  );

  // 그 중에서 랜덤 선택
  const selectedGroup = availableGroups[
    Math.floor(Math.random() * availableGroups.length)
  ];

  console.log('Available groups:', availableGroups, 'Selected:', selectedGroup);

  return selectedGroup;
}

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    // 입력값 검증
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        { valid: false, error: '참여 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 6자리 숫자인지 확인
    const cleanedIdentifier = identifier.trim();
    if (!/^\d{6}$/.test(cleanedIdentifier)) {
      return NextResponse.json(
        { valid: false, error: '참여 코드는 6자리 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    // DB에서 참여자 조회
    const { data: participant, error } = await supabase
      .from('thesis_participants')
      .select('id, identifier, group_assignment, status')
      .eq('identifier', cleanedIdentifier)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { valid: false, error: '유효하지 않은 참여 코드입니다.' },
        { status: 404 }
      );
    }

    // 이미 완료된 설문인지 확인
    if (participant.status === 'completed') {
      return NextResponse.json(
        { valid: false, error: '이미 완료된 설문입니다. 참여해 주셔서 감사합니다.' },
        { status: 400 }
      );
    }

    // 탈락한 참여자인지 확인
    if (participant.status === 'dropped') {
      return NextResponse.json(
        { valid: false, error: '참여가 중단된 코드입니다. 연구팀에 문의해주세요.' },
        { status: 400 }
      );
    }

    let assignedGroup = participant.group_assignment;

    // 🎯 집단이 아직 배정되지 않은 경우 자동 배정
    if (!assignedGroup) {
      assignedGroup = await assignBalancedGroup();

      // DB에 배정된 집단 저장
      await supabase
        .from('thesis_participants')
        .update({ group_assignment: assignedGroup })
        .eq('id', participant.id);

      console.log(`Participant ${cleanedIdentifier} assigned to group ${assignedGroup}`);
    }

    // 참여자 상태 업데이트 (처음 시작하는 경우)
    if (participant.status === 'pending') {
      await supabase
        .from('thesis_participants')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .eq('id', participant.id);
    } else {
      // 이미 진행 중인 경우 last_active_at만 업데이트
      await supabase
        .from('thesis_participants')
        .update({
          last_active_at: new Date().toISOString(),
        })
        .eq('id', participant.id);
    }

    // 성공 응답
    return NextResponse.json({
      valid: true,
      participantId: participant.id,
      identifier: participant.identifier,
      groupAssignment: assignedGroup,
      status: participant.status,
    });
  } catch (error) {
    console.error('Participant verification error:', error);
    return NextResponse.json(
      { valid: false, error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
