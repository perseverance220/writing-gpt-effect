import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, taskType, writingContent, wordCount, durationSeconds } = await request.json();

    // 입력값 검증
    if (!participantId || typeof participantId !== 'string') {
      return NextResponse.json(
        { success: false, error: '참여자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!taskType || !['negative_event', 'common_humanity', 'self_kindness', 'mindfulness', 'neutral'].includes(taskType)) {
      return NextResponse.json(
        { success: false, error: '유효한 과제 유형이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!writingContent || typeof writingContent !== 'string' || !writingContent.trim()) {
      return NextResponse.json(
        { success: false, error: '작성 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // DB에 저장
    const { data, error } = await supabase
      .from('thesis_writing_tasks')
      .insert({
        participant_id: participantId,
        task_type: taskType,
        writing_content: writingContent,
        word_count: wordCount || null,
        duration_seconds: durationSeconds || null,
        started_at: new Date(Date.now() - (durationSeconds || 0) * 1000).toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Writing task save error:', error);
      return NextResponse.json(
        { success: false, error: '글쓰기 내용 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    console.log(`Writing task saved: ${taskType} for participant ${participantId}`);

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        taskType: data.task_type,
        wordCount: data.word_count,
        completedAt: data.completed_at,
      },
    });
  } catch (error) {
    console.error('Writing task API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
