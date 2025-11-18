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

    // 각 척도별 응답 추출
    const {
      scs1, scs2, scs3, scs4, scs5, scs6,
      scs7, scs8, scs9, scs10, scs11, scs12,
      panas1, panas2, panas3, panas4, panas5,
      panas6, panas7, panas8, panas9, panas10,
      gas1, gas2, gas3, gas4, gas5,
      gas6, gas7, gas8, gas9, gas10
    } = responses;

    // SCS 점수 계산 (역채점 항목 고려)
    // 역채점: scs1, scs4, scs8, scs9, scs11, scs12
    // Over-identification: 1, 9 / Isolation: 4, 8 / Self-Judgment: 11, 12
    const reverseScore = (score: number) => 6 - score;

    const scs_total = (
      reverseScore(parseInt(scs1)) +   // 역채점
      parseInt(scs2) +
      parseInt(scs3) +
      reverseScore(parseInt(scs4)) +   // 역채점
      parseInt(scs5) +
      parseInt(scs6) +
      parseInt(scs7) +
      reverseScore(parseInt(scs8)) +   // 역채점
      reverseScore(parseInt(scs9)) +   // 역채점
      parseInt(scs10) +
      reverseScore(parseInt(scs11)) +  // 역채점
      reverseScore(parseInt(scs12))    // 역채점
    ) / 12;

    // PANAS 점수 계산
    // Positive: panas1, panas3, panas5, panas9, panas10
    // Negative: panas2, panas4, panas6, panas7, panas8
    const panas_positive = parseInt(panas1) + parseInt(panas3) + parseInt(panas5) + parseInt(panas9) + parseInt(panas10);
    const panas_negative = parseInt(panas2) + parseInt(panas4) + parseInt(panas6) + parseInt(panas7) + parseInt(panas8);

    // GAS 점수 계산 (단순 합산)
    const gas_total = parseInt(gas1) + parseInt(gas2) + parseInt(gas3) + parseInt(gas4) + parseInt(gas5) +
                      parseInt(gas6) + parseInt(gas7) + parseInt(gas8) + parseInt(gas9) + parseInt(gas10);

    // 기존 데이터 확인
    const { data: existing } = await supabase
      .from('thesis_pre_test_responses')
      .select('id')
      .eq('participant_id', participantId)
      .single();

    let result;

    if (existing) {
      // 이미 존재하면 UPDATE
      const { data, error } = await supabase
        .from('thesis_pre_test_responses')
        .update({
          scs_1: parseInt(scs1),
          scs_2: parseInt(scs2),
          scs_3: parseInt(scs3),
          scs_4: parseInt(scs4),
          scs_5: parseInt(scs5),
          scs_6: parseInt(scs6),
          scs_7: parseInt(scs7),
          scs_8: parseInt(scs8),
          scs_9: parseInt(scs9),
          scs_10: parseInt(scs10),
          scs_11: parseInt(scs11),
          scs_12: parseInt(scs12),
          scs_total_score: scs_total,
          panas_positive_1: parseInt(panas1),
          panas_positive_2: parseInt(panas3),
          panas_positive_3: parseInt(panas5),
          panas_positive_4: parseInt(panas9),
          panas_positive_5: parseInt(panas10),
          panas_negative_1: parseInt(panas2),
          panas_negative_2: parseInt(panas4),
          panas_negative_3: parseInt(panas6),
          panas_negative_4: parseInt(panas7),
          panas_negative_5: parseInt(panas8),
          panas_positive_score: panas_positive,
          panas_negative_score: panas_negative,
          gas_1: parseInt(gas1),
          gas_2: parseInt(gas2),
          gas_3: parseInt(gas3),
          gas_4: parseInt(gas4),
          gas_5: parseInt(gas5),
          gas_6: parseInt(gas6),
          gas_7: parseInt(gas7),
          gas_8: parseInt(gas8),
          gas_9: parseInt(gas9),
          gas_10: parseInt(gas10),
          gas_total_score: gas_total,
        })
        .eq('participant_id', participantId)
        .select()
        .single();

      if (error) {
        console.error('Pre-test update error:', error);
        return NextResponse.json(
          { success: false, error: '사전 검사 결과 업데이트 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // 새로 삽입
      const { data, error } = await supabase
        .from('thesis_pre_test_responses')
        .insert({
          participant_id: participantId,
          scs_1: parseInt(scs1),
          scs_2: parseInt(scs2),
          scs_3: parseInt(scs3),
          scs_4: parseInt(scs4),
          scs_5: parseInt(scs5),
          scs_6: parseInt(scs6),
          scs_7: parseInt(scs7),
          scs_8: parseInt(scs8),
          scs_9: parseInt(scs9),
          scs_10: parseInt(scs10),
          scs_11: parseInt(scs11),
          scs_12: parseInt(scs12),
          scs_total_score: scs_total,
          panas_positive_1: parseInt(panas1),
          panas_positive_2: parseInt(panas3),
          panas_positive_3: parseInt(panas5),
          panas_positive_4: parseInt(panas9),
          panas_positive_5: parseInt(panas10),
          panas_negative_1: parseInt(panas2),
          panas_negative_2: parseInt(panas4),
          panas_negative_3: parseInt(panas6),
          panas_negative_4: parseInt(panas7),
          panas_negative_5: parseInt(panas8),
          panas_positive_score: panas_positive,
          panas_negative_score: panas_negative,
          gas_1: parseInt(gas1),
          gas_2: parseInt(gas2),
          gas_3: parseInt(gas3),
          gas_4: parseInt(gas4),
          gas_5: parseInt(gas5),
          gas_6: parseInt(gas6),
          gas_7: parseInt(gas7),
          gas_8: parseInt(gas8),
          gas_9: parseInt(gas9),
          gas_10: parseInt(gas10),
          gas_total_score: gas_total,
        })
        .select()
        .single();

      if (error) {
        console.error('Pre-test insert error:', error);
        return NextResponse.json(
          { success: false, error: '사전 검사 결과 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log(`Pre-test saved for participant ${participantId}`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        scs_total_score: result.scs_total_score,
        panas_positive_score: result.panas_positive_score,
        panas_negative_score: result.panas_negative_score,
        gas_total_score: result.gas_total_score,
      },
    });
  } catch (error) {
    console.error('Pre-test API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
