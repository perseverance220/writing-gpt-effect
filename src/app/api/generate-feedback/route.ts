import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 단계별 시스템 프롬프트 (한국어)
const STAGE_SYSTEM_PROMPTS: Record<number, string> = {
  1: `당신은 전문 심리 상담가입니다. 참여자의 글에 대해 공통인류성 관점에서 따뜻하고 공감적인 피드백을 제공해주세요.

공통인류성: 이러한 어려움은 혼자만 겪는 것이 아니며, 많은 사람들이 비슷한 경험을 한다는 것을 상기시켜주세요.

반드시 한국어로만 응답하며, 따뜻하고 공감적인 어조를 유지해주세요.

[윤리적 안전 지침]
참여자의 글에서 자살, 자해, 타해 등 생명에 대한 즉각적인 위험 징후가 명확히 감지될 경우, 일반적인 공감 피드백 대신 다음의 메시지를 반드시 포함하여 전문가의 도움을 받을 것을 권고해주세요:
"지금 많이 힘드신 것 같습니다. 만약 안전이 우려되거나 즉각적인 도움이 필요하시다면, 전문가에게 도움을 요청하거나 24시간 상담 전화(1577-0199, 1393)로 연락해 주시기를 부탁드립니다."

중요: 이것은 일회성 피드백입니다. 추가 질문을 하거나, 후속 대화를 유도하거나, "더 이야기해 주세요", "필요하면 말씀해 주세요" 같은 표현을 사용하지 마세요. 완결된 위로와 격려로 마무리하세요.`,

  2: `당신은 전문 심리 상담가입니다. 참여자의 글에 대해 자기친절 관점에서 따뜻하고 공감적인 피드백을 제공해주세요.

자기친절: 참여자의 고통과 어려움을 공감으로 인정하고 위로해주세요. 자기자비와 자기돌봄을 격려하고 지지해주세요.

반드시 한국어로만 응답하며, 따뜻하고 공감적인 어조를 유지해주세요.

[윤리적 안전 지침]
참여자의 글에서 자살, 자해, 타해 등 생명에 대한 즉각적인 위험 징후가 명확히 감지될 경우, 일반적인 공감 피드백 대신 다음의 메시지를 반드시 포함하여 전문가의 도움을 받을 것을 권고해주세요:
"지금 많이 힘드신 것 같습니다. 만약 안전이 우려되거나 즉각적인 도움이 필요하시다면, 전문가에게 도움을 요청하거나 24시간 상담 전화(1577-0199, 1393)로 연락해 주시기를 부탁드립니다."

중요: 이것은 일회성 피드백입니다. 추가 질문을 하거나, 후속 대화를 유도하거나, "더 이야기해 주세요", "필요하면 말씀해 주세요" 같은 표현을 사용하지 마세요. 완결된 위로와 격려로 마무리하세요.`,

  3: `당신은 전문 심리 상담가입니다. 참여자의 글에 대해 마음챙김 관점에서 따뜻하고 공감적인 피드백을 제공해주세요.

마음챙김: 참여자가 자신의 감정을 비판단적으로 이해하고 수용할 수 있도록 도와주세요.

반드시 한국어로만 응답하며, 따뜻하고 공감적인 어조를 유지해주세요.

[윤리적 안전 지침]
참여자의 글에서 자살, 자해, 타해 등 생명에 대한 즉각적인 위험 징후가 명확히 감지될 경우, 일반적인 공감 피드백 대신 다음의 메시지를 반드시 포함하여 전문가의 도움을 받을 것을 권고해주세요:
"지금 많이 힘드신 것 같습니다. 만약 안전이 우려되거나 즉각적인 도움이 필요하시다면, 전문가에게 도움을 요청하거나 24시간 상담 전화(1577-0199, 1393)로 연락해 주시기를 부탁드립니다."

중요: 이것은 일회성 피드백입니다. 추가 질문을 하거나, 후속 대화를 유도하거나, "더 이야기해 주세요", "필요하면 말씀해 주세요" 같은 표현을 사용하지 마세요. 완결된 위로와 격려로 마무리하세요.`,
};

export async function POST(request: NextRequest) {
  try {
    const { userWriting, stage } = await request.json();

    if (!userWriting || !userWriting.trim()) {
      return NextResponse.json(
        { error: '글 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 단계별 사용자 프롬프트 (한국어) - 간결하게
    const stagePrompts: Record<number, string> = {
      1: `참여자가 다음과 같이 작성했습니다:\n\n"${userWriting}"\n\n위 글에 대해 공감적인 피드백을 제공해주세요.`,
      2: `참여자가 다음과 같이 작성했습니다:\n\n"${userWriting}"\n\n위 글에 대해 공감적인 피드백을 제공해주세요.`,
      3: `참여자가 다음과 같이 작성했습니다:\n\n"${userWriting}"\n\n위 글에 대해 공감적인 피드백을 제공해주세요.`,
    };

    const systemPrompt = STAGE_SYSTEM_PROMPTS[stage as keyof typeof STAGE_SYSTEM_PROMPTS] || STAGE_SYSTEM_PROMPTS[1];
    const userPrompt = stagePrompts[stage as keyof typeof stagePrompts] ||
      `참여자가 다음과 같이 작성했습니다:\n\n"${userWriting}"\n\n공감적인 피드백을 제공해주세요.`;

    const startTime = Date.now();

    console.log('[generate-feedback] Calling GPT-5-mini API...');

    // GPT-5-mini 비스트리밍 호출 (완료 후 한번에 반환)
    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 2000,
      stream: false,
    });

    const responseTime = Date.now() - startTime;

    console.log('[generate-feedback] Completion structure check:');
    console.log('- completion exists:', !!completion);
    console.log('- completion.choices exists:', !!completion.choices);
    console.log('- completion.choices.length:', completion.choices?.length);
    console.log('- completion.choices[0] exists:', !!completion.choices?.[0]);
    console.log('- completion.choices[0].message exists:', !!completion.choices?.[0]?.message);
    console.log('- completion.choices[0].message.content:', completion.choices?.[0]?.message?.content);
    console.log('- completion.choices[0].message keys:', Object.keys(completion.choices?.[0]?.message || {}));
    console.log('- Full first choice:', JSON.stringify(completion.choices?.[0], null, 2));

    const feedbackContent = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;

    console.log('[generate-feedback] GPT response received:', {
      responseTime,
      tokensUsed,
      feedbackLength: feedbackContent.length,
      hasContent: !!feedbackContent,
    });

    return NextResponse.json({
      success: true,
      feedback: feedbackContent,
      metadata: {
        tokensUsed,
        responseTimeMs: responseTime,
        systemPrompt,
        userPrompt,
      },
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'AI 피드백 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
