import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // URL에서 참여자 ID 가져오기 (옵션)
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId');

    // 글쓰기 과제 조회 (GPT 피드백과 조인)
    let query = supabase
      .from('thesis_writing_tasks')
      .select(`
        *,
        participant:thesis_participants(
          identifier,
          group_assignment
        ),
        gpt_feedback:thesis_gpt_feedback(*)
      `)
      .order('completed_at', { ascending: false });

    if (participantId) {
      query = query.eq('participant_id', participantId);
    }

    const { data: interventions, error } = await query;

    if (error) {
      console.error('Interventions fetch error:', error);
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ interventions });
  } catch (error) {
    console.error('Admin interventions error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
