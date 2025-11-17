import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const {
      participantId,
      taskType,
      writingContent,
      wordCount,
      durationSeconds,
      gptFeedback,
      gptPrompt,
      modelVersion,
      tokensUsed,
      responseTimeMs,
    } = await request.json();

    console.log('[save-intervention] Received request:', {
      participantId,
      taskType,
      wordCount,
      durationSeconds,
      hasGptFeedback: !!gptFeedback,
    });

    // 1. 글쓰기 과제 저장
    const { data: writingTask, error: writingError } = await supabase
      .from('thesis_writing_tasks')
      .insert({
        participant_id: participantId,
        task_type: taskType,
        writing_content: writingContent,
        word_count: wordCount,
        duration_seconds: durationSeconds,
        started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (writingError) {
      console.error('[save-intervention] Writing task save error:', writingError);
      return NextResponse.json(
        { error: '글쓰기 데이터 저장에 실패했습니다.', details: writingError },
        { status: 500 }
      );
    }

    console.log('[save-intervention] Writing task saved successfully:', writingTask.id);

    // 2. GPT 피드백이 있으면 저장 (A집단만)
    if (gptFeedback && writingTask) {
      console.log('[save-intervention] Saving GPT feedback for task:', writingTask.id);
      const { error: feedbackError } = await supabase
        .from('thesis_gpt_feedback')
        .insert({
          participant_id: participantId,
          writing_task_id: writingTask.id,
          prompt_used: gptPrompt || '',
          feedback_content: gptFeedback,
          model_version: modelVersion || 'gpt-5-mini',
          tokens_used: tokensUsed,
          response_time_ms: responseTimeMs,
          is_fallback: false,
        });

      if (feedbackError) {
        console.error('[save-intervention] GPT feedback save error:', feedbackError);
        // 피드백 저장 실패해도 글쓰기는 저장되었으므로 계속 진행
      } else {
        console.log('[save-intervention] GPT feedback saved successfully');
      }
    }

    console.log('[save-intervention] Save completed successfully');
    return NextResponse.json({
      success: true,
      writingTaskId: writingTask.id,
    });
  } catch (error) {
    console.error('[save-intervention] Save intervention error:', error);
    return NextResponse.json(
      { error: '데이터 저장 중 오류가 발생했습니다.', details: error },
      { status: 500 }
    );
  }
}
