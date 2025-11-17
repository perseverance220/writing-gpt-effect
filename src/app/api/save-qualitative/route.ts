import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, responses } = await request.json();

    if (!participantId || !responses) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Participant 확인
    const { data: participant, error: participantError } = await supabase
      .from('thesis_participants')
      .select('id')
      .eq('id', participantId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { success: false, error: '참여자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 서술형 응답 확인
    const { data: existing } = await supabase
      .from('thesis_descriptive_responses')
      .select('id')
      .eq('participant_id', participant.id)
      .single();

    let result;

    if (existing) {
      // 기존 데이터 업데이트
      const { data, error } = await supabase
        .from('thesis_descriptive_responses')
        .update({
          q1_negative_experience: responses.q1,
          q2_intervention_experience: responses.q2,
          q3_anxiety_change: responses.q3,
          q4_self_care_thoughts: responses.q4,
          q5_online_program_experience: responses.q5,
          q6_daily_life_impact: responses.q6,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select();

      result = { data, error };
    } else {
      // 새 데이터 삽입
      const { data, error } = await supabase
        .from('thesis_descriptive_responses')
        .insert({
          participant_id: participant.id,
          q1_negative_experience: responses.q1,
          q2_intervention_experience: responses.q2,
          q3_anxiety_change: responses.q3,
          q4_self_care_thoughts: responses.q4,
          q5_online_program_experience: responses.q5,
          q6_daily_life_impact: responses.q6,
          completed_at: new Date().toISOString(),
        })
        .select();

      result = { data, error };
    }

    if (result.error) {
      console.error('Qualitative responses save error:', result.error);
      return NextResponse.json(
        { success: false, error: '서술형 응답 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Save qualitative API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
