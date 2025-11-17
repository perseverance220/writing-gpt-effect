import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, responses } = await request.json();

    // 입력값 검증
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json(
        { success: false, error: '참여자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json(
        { success: false, error: '응답 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // PANAS 응답 추출 (프론트엔드 키 형식: panas_positive_1, panas_negative_1 등)
    const {
      panas_positive_1, panas_positive_2, panas_positive_3, panas_positive_4, panas_positive_5,
      panas_negative_1, panas_negative_2, panas_negative_3, panas_negative_4, panas_negative_5
    } = responses;

    // 모든 응답이 있는지 확인
    if (!panas_positive_1 || !panas_positive_2 || !panas_positive_3 || !panas_positive_4 || !panas_positive_5 ||
        !panas_negative_1 || !panas_negative_2 || !panas_negative_3 || !panas_negative_4 || !panas_negative_5) {
      return NextResponse.json(
        { success: false, error: '모든 PANAS 문항에 응답해주세요.' },
        { status: 400 }
      );
    }

    // PANAS 점수 계산
    const panas_positive = parseInt(panas_positive_1) + parseInt(panas_positive_2) + parseInt(panas_positive_3) + parseInt(panas_positive_4) + parseInt(panas_positive_5);
    const panas_negative = parseInt(panas_negative_1) + parseInt(panas_negative_2) + parseInt(panas_negative_3) + parseInt(panas_negative_4) + parseInt(panas_negative_5);

    // 참여자 ID 조회 (UUID 또는 identifier)
    const isUUID = participantId.length === 36 && participantId.includes('-');
    let participant;

    if (isUUID) {
      const { data } = await supabase
        .from('thesis_participants')
        .select('id')
        .eq('id', participantId)
        .single();
      participant = data;
    } else {
      const { data } = await supabase
        .from('thesis_participants')
        .select('id')
        .eq('identifier', participantId)
        .single();
      participant = data;
    }

    if (!participant) {
      return NextResponse.json(
        { success: false, error: '참여자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 기존 데이터 확인
    const { data: existing } = await supabase
      .from('thesis_mid_test_responses')
      .select('id')
      .eq('participant_id', participant.id)
      .single();

    let result;

    if (existing) {
      // 이미 존재하면 UPDATE
      const { data, error } = await supabase
        .from('thesis_mid_test_responses')
        .update({
          panas_positive_1: parseInt(panas_positive_1),
          panas_positive_2: parseInt(panas_positive_2),
          panas_positive_3: parseInt(panas_positive_3),
          panas_positive_4: parseInt(panas_positive_4),
          panas_positive_5: parseInt(panas_positive_5),
          panas_negative_1: parseInt(panas_negative_1),
          panas_negative_2: parseInt(panas_negative_2),
          panas_negative_3: parseInt(panas_negative_3),
          panas_negative_4: parseInt(panas_negative_4),
          panas_negative_5: parseInt(panas_negative_5),
          panas_positive_score: panas_positive,
          panas_negative_score: panas_negative,
        })
        .eq('participant_id', participant.id)
        .select()
        .single();

      if (error) {
        console.error('Mid-test update error:', error);
        return NextResponse.json(
          { success: false, error: '중간 검사 결과 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 새로 삽입
      const { data, error } = await supabase
        .from('thesis_mid_test_responses')
        .insert({
          participant_id: participant.id,
          panas_positive_1: parseInt(panas_positive_1),
          panas_positive_2: parseInt(panas_positive_2),
          panas_positive_3: parseInt(panas_positive_3),
          panas_positive_4: parseInt(panas_positive_4),
          panas_positive_5: parseInt(panas_positive_5),
          panas_negative_1: parseInt(panas_negative_1),
          panas_negative_2: parseInt(panas_negative_2),
          panas_negative_3: parseInt(panas_negative_3),
          panas_negative_4: parseInt(panas_negative_4),
          panas_negative_5: parseInt(panas_negative_5),
          panas_positive_score: panas_positive,
          panas_negative_score: panas_negative,
        })
        .select()
        .single();

      if (error) {
        console.error('Mid-test insert error:', error);
        return NextResponse.json(
          { success: false, error: '중간 검사 결과 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log(`Mid-test saved for participant ${participantId}`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        panas_positive_score: result.panas_positive_score,
        panas_negative_score: result.panas_negative_score,
      },
    });
  } catch (error) {
    console.error('Mid-test API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
