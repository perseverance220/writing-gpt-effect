# 📋 노년기 여성 자기자비 글쓰기 연구 - 모바일 설문 시스템 프로젝트 계획서

## 프로젝트 개요

### 연구 목적
- **연구 주제**: 노년기 여성의 불안 감소를 위한 온라인 자기자비 글쓰기 중재: ChatGPT 피드백 효과에 대한 탐색적 혼합방법론 연구
- **연구 대상**: 60-74세 한국인 여성 30명 (A, B, C 집단 각 10명)
- **연구 기간**: 약 3개월 (준비 2주 + 데이터 수집 2주 + 분석 8주)

### 시스템 목적
참여자들이 모바일에서 쉽게 접근하여 설문을 완료할 수 있는 노인 친화적 온라인 플랫폼 구축

---

## 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: 식별자 기반 세션 관리 (비밀번호 없음)
- **AI Integration**: OpenAI API (gpt-4o-mini)
- **Hosting**: Vercel (권장)

### 개발 도구
- **Version Control**: Git + GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript

---

## 시스템 아키텍처

### 전체 구조
```
사용자 (모바일)
  ↓
Next.js Frontend (Vercel)
  ↓
API Routes (서버리스 함수)
  ↓
├─ Supabase (Database)
└─ OpenAI API (GPT 피드백)
```

### 핵심 기능
1. **식별자 기반 인증** (카카오톡으로 전달된 고유 ID)
2. **10단계 설문 플로우** (선형, 뒤로가기 없음)
3. **실시간 자동 저장** (30초마다 + blur 이벤트)
4. **타이머가 있는 글쓰기 영역** (10분 작성 시간)
5. **집단별 차별화된 중재**
   - A집단: 자기자비 글쓰기 + ChatGPT 실시간 피드백
   - B집단: 자기자비 글쓰기 (피드백 없음)
   - C집단: 중립적 글쓰기
6. **관리자 대시보드** (데이터 조회 및 내보내기)

---

## 데이터베이스 설계

### 테이블 구조 (thesis_ prefix)

#### 1. thesis_participants (참여자 기본 정보)
- 식별자 (identifier)
- 집단 배정 (A/B/C)
- 연령 블록 (60-64/65-69/70-74)
- 진행 상태 (pending/in_progress/completed)
- 타임스탬프

#### 2. thesis_demographics (인구통계)
- 연령
- 학력
- 결혼 상태
- 동거 형태
- 주요 스트레스 원인

#### 3. thesis_pre_test_responses (사전 검사)
- SCS-SF-12 (자기자비 척도 12문항)
- PANAS-SF-10 (정서 척도 10문항)
- GAS-10 (노인 불안 척도 10문항)

#### 4. thesis_writing_tasks (글쓰기 과제)
- 과제 유형 (negative_event, common_humanity, self_kindness, mindfulness, neutral)
- 작성 내용
- 단어 수
- 소요 시간

#### 5. thesis_gpt_feedback (GPT 피드백)
- 작성 내용
- 피드백 내용
- 프롬프트
- 모델 버전
- 토큰 사용량

#### 6. thesis_mid_test_responses (중간 검사)
- PANAS-SF-10 (부정적 사건 회상 후)

#### 7. thesis_post_test_responses (사후 검사)
- SCS-SF-12
- PANAS-SF-10
- GAS-10

#### 8. thesis_descriptive_responses (서술형 응답)
- 6개 서술형 질문 응답
- 인터뷰 동의 여부
- 연락처 (동의 시)

#### 9. thesis_session_progress (세션 진행 상태)
- 현재 단계
- 자동 저장된 데이터
- 마지막 저장 시간

#### 10. thesis_activity_log (활동 로그)
- 이벤트 유형 (page_view, form_submit, error)
- 이벤트 데이터
- 타임스탬프

---

## 인증 시스템

### 식별자 기반 인증 (비밀번호 없음)

#### 참여자 식별자 생성
- 형식: `WGE-2025-001` ~ `WGE-2025-030`
- 총 30개 생성 (A/B/C 집단별 10개)
- 블록 무선배정 (연령대별)

#### 인증 플로우
1. 연구자가 카카오톡으로 고유 링크 전송
   - 예: `https://survey.example.com/survey/WGE-2025-001`
2. 참여자가 링크 클릭
3. 서버에서 식별자 검증
4. 유효한 경우 암호화된 세션 토큰 발급
5. 이후 요청에서 세션 토큰으로 인증

#### 보안 조치
- 일회용 링크 (첫 접속 후 사용됨 표시)
- IP 주소 로깅
- 세션 타임아웃 (4시간)
- Rate limiting (무차별 대입 공격 방지)
- HTTPS 필수

---

## 설문 플로우

### 10단계 선형 프로세스 (총 소요시간: 30-35분)

