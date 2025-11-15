-- ================================================
-- 논문 연구용 데이터베이스 테이블 생성
-- Supabase 프로젝트: songstark-web (xrqipcnnuzmtknnbdclk)
-- ================================================

-- 1. thesis_participants (참여자 기본 정보)
CREATE TABLE IF NOT EXISTS thesis_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier VARCHAR(50) UNIQUE NOT NULL,
  group_assignment VARCHAR(1) NOT NULL CHECK (group_assignment IN ('A', 'B', 'C')),
  age_block VARCHAR(10) CHECK (age_block IN ('60-64', '65-69', '70-74')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dropped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_identifier ON thesis_participants(identifier);
CREATE INDEX IF NOT EXISTS idx_participants_status ON thesis_participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_group ON thesis_participants(group_assignment);

COMMENT ON TABLE thesis_participants IS '연구 참여자 기본 정보';
COMMENT ON COLUMN thesis_participants.identifier IS '카카오톡으로 전달되는 고유 식별자';
COMMENT ON COLUMN thesis_participants.group_assignment IS 'A=GPT피드백, B=자기자비만, C=중립';

-- 2. thesis_demographics (인구통계 정보)
CREATE TABLE IF NOT EXISTS thesis_demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,
  age VARCHAR(20) NOT NULL,
  education_level VARCHAR(50) NOT NULL,
  marital_status VARCHAR(20) NOT NULL,
  living_arrangement VARCHAR(50) NOT NULL,
  main_stressor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demographics_participant ON thesis_demographics(participant_id);

COMMENT ON TABLE thesis_demographics IS '참여자 인구통계 정보';

-- 3. thesis_pre_test_responses (사전 검사)
CREATE TABLE IF NOT EXISTS thesis_pre_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

  -- SCS-SF-12
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

  -- PANAS-SF-10
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

  -- GAS-10
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

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pre_test_participant ON thesis_pre_test_responses(participant_id);

COMMENT ON TABLE thesis_pre_test_responses IS '사전 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)';

-- 4. thesis_writing_tasks (글쓰기 과제)
CREATE TABLE IF NOT EXISTS thesis_writing_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
    'negative_event',
    'common_humanity',
    'self_kindness',
    'mindfulness',
    'neutral'
  )),
  writing_content TEXT NOT NULL,
  word_count INTEGER,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writing_tasks_participant ON thesis_writing_tasks(participant_id);
CREATE INDEX IF NOT EXISTS idx_writing_tasks_type ON thesis_writing_tasks(task_type);

COMMENT ON TABLE thesis_writing_tasks IS '참여자 글쓰기 과제 데이터';

-- 5. thesis_mid_test_responses (중간 검사 - 부정적 사건 회상 후)
CREATE TABLE IF NOT EXISTS thesis_mid_test_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES thesis_participants(id) ON DELETE CASCADE,

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

  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mid_test_participant ON thesis_mid_test_responses(participant_id);

COMMENT ON TABLE thesis_mid_test_responses IS '중간 측정 (부정적 사건 회상 후 PANAS)';

-- 6. Row Level Security (RLS) 활성화
ALTER TABLE thesis_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_pre_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_writing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_mid_test_responses ENABLE ROW LEVEL SECURITY;

-- 7. Service Role 전체 접근 허용
CREATE POLICY IF NOT EXISTS "Service role has full access to participants"
  ON thesis_participants FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role has full access to demographics"
  ON thesis_demographics FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role has full access to pre_test"
  ON thesis_pre_test_responses FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role has full access to writing_tasks"
  ON thesis_writing_tasks FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role has full access to mid_test"
  ON thesis_mid_test_responses FOR ALL
  USING (auth.role() = 'service_role');
