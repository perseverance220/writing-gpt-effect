import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 간단한 인증 체크 (헤더에서 확인)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'admin:admin0209') {
      return NextResponse.json(
        { success: false, error: '인증되지 않았습니다.' },
        { status: 401 }
      );
    }

    // 모든 참여자 정보 조회
    const { data: participants, error: participantsError } = await supabase
      .from('thesis_participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (participantsError) {
      console.error('Participants fetch error:', participantsError);
      return NextResponse.json(
        { success: false, error: '참여자 정보 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 각 참여자의 상세 데이터 조회
    const participantsWithDetails = await Promise.all(
      participants.map(async (participant) => {
        const [
          consent,
          demographics,
          preTest,
          midTest,
          postTest,
          writingTasks,
          gptFeedbacks,
          qualitative,
        ] = await Promise.all([
          supabase.from('thesis_consent').select('*').eq('participant_id', participant.id).single(),
          supabase.from('thesis_demographics').select('*').eq('participant_id', participant.id).single(),
          supabase.from('thesis_pre_test_responses').select('*').eq('participant_id', participant.id).single(),
          supabase.from('thesis_mid_test_responses').select('*').eq('participant_id', participant.id).single(),
          supabase.from('thesis_post_test_responses').select('*').eq('participant_id', participant.id).single(),
          supabase.from('thesis_writing_tasks').select('*').eq('participant_id', participant.id).order('completed_at', { ascending: true }),
          supabase.from('thesis_gpt_feedback').select('*').eq('participant_id', participant.id),
          supabase.from('thesis_descriptive_responses').select('*').eq('participant_id', participant.id).single(),
        ]);

        // GPT 피드백을 writing_task_id로 매핑
        console.log(`[DEBUG] Participant ${participant.identifier}:`);
        console.log(`  - gptFeedbacks.data:`, gptFeedbacks.data);
        console.log(`  - gptFeedbacks.error:`, gptFeedbacks.error);
        console.log(`  - writingTasks.data:`, writingTasks.data);

        const feedbackMap = new Map();
        (gptFeedbacks.data || []).forEach(feedback => {
          console.log(`  - Mapping feedback: writing_task_id=${feedback.writing_task_id}, feedback_content length=${feedback.feedback_content?.length || 0}`);
          feedbackMap.set(feedback.writing_task_id, feedback);
        });

        console.log(`  - feedbackMap size: ${feedbackMap.size}`);
        console.log(`  - feedbackMap keys:`, Array.from(feedbackMap.keys()));

        return {
          ...participant,
          group: participant.group_assignment,
          consent: consent.data,
          demographics: demographics.data,
          preTest: {
            ...preTest.data,
            scs_total: preTest.data?.scs_total_score,
            panas_positive: preTest.data?.panas_positive_score,
            panas_negative: preTest.data?.panas_negative_score,
            gas_total: preTest.data?.gas_total_score,
          },
          midTest: {
            ...midTest.data,
            panas_positive: midTest.data?.panas_positive_score,
            panas_negative: midTest.data?.panas_negative_score,
          },
          postTest: {
            ...postTest.data,
            scs_total: postTest.data?.scs_total_score,
            panas_positive: postTest.data?.panas_positive_score,
            panas_negative: postTest.data?.panas_negative_score,
            gas_total: postTest.data?.gas_total_score,
          },
          writingTasks: (writingTasks.data || []).map(task => {
            const feedback = feedbackMap.get(task.id);
            console.log(`  - Task ${task.task_type} (id=${task.id}): feedback found=${!!feedback}, feedback_content length=${feedback?.feedback_content?.length || 0}`);
            return {
              ...task,
              task_type: task.task_type,
              content: task.writing_content,
              word_count: task.word_count,
              duration_seconds: task.duration_seconds,
              gpt_feedback: feedback?.feedback_content || null,
              gpt_model: feedback?.model_version || null,
              gpt_tokens: feedback?.tokens_used || null,
              gpt_response_time: feedback?.response_time_ms || null,
            };
          }),
          qualitative: {
            q1: qualitative.data?.q1_negative_experience,
            q2: qualitative.data?.q2_intervention_experience,
            q3: qualitative.data?.q3_anxiety_change,
            q4: qualitative.data?.q4_self_care_thoughts,
            q5: qualitative.data?.q5_online_program_experience,
            q6: qualitative.data?.q6_daily_life_impact,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: participantsWithDetails,
      count: participantsWithDetails.length,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
