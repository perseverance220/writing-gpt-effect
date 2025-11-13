# 🗄️ 데이터베이스 스키마 설계 (Supabase)

## 개요

이 문서는 노년기 여성 자기자비 글쓰기 연구를 위한 Supabase(PostgreSQL) 데이터베이스 스키마를 정의합니다.

### 명명 규칙
- **테이블 prefix**: `thesis_` (songstark-web 프로젝트와 공유하는 DB)
- **컬럼명**: snake_case
- **Primary Key**: `id UUID DEFAULT uuid_generate_v4()`
- **타임스탬프**: `created_at`, `updated_at`, `completed_at`

---

## 테이블 목록

1. [thesis_participants](#1-thesis_participants) - 참여자 기본 정보
2. [thesis_demographics](#2-thesis_demographics) - 인구통계 데이터
3. [thesis_pre_test_responses](#3-thesis_pre_test_responses) - 사전 검사 응답
4. [thesis_writing_tasks](#4-thesis_writing_tasks) - 글쓰기 과제
5. [thesis_gpt_feedback](#5-thesis_gpt_feedback) - GPT 피드백
6. [thesis_mid_test_responses](#6-thesis_mid_test_responses) - 중간 검사 응답
7. [thesis_post_test_responses](#7-thesis_post_test_responses) - 사후 검사 응답
8. [thesis_descriptive_responses](#8-thesis_descriptive_responses) - 서술형 응답
9. [thesis_session_progress](#9-thesis_session_progress) - 세션 진행 상태
10. [thesis_activity_log](#10-thesis_activity_log) - 활동 로그

---

## 1. thesis_participants
참여자 기본 정보 및 집단 배정

```sql
CREATE TABLE thesis_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 식별자 (카카오톡으로 전달, 예: WGE-2025-001)
  identifier VARCHAR(50) UNIQUE NOT NULL,

  -- 집단 배정 (A: GPT 피드백, B: 자기자비만, C: 중립)
  group_assignment VARCHAR(1) NOT NULL CHECK (group_assignment IN ('A', 'B', 'C')),

  -- 연령대 블록 (블록 무선배정용)
  age_block VARCHAR(10) CHECK (age_block IN ('60-64', '65-69', '70-74')),

  -- 진행 상태
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dropped')),

  -- 타임스탬프
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_participants_identifier ON thesis_participants(identifier);
CREATE INDEX idx_participants_status ON thesis_participants(status);
CREATE INDEX idx_participants_group ON thesis_participants(group_assignment);

-- 코멘트
COMMENT ON TABLE thesis_participants IS '연구 참여자 기본 정보';
COMMENT ON COLUMN thesis_participants.identifier IS '카카오톡으로 전달되는 고유 식별자';
COMMENT ON COLUMN thesis_participants.group_assignment IS 'A=GPT피드백, B=자기자비만, C=중립';
```

---

## 2. thesis_demographics
참여자 인구통계 정보

```sql
CREATE TABLE thesis_demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- 인구통계 정보
  age INTEGER NOT NULL CHECK (age >= 60 AND age <= 74),

  -- 학력 (초졸, 중졸, 고졸, 전문대졸, 대졸, 대학원졸)
  education_level VARCHAR(50) NOT NULL,

  -- 결혼 상태 (기혼, 미혼, 이혼, 사별)
  marital_status VARCHAR(20) NOT NULL,

  -- 동거 형태 (독거, 배우자와 동거, 자녀와 동거, 기타)
  living_arrangement VARCHAR(50) NOT NULL,

  -- 주요 스트레스 원인 (서술형)
  main_stressor TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_demographics_participant ON thesis_demographics(participant_id);

-- 코멘트
COMMENT ON TABLE thesis_demographics IS '참여자 인구통계 정보';
```

---

## 3. thesis_pre_test_responses
사전 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)

```sql
CREATE TABLE thesis_pre_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- SCS-SF-12 (Self-Compassion Scale - Short Form)
  -- 1=전혀 그렇지 않다, 2=그렇지 않다, 3=보통이다, 4=그렇다, 5=매우 그렇다
  scs_1 INTEGER CHECK (scs_1 BETWEEN 1 AND 5),
  scs_2 INTEGER CHECK (scs_2 BETWEEN 1 AND 5),
  scs_3 INTEGER CHECK (scs_3 BETWEEN 1 AND 5),
  scs_4 INTEGER CHECK (scs_4 BETWEEN 1 AND 5),
  scs_5 INTEGER CHECK (scs_5 BETWEEN 1 AND 5),
  scs_6 INTEGER CHECK (scs_6 BETWEEN 1 AND 5),
  scs_7 INTEGER CHECK (scs_7 BETWEEN 1 AND 5),
  scs_8 INTEGER CHECK (scs_8 BETWEEN 1 AND 5),
  scs_9 INTEGER CHECK (scs_9 BETWEEN 1 AND 5),
  scs_10 INTEGER CHECK (scs_10 BETWEEN 1 AND 5),
  scs_11 INTEGER CHECK (scs_11 BETWEEN 1 AND 5),
  scs_12 INTEGER CHECK (scs_12 BETWEEN 1 AND 5),

  -- 자기자비 총점 (계산값)
  scs_total_score DECIMAL(5,2),

  -- PANAS-SF-10 (Positive and Negative Affect Schedule - Short Form)
  -- 1=전혀 그렇지 않다, 5=매우 많이 그렇다
  -- 긍정 정서 5문항
  panas_positive_1 INTEGER CHECK (panas_positive_1 BETWEEN 1 AND 5), -- 흥미진진한
  panas_positive_2 INTEGER CHECK (panas_positive_2 BETWEEN 1 AND 5), -- 강한
  panas_positive_3 INTEGER CHECK (panas_positive_3 BETWEEN 1 AND 5), -- 열정적인
  panas_positive_4 INTEGER CHECK (panas_positive_4 BETWEEN 1 AND 5), -- 자랑스러운
  panas_positive_5 INTEGER CHECK (panas_positive_5 BETWEEN 1 AND 5), -- 활기찬

  -- 부정 정서 5문항
  panas_negative_1 INTEGER CHECK (panas_negative_1 BETWEEN 1 AND 5), -- 괴로운
  panas_negative_2 INTEGER CHECK (panas_negative_2 BETWEEN 1 AND 5), -- 두려운
  panas_negative_3 INTEGER CHECK (panas_negative_3 BETWEEN 1 AND 5), -- 죄책감 드는
  panas_negative_4 INTEGER CHECK (panas_negative_4 BETWEEN 1 AND 5), -- 적대적인
  panas_negative_5 INTEGER CHECK (panas_negative_5 BETWEEN 1 AND 5), -- 신경질적인

  -- PANAS 점수 (계산값)
  panas_positive_score DECIMAL(5,2),
  panas_negative_score DECIMAL(5,2),

  -- GAS-10 (Geriatric Anxiety Scale - 한국판 노인불안척도 단축형)
  -- 0=전혀 아니다, 1=가끔 그렇다, 2=자주 그렇다, 3=항상 그렇다
  gas_1 INTEGER CHECK (gas_1 BETWEEN 0 AND 3),
  gas_2 INTEGER CHECK (gas_2 BETWEEN 0 AND 3),
  gas_3 INTEGER CHECK (gas_3 BETWEEN 0 AND 3),
  gas_4 INTEGER CHECK (gas_4 BETWEEN 0 AND 3),
  gas_5 INTEGER CHECK (gas_5 BETWEEN 0 AND 3),
  gas_6 INTEGER CHECK (gas_6 BETWEEN 0 AND 3),
  gas_7 INTEGER CHECK (gas_7 BETWEEN 0 AND 3),
  gas_8 INTEGER CHECK (gas_8 BETWEEN 0 AND 3),
  gas_9 INTEGER CHECK (gas_9 BETWEEN 0 AND 3),
  gas_10 INTEGER CHECK (gas_10 BETWEEN 0 AND 3),

  -- GAS 총점 (계산값, 0-30점)
  gas_total_score INTEGER CHECK (gas_total_score BETWEEN 0 AND 30),

  -- 타임스탬프
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_pre_test_participant ON thesis_pre_test_responses(participant_id);

-- 코멘트
COMMENT ON TABLE thesis_pre_test_responses IS '사전 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)';
COMMENT ON COLUMN thesis_pre_test_responses.scs_total_score IS '자기자비 총점 (12-60점)';
COMMENT ON COLUMN thesis_pre_test_responses.panas_positive_score IS '긍정 정서 점수 (5-25점)';
COMMENT ON COLUMN thesis_pre_test_responses.panas_negative_score IS '부정 정서 점수 (5-25점)';
COMMENT ON COLUMN thesis_pre_test_responses.gas_total_score IS '노인 불안 총점 (0-30점)';
```

---

## 4. thesis_writing_tasks
글쓰기 과제 데이터

```sql
CREATE TABLE thesis_writing_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- 과제 유형
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
    'negative_event',      -- 부정적 사건 회상
    'common_humanity',     -- 공통인류성 (A/B집단)
    'self_kindness',       -- 자기친절 (A/B집단)
    'mindfulness',         -- 마음챙김 (A/B집단)
    'neutral'              -- 중립적 글쓰기 (C집단)
  )),

  -- 글쓰기 내용
  writing_content TEXT NOT NULL,

  -- 단어 수
  word_count INTEGER,

  -- 소요 시간 (초)
  duration_seconds INTEGER,

  -- 타임스탬프
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_writing_tasks_participant ON thesis_writing_tasks(participant_id);
CREATE INDEX idx_writing_tasks_type ON thesis_writing_tasks(task_type);

-- 코멘트
COMMENT ON TABLE thesis_writing_tasks IS '참여자 글쓰기 과제 데이터';
COMMENT ON COLUMN thesis_writing_tasks.task_type IS '과제 유형 (negative_event, common_humanity, self_kindness, mindfulness, neutral)';
```

---

## 5. thesis_gpt_feedback
ChatGPT 피드백 데이터 (A집단만)

```sql
CREATE TABLE thesis_gpt_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,
  writing_task_id UUID NOT NULL REFERENCES thesis_writing_tasks(id) ON DELETE CASCADE,

  -- 사용된 프롬프트
  prompt_used TEXT NOT NULL,

  -- GPT 피드백 내용
  feedback_content TEXT NOT NULL,

  -- 모델 버전
  model_version VARCHAR(50) DEFAULT 'gpt-4o-mini',

  -- 토큰 사용량
  tokens_used INTEGER,

  -- 응답 시간 (밀리초)
  response_time_ms INTEGER,

  -- Fallback 여부 (API 실패 시 사전 작성된 피드백 사용)
  is_fallback BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_gpt_feedback_participant ON thesis_gpt_feedback(participant_id);
CREATE INDEX idx_gpt_feedback_writing_task ON thesis_gpt_feedback(writing_task_id);

-- 코멘트
COMMENT ON TABLE thesis_gpt_feedback IS 'ChatGPT 피드백 데이터 (A집단만)';
COMMENT ON COLUMN thesis_gpt_feedback.is_fallback IS 'API 실패 시 사전 작성된 피드백 사용 여부';
```

---

## 6. thesis_mid_test_responses
중간 측정 (부정적 사건 회상 후 PANAS)

```sql
CREATE TABLE thesis_mid_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- PANAS-SF-10 (부정적 사건 회상 직후)
  panas_positive_1 INTEGER CHECK (panas_positive_1 BETWEEN 1 AND 5),
  panas_positive_2 INTEGER CHECK (panas_positive_2 BETWEEN 1 AND 5),
  panas_positive_3 INTEGER CHECK (panas_positive_3 BETWEEN 1 AND 5),
  panas_positive_4 INTEGER CHECK (panas_positive_4 BETWEEN 1 AND 5),
  panas_positive_5 INTEGER CHECK (panas_positive_5 BETWEEN 1 AND 5),

  panas_negative_1 INTEGER CHECK (panas_negative_1 BETWEEN 1 AND 5),
  panas_negative_2 INTEGER CHECK (panas_negative_2 BETWEEN 1 AND 5),
  panas_negative_3 INTEGER CHECK (panas_negative_3 BETWEEN 1 AND 5),
  panas_negative_4 INTEGER CHECK (panas_negative_4 BETWEEN 1 AND 5),
  panas_negative_5 INTEGER CHECK (panas_negative_5 BETWEEN 1 AND 5),

  panas_positive_score DECIMAL(5,2),
  panas_negative_score DECIMAL(5,2),

  -- 타임스탬프
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_mid_test_participant ON thesis_mid_test_responses(participant_id);

-- 코멘트
COMMENT ON TABLE thesis_mid_test_responses IS '중간 측정 (부정적 사건 회상 후 PANAS)';
```

---

## 7. thesis_post_test_responses
사후 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)

```sql
CREATE TABLE thesis_post_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- SCS-SF-12 (사후)
  scs_1 INTEGER CHECK (scs_1 BETWEEN 1 AND 5),
  scs_2 INTEGER CHECK (scs_2 BETWEEN 1 AND 5),
  scs_3 INTEGER CHECK (scs_3 BETWEEN 1 AND 5),
  scs_4 INTEGER CHECK (scs_4 BETWEEN 1 AND 5),
  scs_5 INTEGER CHECK (scs_5 BETWEEN 1 AND 5),
  scs_6 INTEGER CHECK (scs_6 BETWEEN 1 AND 5),
  scs_7 INTEGER CHECK (scs_7 BETWEEN 1 AND 5),
  scs_8 INTEGER CHECK (scs_8 BETWEEN 1 AND 5),
  scs_9 INTEGER CHECK (scs_9 BETWEEN 1 AND 5),
  scs_10 INTEGER CHECK (scs_10 BETWEEN 1 AND 5),
  scs_11 INTEGER CHECK (scs_11 BETWEEN 1 AND 5),
  scs_12 INTEGER CHECK (scs_12 BETWEEN 1 AND 5),
  scs_total_score DECIMAL(5,2),

  -- PANAS-SF-10 (사후)
  panas_positive_1 INTEGER CHECK (panas_positive_1 BETWEEN 1 AND 5),
  panas_positive_2 INTEGER CHECK (panas_positive_2 BETWEEN 1 AND 5),
  panas_positive_3 INTEGER CHECK (panas_positive_3 BETWEEN 1 AND 5),
  panas_positive_4 INTEGER CHECK (panas_positive_4 BETWEEN 1 AND 5),
  panas_positive_5 INTEGER CHECK (panas_positive_5 BETWEEN 1 AND 5),
  panas_negative_1 INTEGER CHECK (panas_negative_1 BETWEEN 1 AND 5),
  panas_negative_2 INTEGER CHECK (panas_negative_2 BETWEEN 1 AND 5),
  panas_negative_3 INTEGER CHECK (panas_negative_3 BETWEEN 1 AND 5),
  panas_negative_4 INTEGER CHECK (panas_negative_4 BETWEEN 1 AND 5),
  panas_negative_5 INTEGER CHECK (panas_negative_5 BETWEEN 1 AND 5),
  panas_positive_score DECIMAL(5,2),
  panas_negative_score DECIMAL(5,2),

  -- GAS-10 (사후)
  gas_1 INTEGER CHECK (gas_1 BETWEEN 0 AND 3),
  gas_2 INTEGER CHECK (gas_2 BETWEEN 0 AND 3),
  gas_3 INTEGER CHECK (gas_3 BETWEEN 0 AND 3),
  gas_4 INTEGER CHECK (gas_4 BETWEEN 0 AND 3),
  gas_5 INTEGER CHECK (gas_5 BETWEEN 0 AND 3),
  gas_6 INTEGER CHECK (gas_6 BETWEEN 0 AND 3),
  gas_7 INTEGER CHECK (gas_7 BETWEEN 0 AND 3),
  gas_8 INTEGER CHECK (gas_8 BETWEEN 0 AND 3),
  gas_9 INTEGER CHECK (gas_9 BETWEEN 0 AND 3),
  gas_10 INTEGER CHECK (gas_10 BETWEEN 0 AND 3),
  gas_total_score INTEGER CHECK (gas_total_score BETWEEN 0 AND 30),

  -- 타임스탬프
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_post_test_participant ON thesis_post_test_responses(participant_id);

-- 코멘트
COMMENT ON TABLE thesis_post_test_responses IS '사후 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)';
```

---

## 8. thesis_descriptive_responses
서술형 질문 응답 (6개 질문)

```sql
CREATE TABLE thesis_descriptive_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- 서술형 질문 6개
  q1_negative_experience TEXT, -- Q1. 부정적 경험 회상 및 글쓰기 경험
  q2_intervention_experience TEXT, -- Q2. 집단별 차별화된 질문
  q3_anxiety_change TEXT, -- Q3. 불안/스트레스 변화
  q4_self_care_thoughts TEXT, -- Q4. 자기 돌봄에 대한 생각 (문화적 맥락)
  q5_online_program_experience TEXT, -- Q5. 온라인 프로그램 경험
  q6_daily_life_impact TEXT, -- Q6. 일상생활 변화

  -- 인터뷰 동의 여부
  interview_consent BOOLEAN DEFAULT FALSE,

  -- 연락처 (인터뷰 동의 시)
  interview_contact VARCHAR(100),

  -- 타임스탬프
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_descriptive_participant ON thesis_descriptive_responses(participant_id);
CREATE INDEX idx_descriptive_interview ON thesis_descriptive_responses(interview_consent);

-- 코멘트
COMMENT ON TABLE thesis_descriptive_responses IS '서술형 질문 응답 및 인터뷰 동의';
COMMENT ON COLUMN thesis_descriptive_responses.q1_negative_experience IS '부정적 경험 회상 및 글쓰기 경험';
COMMENT ON COLUMN thesis_descriptive_responses.q2_intervention_experience IS '집단별 중재 경험 (A=GPT피드백, B=자기자비, C=중립)';
COMMENT ON COLUMN thesis_descriptive_responses.q3_anxiety_change IS '불안/스트레스 변화';
COMMENT ON COLUMN thesis_descriptive_responses.q4_self_care_thoughts IS '자기 돌봄에 대한 생각 (문화적 맥락)';
COMMENT ON COLUMN thesis_descriptive_responses.q5_online_program_experience IS '온라인 프로그램 경험';
COMMENT ON COLUMN thesis_descriptive_responses.q6_daily_life_impact IS '일상생활 변화';
```

---

## 9. thesis_session_progress
세션 진행 상태 (자동 저장)

```sql
CREATE TABLE thesis_session_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- 현재 단계
  current_stage VARCHAR(50) NOT NULL CHECK (current_stage IN (
    'consent',
    'demographics',
    'pre_test',
    'negative_event',
    'mid_test',
    'intervention',
    'post_test',
    'descriptive',
    'complete'
  )),

  -- 자동 저장된 데이터 (JSONB)
  stage_data JSONB,

  -- 마지막 저장 시간
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),

  -- 한 참여자당 하나의 활성 세션만 허용
  UNIQUE(participant_id)
);

-- 인덱스
CREATE INDEX idx_session_progress_participant ON thesis_session_progress(participant_id);
CREATE INDEX idx_session_progress_stage ON thesis_session_progress(current_stage);

-- 코멘트
COMMENT ON TABLE thesis_session_progress IS '세션 진행 상태 및 자동 저장 데이터';
COMMENT ON COLUMN thesis_session_progress.stage_data IS '현재 단계의 폼 데이터 (자동 저장)';
```

---

## 10. thesis_activity_log
사용자 활동 로그

```sql
CREATE TABLE thesis_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- 이벤트 유형
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'page_view',
    'form_submit',
    'auto_save',
    'error',
    'session_timeout',
    'gpt_feedback_requested',
    'gpt_feedback_received',
    'timer_completed'
  )),

  -- 이벤트 데이터 (JSONB)
  event_data JSONB,

  -- IP 주소 (보안용)
  ip_address INET,

  -- User Agent (디바이스 정보)
  user_agent TEXT,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_activity_log_participant ON thesis_activity_log(participant_id);
CREATE INDEX idx_activity_log_event_type ON thesis_activity_log(event_type);
CREATE INDEX idx_activity_log_created ON thesis_activity_log(created_at DESC);

-- 코멘트
COMMENT ON TABLE thesis_activity_log IS '사용자 활동 로그 (페이지 뷰, 폼 제출, 에러 등)';
COMMENT ON COLUMN thesis_activity_log.event_type IS '이벤트 유형 (page_view, form_submit, error 등)';
```

---

## Row Level Security (RLS) 정책

### 모든 테이블에 RLS 활성화

```sql
-- RLS 활성화
ALTER TABLE thesis_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_pre_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_writing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_gpt_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_mid_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_post_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_descriptive_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_activity_log ENABLE ROW LEVEL SECURITY;
```

### Service Role 전체 접근 허용

```sql
-- Service role은 모든 작업 가능 (API 라우트에서 사용)
CREATE POLICY "Service role has full access to participants"
  ON thesis_participants FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to demographics"
  ON thesis_demographics FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to pre_test"
  ON thesis_pre_test_responses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to writing_tasks"
  ON thesis_writing_tasks FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to gpt_feedback"
  ON thesis_gpt_feedback FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to mid_test"
  ON thesis_mid_test_responses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to post_test"
  ON thesis_post_test_responses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to descriptive"
  ON thesis_descriptive_responses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to session_progress"
  ON thesis_session_progress FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to activity_log"
  ON thesis_activity_log FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 트리거 및 함수

### updated_at 자동 업데이트

```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- thesis_participants 트리거
CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON thesis_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 점수 자동 계산

```sql
-- SCS 총점 계산 함수
CREATE OR REPLACE FUNCTION calculate_scs_total(
  scs_1 INTEGER, scs_2 INTEGER, scs_3 INTEGER, scs_4 INTEGER,
  scs_5 INTEGER, scs_6 INTEGER, scs_7 INTEGER, scs_8 INTEGER,
  scs_9 INTEGER, scs_10 INTEGER, scs_11 INTEGER, scs_12 INTEGER
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  -- 역채점 문항 처리 후 총점 계산 (구체적인 역채점 문항은 척도에 따라 조정)
  RETURN (scs_1 + scs_2 + scs_3 + scs_4 + scs_5 + scs_6 +
          scs_7 + scs_8 + scs_9 + scs_10 + scs_11 + scs_12) / 12.0;
END;
$$ LANGUAGE plpgsql;

-- PANAS 점수 계산 함수
CREATE OR REPLACE FUNCTION calculate_panas_score(
  p1 INTEGER, p2 INTEGER, p3 INTEGER, p4 INTEGER, p5 INTEGER
)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  RETURN (p1 + p2 + p3 + p4 + p5) / 5.0;
END;
$$ LANGUAGE plpgsql;

-- GAS 총점 계산 함수
CREATE OR REPLACE FUNCTION calculate_gas_total(
  g1 INTEGER, g2 INTEGER, g3 INTEGER, g4 INTEGER, g5 INTEGER,
  g6 INTEGER, g7 INTEGER, g8 INTEGER, g9 INTEGER, g10 INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN g1 + g2 + g3 + g4 + g5 + g6 + g7 + g8 + g9 + g10;
END;
$$ LANGUAGE plpgsql;
```

---

## 데이터 조회 뷰 (Views)

### 참여자 종합 정보 뷰

```sql
CREATE OR REPLACE VIEW thesis_participant_overview AS
SELECT
  p.id,
  p.identifier,
  p.group_assignment,
  p.age_block,
  p.status,
  d.age,
  d.education_level,
  d.marital_status,
  pre.scs_total_score AS pre_scs_score,
  pre.panas_negative_score AS pre_negative_affect,
  pre.gas_total_score AS pre_anxiety_score,
  post.scs_total_score AS post_scs_score,
  post.panas_negative_score AS post_negative_affect,
  post.gas_total_score AS post_anxiety_score,
  p.started_at,
  p.completed_at,
  EXTRACT(EPOCH FROM (p.completed_at - p.started_at)) / 60 AS duration_minutes
FROM thesis_participants p
LEFT JOIN thesis_demographics d ON p.id = d.participant_id
LEFT JOIN thesis_pre_test_responses pre ON p.id = pre.participant_id
LEFT JOIN thesis_post_test_responses post ON p.id = post.participant_id;

COMMENT ON VIEW thesis_participant_overview IS '참여자 종합 정보 (사전/사후 점수 포함)';
```

### 집단별 통계 뷰

```sql
CREATE OR REPLACE VIEW thesis_group_statistics AS
SELECT
  group_assignment,
  COUNT(*) AS total_participants,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'dropped') AS dropped_count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60)
    FILTER (WHERE completed_at IS NOT NULL) AS avg_duration_minutes
FROM thesis_participants
GROUP BY group_assignment;

COMMENT ON VIEW thesis_group_statistics IS '집단별 통계 (완료율, 평균 소요시간 등)';
```

---

## 데이터 내보내기 쿼리

### SPSS용 사전/사후 점수 내보내기

```sql
-- SPSS 분석용 데이터
SELECT
  p.identifier AS participant_id,
  p.group_assignment,
  d.age,
  d.age_block,
  d.education_level,
  d.marital_status,
  d.living_arrangement,

  -- 사전 검사
  pre.scs_total_score AS pre_scs,
  pre.panas_positive_score AS pre_pa,
  pre.panas_negative_score AS pre_na,
  pre.gas_total_score AS pre_gas,

  -- 사후 검사
  post.scs_total_score AS post_scs,
  post.panas_positive_score AS post_pa,
  post.panas_negative_score AS post_na,
  post.gas_total_score AS post_gas,

  -- 변화 점수
  (post.scs_total_score - pre.scs_total_score) AS delta_scs,
  (post.panas_negative_score - pre.panas_negative_score) AS delta_na,
  (post.gas_total_score - pre.gas_total_score) AS delta_gas

FROM thesis_participants p
JOIN thesis_demographics d ON p.id = d.participant_id
JOIN thesis_pre_test_responses pre ON p.id = pre.participant_id
JOIN thesis_post_test_responses post ON p.id = post.participant_id
WHERE p.status = 'completed'
ORDER BY p.group_assignment, d.age_block, p.identifier;
```

### 질적 데이터 내보내기

```sql
-- 글쓰기 내용 및 서술형 응답
SELECT
  p.identifier AS participant_id,
  p.group_assignment,
  w.task_type,
  w.writing_content,
  w.word_count,
  w.duration_seconds,
  gpt.feedback_content,
  desc.q1_negative_experience,
  desc.q2_intervention_experience,
  desc.q3_anxiety_change,
  desc.q4_self_care_thoughts,
  desc.q5_online_program_experience,
  desc.q6_daily_life_impact,
  desc.interview_consent
FROM thesis_participants p
LEFT JOIN thesis_writing_tasks w ON p.id = w.participant_id
LEFT JOIN thesis_gpt_feedback gpt ON w.id = gpt.writing_task_id
LEFT JOIN thesis_descriptive_responses desc ON p.id = desc.participant_id
WHERE p.status = 'completed'
ORDER BY p.group_assignment, p.identifier, w.task_type;
```

---

## 마이그레이션 파일 생성 순서

1. `001_create_participants_table.sql`
2. `002_create_demographics_table.sql`
3. `003_create_pre_test_responses_table.sql`
4. `004_create_writing_tasks_table.sql`
5. `005_create_gpt_feedback_table.sql`
6. `006_create_mid_test_responses_table.sql`
7. `007_create_post_test_responses_table.sql`
8. `008_create_descriptive_responses_table.sql`
9. `009_create_session_progress_table.sql`
10. `010_create_activity_log_table.sql`
11. `011_create_indexes.sql`
12. `012_enable_rls.sql`
13. `013_create_triggers_and_functions.sql`
14. `014_create_views.sql`

---

## 백업 및 복구

### 정기 백업 권장사항
- **빈도**: 매일 자동 백업 (Supabase 기본 제공)
- **보관 기간**: 연구 종료 후 7년
- **백업 내용**: 전체 데이터베이스 + 로그

### 수동 백업 명령
```bash
# Supabase CLI 사용
supabase db dump --db-url "postgresql://..." > backup_$(date +%Y%m%d).sql
```

---

## 보안 고려사항

1. **개인정보 최소화**: 연락처는 인터뷰 동의 시에만 수집
2. **익명화**: 참여자 식별은 identifier만 사용 (이름 미수집)
3. **RLS 정책**: Service role만 접근 가능
4. **암호화**: Supabase 기본 제공 (at-rest encryption)
5. **접근 로그**: activity_log 테이블로 모든 활동 추적

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-13
**Supabase 프로젝트**: songstark-web (공유 DB)
**테이블 Prefix**: `thesis_`
