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

    // SCS 점수 계산 (역채점 문항 처리)
    // 역채점: 1, 4, 8, 9, 11, 12
    // Over-identification: 1, 9 / Isolation: 4, 8 / Self-Judgment: 11, 12
    const reverseItems = [1, 4, 8, 9, 11, 12]; // 역채점 문항
    let scsSum = 0;

    for (let i = 1; i <= 12; i++) {
      const value = parseInt(responses[`scs${i}`]);
      if (reverseItems.includes(i)) {
        // 역채점: 1→5, 2→4, 3→3, 4→2, 5→1
        scsSum += (6 - value);
      } else {
        scsSum += value;
      }
    }

    // SCS 평균 점수 계산 (1-5점 범위)
    const scsTotal = scsSum / 12;

    // PANAS 점수 계산
    const panasPositiveItems = [1, 3, 5, 9, 10];
    const panasNegativeItems = [2, 4, 6, 7, 8];

    let panasPositive = 0;
    let panasNegative = 0;

    panasPositiveItems.forEach(i => {
      panasPositive += parseInt(responses[`panas${i}`]);
    });

    panasNegativeItems.forEach(i => {
      panasNegative += parseInt(responses[`panas${i}`]);
    });

    // GAS 점수 계산 (0-3점 척도)
    let gasTotal = 0;
    for (let i = 1; i <= 10; i++) {
      gasTotal += parseInt(responses[`gas${i}`]);
    }

    // 기존 사후 검사 데이터 확인
    const { data: existingPostTest } = await supabase
      .from('thesis_post_test_responses')
      .select('id')
      .eq('participant_id', participant.id)
      .single();

    let result;

    if (existingPostTest) {
      // 기존 데이터 업데이트
      const { data, error } = await supabase
        .from('thesis_post_test_responses')
        .update({
          scs_1: parseInt(responses.scs1),
          scs_2: parseInt(responses.scs2),
          scs_3: parseInt(responses.scs3),
          scs_4: parseInt(responses.scs4),
          scs_5: parseInt(responses.scs5),
          scs_6: parseInt(responses.scs6),
          scs_7: parseInt(responses.scs7),
          scs_8: parseInt(responses.scs8),
          scs_9: parseInt(responses.scs9),
          scs_10: parseInt(responses.scs10),
          scs_11: parseInt(responses.scs11),
          scs_12: parseInt(responses.scs12),
          scs_total_score: scsTotal,
          panas_positive_1: parseInt(responses.panas1),
          panas_positive_2: parseInt(responses.panas3),
          panas_positive_3: parseInt(responses.panas5),
          panas_positive_4: parseInt(responses.panas9),
          panas_positive_5: parseInt(responses.panas10),
          panas_negative_1: parseInt(responses.panas2),
          panas_negative_2: parseInt(responses.panas4),
          panas_negative_3: parseInt(responses.panas6),
          panas_negative_4: parseInt(responses.panas7),
          panas_negative_5: parseInt(responses.panas8),
          panas_positive_score: panasPositive,
          panas_negative_score: panasNegative,
          gas_1: parseInt(responses.gas1),
          gas_2: parseInt(responses.gas2),
          gas_3: parseInt(responses.gas3),
          gas_4: parseInt(responses.gas4),
          gas_5: parseInt(responses.gas5),
          gas_6: parseInt(responses.gas6),
          gas_7: parseInt(responses.gas7),
          gas_8: parseInt(responses.gas8),
          gas_9: parseInt(responses.gas9),
          gas_10: parseInt(responses.gas10),
          gas_total_score: gasTotal,
          completed_at: new Date().toISOString(),
        })
        .eq('id', existingPostTest.id)
        .select();

      result = { data, error };
    } else {
      // 새 데이터 삽입
      const { data, error } = await supabase
        .from('thesis_post_test_responses')
        .insert({
          participant_id: participant.id,
          scs_1: parseInt(responses.scs1),
          scs_2: parseInt(responses.scs2),
          scs_3: parseInt(responses.scs3),
          scs_4: parseInt(responses.scs4),
          scs_5: parseInt(responses.scs5),
          scs_6: parseInt(responses.scs6),
          scs_7: parseInt(responses.scs7),
          scs_8: parseInt(responses.scs8),
          scs_9: parseInt(responses.scs9),
          scs_10: parseInt(responses.scs10),
          scs_11: parseInt(responses.scs11),
          scs_12: parseInt(responses.scs12),
          scs_total_score: scsTotal,
          panas_positive_1: parseInt(responses.panas1),
          panas_positive_2: parseInt(responses.panas3),
          panas_positive_3: parseInt(responses.panas5),
          panas_positive_4: parseInt(responses.panas9),
          panas_positive_5: parseInt(responses.panas10),
          panas_negative_1: parseInt(responses.panas2),
          panas_negative_2: parseInt(responses.panas4),
          panas_negative_3: parseInt(responses.panas6),
          panas_negative_4: parseInt(responses.panas7),
          panas_negative_5: parseInt(responses.panas8),
          panas_positive_score: panasPositive,
          panas_negative_score: panasNegative,
          gas_1: parseInt(responses.gas1),
          gas_2: parseInt(responses.gas2),
          gas_3: parseInt(responses.gas3),
          gas_4: parseInt(responses.gas4),
          gas_5: parseInt(responses.gas5),
          gas_6: parseInt(responses.gas6),
          gas_7: parseInt(responses.gas7),
          gas_8: parseInt(responses.gas8),
          gas_9: parseInt(responses.gas9),
          gas_10: parseInt(responses.gas10),
          gas_total_score: gasTotal,
          completed_at: new Date().toISOString(),
        })
        .select();

      result = { data, error };
    }

    if (result.error) {
      console.error('Post-test save error:', result.error);
      return NextResponse.json(
        { success: false, error: '사후 검사 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      scores: {
        scs_total: scsTotal,
        panas_positive: panasPositive,
        panas_negative: panasNegative,
        gas_total: gasTotal,
      },
    });
  } catch (error) {
    console.error('Post-test API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
