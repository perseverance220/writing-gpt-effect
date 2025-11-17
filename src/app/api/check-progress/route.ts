import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get('participantId');

    if (!participantId) {
      return NextResponse.json(
        { success: false, error: '참여자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 참여자 정보 조회 (UUID 또는 identifier로 조회)
    let participant;
    let participantError;

    // UUID 형식인지 확인 (하이픈 포함 36자)
    const isUUID = participantId.length === 36 && participantId.includes('-');

    if (isUUID) {
      // UUID로 조회
      const result = await supabase
        .from('thesis_participants')
        .select('id, identifier, group_assignment, status, payment_method, payment_info, interview_willing')
        .eq('id', participantId)
        .single();
      participant = result.data;
      participantError = result.error;
    } else {
      // identifier(6자리 코드)로 조회
      const result = await supabase
        .from('thesis_participants')
        .select('id, identifier, group_assignment, status, payment_method, payment_info, interview_willing')
        .eq('identifier', participantId)
        .single();
      participant = result.data;
      participantError = result.error;
    }

    if (participantError || !participant) {
      return NextResponse.json(
        { success: false, error: '참여자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 각 단계 완료 여부 확인
    const [
      consentResult,
      demographicsResult,
      preTestResult,
      midTestResult,
      writingTasksResult,
      postTestResult,
      qualitativeResult,
    ] = await Promise.all([
      supabase.from('thesis_consent').select('id').eq('participant_id', participant.id).single(),
      supabase.from('thesis_demographics').select('id').eq('participant_id', participant.id).single(),
      supabase.from('thesis_pre_test_responses').select('id').eq('participant_id', participant.id).single(),
      supabase.from('thesis_mid_test_responses').select('id').eq('participant_id', participant.id).single(),
      supabase.from('thesis_writing_tasks').select('task_type').eq('participant_id', participant.id),
      supabase.from('thesis_post_test_responses').select('id').eq('participant_id', participant.id).single(),
      supabase.from('thesis_descriptive_responses').select('id').eq('participant_id', participant.id).single(),
    ]);

    const hasConsent = !!consentResult.data;
    const hasDemographics = !!demographicsResult.data;
    const hasPreTest = !!preTestResult.data;
    const hasMidTest = !!midTestResult.data;
    const hasPostTest = !!postTestResult.data;
    const hasQualitative = !!qualitativeResult.data;
    const writingTasks = writingTasksResult.data || [];

    const hasNegativeEvent = writingTasks.some(t => t.task_type === 'negative_event');
    const hasSelfCompassion = writingTasks.some(t =>
      ['common_humanity', 'self_kindness', 'mindfulness'].includes(t.task_type)
    );
    const hasNeutralWriting = writingTasks.some(t => t.task_type === 'neutral');

    // 인터뷰 및 결제 정보 확인
    const hasInterviewPayment = participant.payment_method && participant.payment_info;

    // 다음에 진행해야 할 페이지 결정
    let nextStep = '/consent';

    if (!hasConsent) {
      nextStep = '/consent';
    } else if (!hasDemographics) {
      nextStep = '/demographics';
    } else if (!hasPreTest) {
      nextStep = '/pre-test/self-compassion';
    } else if (!hasNegativeEvent) {
      nextStep = '/negative-event';
    } else if (!hasMidTest) {
      // negative-event 후에는 무조건 mid-test
      nextStep = '/mid-test';
    } else if (participant.group_assignment === 'C' && !hasNeutralWriting) {
      nextStep = '/neutral-writing';
    } else if (['A', 'B'].includes(participant.group_assignment) && !hasSelfCompassion) {
      nextStep = '/intervention';
    } else if (!hasPostTest) {
      // 중재 완료 후 사후 검사
      nextStep = '/post-test/self-compassion';
    } else if (!hasQualitative) {
      // 사후 검사 완료 후 서술형 질문
      nextStep = '/post-test/qualitative';
    } else if (!hasInterviewPayment) {
      // 서술형 완료 후 인터뷰 및 결제 정보
      nextStep = '/post-test/interview-payment';
    } else {
      // 모든 단계 완료 시
      nextStep = '/post-test/complete';
    }

    return NextResponse.json({
      success: true,
      data: {
        participantId: participant.identifier,
        groupAssignment: participant.group_assignment,
        status: participant.status,
        progress: {
          hasConsent,
          hasDemographics,
          hasPreTest,
          hasNegativeEvent,
          hasMidTest,
          hasSelfCompassion,
          hasNeutralWriting,
          hasPostTest,
          hasQualitative,
          hasInterviewPayment,
        },
        nextStep,
      },
    });
  } catch (error) {
    console.error('Check progress API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