```
1. 랜딩 페이지 (식별자 입력)
   ↓
2. 동의서 및 안내 (2분)
   ↓
3. 인구통계 설문 (3분)
   ↓
4. 사전 검사 (7분)
   - SCS-SF-12 (3분)
   - PANAS-SF-10 (2분)
   - GAS-10 (2분)
   ↓
5. 부정적 사건 회상 글쓰기 (10분)
   - 타이머 표시
   - 자동 저장
   ↓
6. 중간 측정 (2분)
   - PANAS-SF-10
   ↓
7. 실험 중재 (10분) ⭐ 집단별 차별화
   - A집단: 자기자비 3단계 + GPT 피드백
     • 공통인류성 (3분) → 피드백
     • 자기친절 (3분) → 피드백
     • 마음챙김 (4분) → 피드백
   - B집단: 자기자비 3단계 (피드백 없음)
   - C집단: 중립적 글쓰기 (일상 활동)
   ↓
8. 사후 검사 - 척도 (7분)
   - SCS-SF-12
   - PANAS-SF-10
   - GAS-10
   ↓
9. 사후 검사 - 서술형 (5분)
   - 6개 개방형 질문
   - 인터뷰 동의 체크
   ↓
10. 완료 페이지 (감사 메시지)
```

### 진행률 표시
- 각 페이지 상단에 진행 바 표시
- "10단계 중 3단계" 형식으로 명확히 표시
- 뒤로가기 버튼 없음 (선형 플로우만 허용)

---

## 노인 친화 UI/UX 가이드

### 타이포그래피
- **기본 폰트 크기**: 18px (최소)
- **제목**: 24px, 28px, 32px
- **줄 간격**: 1.6 (가독성 향상)
- **폰트**: Pretendard, Noto Sans KR
- **명암비**: 7:1 이상 (WCAG AAA)

### 터치 영역
- **최소 크기**: 44x44px (Apple HIG 표준)
- **권장 크기**: 56x56px (주요 버튼)
- **간격**: 최소 16px

### 레이아웃
- **단일 컬럼** 레이아웃
- **최대 너비**: 600px (중앙 정렬)
- **패딩**: 24px (모바일)
- **한 화면에 하나의 질문**
- **큰 "다음" 버튼** (하단 고정)

### 색상
- **높은 대비**: #1a1a1a (텍스트) on #ffffff (배경)
- **색맹 친화적**: 빨강/초록만 사용 금지
- **아이콘 + 텍스트**: 아이콘만 사용 금지
- **명확한 포커스**: 3px 윤곽선

### 폼 디자인
- **큰 라디오 버튼/체크박스** (쉽게 탭 가능)
- **자동 포커스** (첫 입력란)
- **실시간 검증** (도움말 메시지)
- **명확한 에러 메시지** (쉬운 한국어)

### 글쓰기 영역
- **큰 텍스트 영역** (최소 200px 높이)
- **단어 수 표시**
- **글자 크기**: 최소 16px (textarea 내부)
- **오프라인 지원** (localStorage 백업)

---

## OpenAI API 통합

### GPT 피드백 시스템 (A집단만)

#### 모델 선택
- **모델**: `gpt-4o-mini`
- **이유**: 비용 효율적, 빠른 응답 속도
- **예상 비용**: 약 10,000-20,000원 (30명 × 3회)

#### 프롬프트 설계

**시스템 프롬프트 원칙**:
- 60-74세 한국 여성 노인을 위한 상담가 역할
- 따뜻하고 존중하는 태도
- 쉬운 한국어 사용
- 문화적 고려: 자기 돌봄을 '이기적'으로 여기는 경향
- 2-3문장으로 간결하게
- 존댓말 사용

**피드백 유형**:
1. **공통인류성 (Common Humanity)**
   - 혼자만의 어려움이 아님을 인정
   - 보편적 경험임을 상기

2. **자기친절 (Self-Kindness)**
   - 자기 돌봄이 이기적이지 않음 강조
   - 자책 내용 부드럽게 재해석

3. **마음챙김 (Mindfulness)**
   - 감정을 있는 그대로 받아들이기
   - 판단하지 않는 관찰 격려

#### 대체 방안 (Fallback)
- API 오류 시 사전 작성된 피드백 제공
- 10초 타임아웃 설정
- 최대 2회 재시도

---

## 관리자 대시보드

### 기능
1. **참여자 관리**
   - 식별자 생성 및 배정
   - 진행 상태 모니터링
   - 연락처 관리

2. **데이터 조회**
   - 참여자별 응답 확인
   - 집단별 통계
   - 완료율 추적

3. **데이터 내보내기**
   - CSV 형식 (SPSS 호환)
   - 척도별 개별 파일
   - 질적 데이터 별도 파일
   - 익명화된 데이터

