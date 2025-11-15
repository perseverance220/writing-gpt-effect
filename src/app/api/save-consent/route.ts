import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, consents } = await request.json();

    // 입력값 검증
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json(
        { success: false, error: '참여자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!consents || typeof consents !== 'object') {
      return NextResponse.json(
        { success: false, error: '동의 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 4가지 동의가 모두 true인지 확인
    const { purpose, privacy, voluntary, dataUsage } = consents;
    if (!purpose || !privacy || !voluntary || !dataUsage) {
      return NextResponse.json(
        { success: false, error: '모든 항목에 동의해야 합니다.' },
        { status: 400 }
      );
    }

    // IP 주소 가져오기 (optional)
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      null;

    // DB에 동의 정보 저장 (UPSERT)
    const { data, error } = await supabase
      .from('thesis_consent')
      .upsert({
        participant_id: participantId,
        consent_purpose: purpose,
        consent_privacy: privacy,
        consent_voluntary: voluntary,
        consent_data_usage: dataUsage,
        ip_address: ipAddress,
        consented_at: new Date().toISOString(),
      }, {
        onConflict: 'participant_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Consent save error:', error);
      return NextResponse.json(
        { success: false, error: '동의 정보 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log(`Consent saved for participant ${participantId}`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        allConsentsGiven: data.all_consents_given,
        consentedAt: data.consented_at,
      },
    });
  } catch (error) {
    console.error('Consent API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
