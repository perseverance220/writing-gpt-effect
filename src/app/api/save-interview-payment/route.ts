import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, interviewWilling, interviewContact, paymentMethod, paymentInfo } = await request.json();

    if (!participantId || paymentMethod === undefined || !paymentInfo) {
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

    // participants 테이블에 인터뷰 및 결제 정보 업데이트
    const { data, error } = await supabase
      .from('thesis_participants')
      .update({
        interview_willing: interviewWilling || false,
        interview_contact: interviewContact || null,
        payment_method: paymentMethod,
        payment_info: paymentInfo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participant.id)
      .select();

    if (error) {
      console.error('Interview-payment save error:', error);
      return NextResponse.json(
        { success: false, error: '정보 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // descriptive_responses 테이블에도 인터뷰 의향 업데이트 (중복이지만 편의상)
    await supabase
      .from('thesis_descriptive_responses')
      .update({
        interview_consent: interviewWilling || false,
        interview_contact: interviewContact || null,
      })
      .eq('participant_id', participant.id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Save interview-payment API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