4. **모니터링**
   - 에러 로그
   - API 사용량 (OpenAI)
   - 세션 타임아웃 통계

---

## 개발 일정

### Phase 1: 기초 설정 (Week 1)
- [ ] Supabase 데이터베이스 설정
- [ ] 마이그레이션 파일 작성
- [ ] 기본 인증 시스템 구현
- [ ] 세션 관리 구현
- [ ] 랜딩 페이지 제작

### Phase 2: 설문 플로우 (Week 2)
- [ ] 설문지 컴포넌트 (SCS, PANAS, GAS)
- [ ] 타이머가 있는 글쓰기 영역
- [ ] 자동 저장 기능
- [ ] 진행률 추적
- [ ] 단계별 라우팅

### Phase 3: 중재 구현 (Week 3)
- [ ] A집단: GPT 피드백 통합
- [ ] B집단: 자기자비 글쓰기
- [ ] C집단: 중립적 글쓰기
- [ ] 조건부 렌더링 로직

### Phase 4: 사후 검사 및 관리자 (Week 4)
- [ ] 서술형 질문 페이지
- [ ] 완료 페이지
- [ ] 관리자 대시보드
- [ ] 데이터 내보내기
- [ ] 통합 테스트

### Phase 5: 최적화 및 배포 (Week 5)
- [ ] 모바일 최적화
- [ ] 실제 노인 사용자 테스트
- [ ] 성능 최적화
- [ ] Vercel 배포
- [ ] IRB 문서화

---

## 폴더 구조

```
d:\dev\writing-gpt-effect/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx (루트 레이아웃, 한국어 지원)
│  │  ├─ page.tsx (랜딩/웰컴 페이지)
│  │  ├─ survey/
│  │  │  └─ [sessionId]/
│  │  │     ├─ page.tsx (메인 설문 오케스트레이터)
│  │  │     ├─ consent/page.tsx
│  │  │     ├─ demographics/page.tsx
│  │  │     ├─ pre-test/page.tsx
│  │  │     ├─ negative-event/page.tsx
│  │  │     ├─ mid-test/page.tsx
│  │  │     ├─ intervention/page.tsx
│  │  │     ├─ post-test/page.tsx
│  │  │     └─ complete/page.tsx
│  │  ├─ admin/
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ participants/page.tsx
│  │  │  ├─ responses/page.tsx
│  │  │  └─ export/page.tsx
│  │  └─ api/
│  │     ├─ gpt-feedback/route.ts
│  │     ├─ save-response/route.ts
│  │     └─ session/route.ts
│  ├─ components/
│  │  ├─ ui/ (shadcn 컴포넌트)
│  │  ├─ survey/
│  │  │  ├─ SurveyProgress.tsx
│  │  │  ├─ QuestionnaireForm.tsx
│  │  │  ├─ WritingArea.tsx
│  │  │  ├─ TimerDisplay.tsx
│  │  │  ├─ GPTFeedback.tsx
│  │  │  └─ AutoSave.tsx
│  │  ├─ admin/
│  │  │  ├─ ParticipantTable.tsx
│  │  │  ├─ DataExport.tsx
│  │  │  └─ Statistics.tsx
│  │  └─ layout/
│  │     ├─ MobileHeader.tsx
│  │     └─ ProgressStepper.tsx
│  ├─ lib/
│  │  ├─ utils.ts
│  │  ├─ supabase/
│  │  │  ├─ client.ts
│  │  │  ├─ server.ts
│  │  │  └─ queries.ts
│  │  ├─ openai/
│  │  │  ├─ client.ts
│  │  │  └─ prompts.ts
│  │  ├─ questionnaires/
│  │  │  ├─ scs-sf-12.ts
│  │  │  ├─ panas-sf-10.ts
│  │  │  ├─ gas-10.ts
│  │  │  └─ descriptive.ts
│  │  └─ validators/
│  │     └─ schemas.ts
│  ├─ hooks/
│  │  ├─ useAutoSave.ts
│  │  ├─ useTimer.ts
│  │  ├─ useSessionState.ts
│  │  └─ useGPTFeedback.ts
│  └─ types/
│     ├─ database.types.ts
│     ├─ survey.types.ts
│     └─ questionnaire.types.ts
├─ docs/
│  ├─ thesis-guide.md (기존)
│  ├─ PROJECT_PLAN.md (이 문서)
│  ├─ DATABASE_SCHEMA.md
│  ├─ API_DOCUMENTATION.md
│  └─ DEPLOYMENT_GUIDE.md
├─ supabase/
│  └─ migrations/
└─ public/
   └─ icons/ (PWA 아이콘)
```

---

## 필요한 의존성

