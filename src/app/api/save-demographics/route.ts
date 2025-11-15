import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, demographics } = await request.json();

    // 입력값 검증
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json(
        { success: false, error: '참여자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!demographics || typeof demographics !== 'object') {
      return NextResponse.json(
        { success: false, error: '인구통계 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const { age, educationLevel, maritalStatus, livingArrangement, mainStressor } = demographics;

    // 필수 항목 확인
    if (!age || !educationLevel || !maritalStatus || !livingArrangement || !mainStressor?.trim()) {
      return NextResponse.json(
        { success: false, error: '모든 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 기존 데이터 확인 (이미 입력했는지)
    const { data: existing } = await supabase
      .from('thesis_demographics')
      .select('id')
      .eq('participant_id', participantId)
      .single();

    let result;

    if (existing) {
      // 이미 존재하면 UPDATE
      const { data, error } = await supabase
        .from('thesis_demographics')
        .update({
          age,
          education_level: educationLevel,
          marital_status: maritalStatus,
          living_arrangement: livingArrangement,
          main_stressor: mainStressor,
        })
        .eq('participant_id', participantId)
        .select()
        .single();

      if (error) {
        console.error('Demographics update error:', error);
        return NextResponse.json(
          { success: false, error: '인구통계 정보 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 새로 삽입
      const { data, error } = await supabase
        .from('thesis_demographics')
        .insert({
          participant_id: participantId,
          age,
          education_level: educationLevel,
          marital_status: maritalStatus,
          living_arrangement: livingArrangement,
          main_stressor: mainStressor,
        })
        .select()
        .single();

      if (error) {
        console.error('Demographics insert error:', error);
        return NextResponse.json(
          { success: false, error: '인구통계 정보 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log(`Demographics saved for participant ${participantId}`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        createdAt: result.created_at,
      },
    });
  } catch (error) {
    console.error('Demographics API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