### 설치 필요
```bash
# Supabase
npm install @supabase/supabase-js

# OpenAI
npm install openai

# 폼 처리
npm install react-hook-form @hookform/resolvers zod

# 날짜 유틸리티
npm install date-fns

# shadcn/ui 컴포넌트
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add radio-group
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add separator
npx shadcn@latest add toast
```

---

## 핵심 도전 과제 및 해결 방안

### 1. 전통적 인증 없음
**해결책**:
- 고유 식별자 기반 세션
- 암호화된 JWT 토큰
- 일회용 링크
- 세션 타임아웃 및 IP 로깅

### 2. 디지털 문해력이 낮은 노인 사용자
**해결책**:
- 매우 단순한 선형 플로우
- 큰 글자 및 터치 영역
- 한 화면에 하나의 질문
- 자동 저장 (데이터 손실 방지)
- 명확한 한국어 안내

### 3. 모바일 전용 경험
**해결책**:
- 모바일 우선 디자인 (320px 최소)
- 터치 최적화 컴포넌트
- 반응형 타이포그래피
- PWA 기능

### 4. 타이머가 있는 글쓰기 과제
**해결책**:
- 명확한 시각적 카운트다운
- 2분 남았을 때 경고
- 30초마다 자동 저장
- 시간 종료 시 자동 제출

### 5. 집단별 중재
**해결책**:
- 서버 측 집단 배정 검증
- 집단에 따른 동적 라우팅
- GPT 피드백 조건부 렌더링
- 명확한 A/B/C 로직 분리

### 6. GPT API 안정성
**해결책**:
- 사전 작성된 대체 피드백
- 타임아웃 처리 (10초)
- 에러 로깅
- 재시도 로직 (2회)

---

## 데이터 분석을 위한 내보내기

### 내보내기 형식
1. **척도 데이터** (CSV)
   - SPSS 호환 형식
   - 참여자 ID (익명화)
   - 집단 배정
   - 사전/사후 점수

2. **질적 데이터** (CSV)
   - 글쓰기 내용
   - 서술형 응답
   - 타임스탬프

3. **GPT 피드백** (CSV)
   - A집단만
   - 프롬프트 및 응답
   - 토큰 사용량

---

## 보안 및 프라이버시

### IRB 승인 요구사항
- 디지털 동의서 프로세스
- 익명화된 데이터 저장
- PII(개인 식별 정보) 최소화
- 안전한 데이터 내보내기
- 데이터 보관 정책 (연구 종료 후 7년)

### 기술적 보안
- HTTPS 필수
- 암호화된 세션 토큰
- Row Level Security (Supabase)
- Rate limiting
- 에러 로깅 (민감 정보 제외)

---

## 모니터링 및 분석

### 추적 항목
- 에러 추적 (Sentry 권장)
- API 비용 모니터링 (OpenAI)
- 데이터베이스 성능
- 사용자 이탈률 (어느 단계에서 중단?)
- 세션 타임아웃 빈도

---

## 성공 기준

### 기술적 성공
- [ ] 30명의 참여자가 모두 완료할 수 있음
- [ ] 모바일 기기에서 원활히 작동 (Android/iOS)
- [ ] 데이터 손실 없음 (자동 저장)
- [ ] GPT 피드백 성공률 95% 이상
- [ ] 페이지 로딩 시간 2초 이내

### 사용자 경험 성공
- [ ] 노인 사용자가 안내 없이 완료 가능
- [ ] 중도 포기율 10% 미만
- [ ] 기술적 지원 요청 최소화
- [ ] 평균 완료 시간 30-35분

### 연구 데이터 성공
- [ ] 모든 척도 데이터 수집 완료
- [ ] 서술형 응답 완료율 90% 이상
- [ ] 데이터 품질 검증 통과
- [ ] SPSS 내보내기 오류 없음

---

## 다음 단계

### 즉시 수행
1. ✅ 이 프로젝트 계획서 검토 및 승인
2. ⬜ DATABASE_SCHEMA.md 작성
3. ⬜ Supabase 프로젝트에 테이블 생성
4. ⬜ 기본 인증 시스템 구현
5. ⬜ 첫 설문 페이지 프로토타입

### 단기 (1-2주)
- 핵심 설문 플로우 구현
- 자동 저장 기능
- 타이머 컴포넌트

### 중기 (3-4주)
- GPT 통합
- 관리자 대시보드
- 데이터 내보내기

### 장기 (5주+)
- 실제 노인 사용자 테스트
- 최적화
- 배포 및 IRB 문서화

---

## 연락처 및 지원

### 개발 지원
- GitHub Issues: [프로젝트 저장소 링크]
- 기술 문의: [이메일]

### 연구 관련
- 주 연구자: [이름]
- 소속: [기관]
- IRB 승인 번호: [추후 기입]

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-13
**작성자**: AI Assistant (Claude)
**검토자**: [연구자 이름]
