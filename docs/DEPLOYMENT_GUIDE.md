# 🚀 배포 가이드

## 개요

이 문서는 노년기 여성 자기자비 글쓰기 연구 시스템을 Vercel에 배포하는 방법을 안내합니다.

---

## 목차

1. [사전 준비사항](#1-사전-준비사항)
2. [Supabase 설정](#2-supabase-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [Vercel 배포](#4-vercel-배포)
5. [배포 후 확인사항](#5-배포-후-확인사항)
6. [모니터링 및 유지보수](#6-모니터링-및-유지보수)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비사항

### 필요한 계정

✅ **GitHub 계정** (코드 저장소)
- URL: https://github.com
- 저장소: `perseverance220/language-screening-platform-2025`

✅ **Vercel 계정** (호스팅)
- URL: https://vercel.com
- GitHub 계정으로 로그인 권장

✅ **Supabase 계정** (데이터베이스)
- 기존 프로젝트: songstark-web
- URL: https://xrqipcnnuzmtknnbdclk.supabase.co

✅ **OpenAI 계정** (GPT API)
- API Key: 이미 설정됨

### 로컬 개발 환경 확인

```bash
# Node.js 버전 확인 (18.17 이상 권장)
node --version

# npm 버전 확인
npm --version

# 의존성 설치
npm install

# 개발 서버 실행 테스트
npm run dev
```

---

## 2. Supabase 설정

### 2.1 데이터베이스 마이그레이션

Supabase MCP를 사용하여 테이블을 생성합니다.

#### Migration 1: thesis_participants

```bash
# Supabase MCP를 통해 마이그레이션 실행
```

또는 Supabase Dashboard에서 직접 실행:

1. https://supabase.com/dashboard/project/xrqipcnnuzmtknnbdclk/editor 접속
2. SQL Editor 열기
3. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)의 SQL 스크립트 복사하여 실행

**실행 순서**:
1. `thesis_participants` 테이블 생성
2. `thesis_demographics` 테이블 생성
3. `thesis_pre_test_responses` 테이블 생성
4. `thesis_writing_tasks` 테이블 생성
5. `thesis_gpt_feedback` 테이블 생성
6. `thesis_mid_test_responses` 테이블 생성
7. `thesis_post_test_responses` 테이블 생성
8. `thesis_descriptive_responses` 테이블 생성
9. `thesis_session_progress` 테이블 생성
10. `thesis_activity_log` 테이블 생성
11. 인덱스 생성
12. RLS 정책 활성화
13. 트리거 및 함수 생성
14. 뷰 생성

### 2.2 RLS (Row Level Security) 확인

모든 테이블에 RLS가 활성화되어 있는지 확인:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'thesis_%';
```

모두 `rowsecurity = true`여야 합니다.

### 2.3 Service Role Key 확인

`.env.local` 파일에 다음 값이 설정되어 있는지 확인:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWlwY25udXptdGtubmJkY2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgxNjc4MSwiZXhwIjoyMDU4MzkyNzgxfQ.BZ2B2EyxXIqZ10_xLsejarpTJqSwmMc6sps9APwy4sE
```

⚠️ **주의**: Service Role Key는 서버 측에서만 사용해야 하며, 클라이언트에 노출되지 않도록 주의!

---

## 3. 환경 변수 설정

### 3.1 로컬 환경 변수 (`.env.local`)

프로젝트 루트에 `.env.local` 파일이 있는지 확인:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xrqipcnnuzmtknnbdclk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWlwY25udXptdGtubmJkY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTY3ODEsImV4cCI6MjA1ODM5Mjc4MX0.lxPeRPGd2ZDZZEmWsOtpFhdicJMQjhSYYJGghZ7zSJQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycWlwY25udXptdGtubmJkY2xrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjgxNjc4MSwiZXhwIjoyMDU4MzkyNzgxfQ.BZ2B2EyxXIqZ10_xLsejarpTJqSwmMc6sps9APwy4sE

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# JWT Secret (세션 토큰 암호화용, 랜덤 문자열 생성)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Admin Token (관리자 API 접근용, 랜덤 문자열 생성)
ADMIN_TOKEN=your-admin-token-here-change-this-in-production
```

### 3.2 프로덕션 환경 변수

`.env.production` 파일 생성 (Vercel에 직접 설정할 예정):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xrqipcnnuzmtknnbdclk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[동일]
SUPABASE_SERVICE_ROLE_KEY=[동일]

# OpenAI API Configuration
OPENAI_API_KEY=[동일]

# Application Settings (Vercel 도메인으로 변경)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# JWT Secret (새로운 랜덤 값)
JWT_SECRET=[새로 생성]

# Admin Token (새로운 랜덤 값)
ADMIN_TOKEN=[새로 생성]
```

### 3.3 시크릿 생성

JWT_SECRET와 ADMIN_TOKEN을 생성합니다:

```bash
# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 생성기 사용
# https://randomkeygen.com/
```

---

## 4. Vercel 배포

### 4.1 GitHub 저장소 연결

#### Step 1: GitHub에 코드 푸시

```bash
# Git 상태 확인
git status

# 모든 변경사항 추가
git add .

# 커밋 메시지 작성
git commit -m "Initial commit: Setup thesis survey system

🎯 Implemented:
- Database schema with thesis_ prefix
- API documentation
- Project structure
- Environment configuration

📋 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# GitHub에 푸시
git push -u origin main
```

#### Step 2: Vercel에서 Import

1. https://vercel.com 접속
2. "Add New Project" 클릭
3. "Import Git Repository" 선택
4. GitHub 저장소 `perseverance220/language-screening-platform-2025` 선택

### 4.2 프로젝트 설정

**Framework Preset**: Next.js (자동 감지)

**Root Directory**: `./` (기본값)

**Build Command**: `npm run build` (기본값)

**Output Directory**: `.next` (기본값)

**Install Command**: `npm install` (기본값)

### 4.3 환경 변수 설정

Vercel Dashboard에서 Environment Variables 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xrqipcnnuzmtknnbdclk.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[Supabase Anon Key]` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `[Supabase Service Role Key]` | Production, Preview, Development |
| `OPENAI_API_KEY` | `[OpenAI API Key]` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-app-git-*.vercel.app` | Preview |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Development |
| `JWT_SECRET` | `[생성한 랜덤 값]` | Production, Preview, Development |
| `ADMIN_TOKEN` | `[생성한 랜덤 값]` | Production, Preview, Development |

⚠️ **보안 주의사항**:
- `SUPABASE_SERVICE_ROLE_KEY`와 `OPENAI_API_KEY`는 절대 클라이언트에 노출하지 마세요
- `JWT_SECRET`와 `ADMIN_TOKEN`은 강력한 랜덤 값을 사용하세요
- GitHub에 `.env.local` 파일이 커밋되지 않도록 `.gitignore`에 추가되어 있는지 확인

### 4.4 배포 실행

"Deploy" 버튼 클릭!

배포 로그를 확인하며 진행 상황을 모니터링합니다.

**예상 배포 시간**: 2-3분

---

## 5. 배포 후 확인사항

### 5.1 기본 동작 확인

✅ **홈페이지 접속**
```
https://your-app.vercel.app
```

✅ **API Health Check**
```bash
curl https://your-app.vercel.app/api/health
```

예상 응답:
```json
{
  "status": "ok",
  "timestamp": "2025-01-13T15:00:00Z"
}
```

✅ **데이터베이스 연결 확인**

Vercel Dashboard > Project > Deployments > [Latest Deployment] > Functions 탭에서 로그 확인

### 5.2 기능별 테스트

#### 테스트 1: 식별자 검증

```bash
curl -X POST https://your-app.vercel.app/api/session/validate \
  -H "Content-Type: application/json" \
  -d '{"identifier": "TEST-001"}'
```

#### 테스트 2: 세션 생성 및 저장

테스트 참여자를 생성하여 전체 플로우를 테스트합니다.

### 5.3 성능 확인

**Vercel Analytics**에서 다음을 확인:
- 페이지 로딩 속도 (2초 이내 목표)
- API 응답 시간 (500ms 이내 목표)
- 에러율 (1% 미만 목표)

### 5.4 모바일 테스트

실제 모바일 기기에서 테스트:
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ 다양한 화면 크기 (320px ~ 768px)

---

## 6. 모니터링 및 유지보수

### 6.1 Vercel 모니터링

**Dashboard**: https://vercel.com/[your-team]/[your-project]

**주요 메트릭**:
- Deployment Status
- Function Invocations
- Bandwidth Usage
- Error Rate

### 6.2 Supabase 모니터링

**Dashboard**: https://supabase.com/dashboard/project/xrqipcnnuzmtknnbdclk

**주요 메트릭**:
- Database Size
- Active Connections
- API Requests
- Storage Usage

### 6.3 OpenAI API 모니터링

**Dashboard**: https://platform.openai.com/usage

**주요 메트릭**:
- Total Tokens Used
- API Calls
- Cost (예상: $0.30 - $0.60 for 30 participants)

### 6.4 로그 확인

**Vercel 로그**:
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그 보기
vercel logs --follow
```

**Supabase 로그**:
- Supabase Dashboard > Logs 섹션
- API, Database, Auth 로그 확인

### 6.5 백업

**데이터베이스 백업**:
```bash
# Supabase CLI로 백업
supabase db dump --db-url "postgresql://..." > backup_$(date +%Y%m%d).sql

# 또는 Supabase Dashboard에서 자동 백업 설정
```

**권장 백업 주기**:
- 연구 진행 중: 매일
- 데이터 수집 완료 후: 주 1회
- 연구 종료 후: 최종 백업 후 안전한 장소에 보관 (7년)

---

## 7. 문제 해결

### 7.1 빌드 실패

**증상**: Vercel 배포 시 빌드가 실패합니다.

**해결 방법**:
1. 로컬에서 빌드 테스트
   ```bash
   npm run build
   ```
2. TypeScript 에러 확인
   ```bash
   npm run type-check
   ```
3. ESLint 에러 확인
   ```bash
   npm run lint
   ```

### 7.2 환경 변수 문제

**증상**: API가 "Environment variable not found" 에러를 반환합니다.

**해결 방법**:
1. Vercel Dashboard > Settings > Environment Variables 확인
2. 변수 이름 오타 확인 (대소문자 구분!)
3. 변수가 올바른 환경(Production/Preview/Development)에 설정되었는지 확인
4. 환경 변수 변경 후 재배포 필요

### 7.3 데이터베이스 연결 실패

**증상**: "Database connection failed" 에러

**해결 방법**:
1. Supabase 프로젝트 상태 확인 (https://status.supabase.com)
2. `NEXT_PUBLIC_SUPABASE_URL` 올바른지 확인
3. `SUPABASE_SERVICE_ROLE_KEY` 올바른지 확인
4. Supabase Dashboard > Settings > API에서 키 재확인

### 7.4 OpenAI API 에러

**증상**: GPT 피드백이 fallback으로만 제공됩니다.

**해결 방법**:
1. OpenAI API 키 유효성 확인
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```
2. API 사용량 한도 확인 (https://platform.openai.com/usage)
3. 결제 방법이 등록되어 있는지 확인
4. Rate limit 확인 (분당 요청 수)

### 7.5 세션 타임아웃 문제

**증상**: 참여자가 설문 중간에 세션이 만료됩니다.

**해결 방법**:
1. JWT 만료 시간 확인 및 연장
2. 자동 저장 기능이 작동하는지 확인
3. 참여자에게 30분 이내 완료 안내

### 7.6 모바일 UI 문제

**증상**: 특정 기기에서 레이아웃이 깨집니다.

**해결 방법**:
1. Chrome DevTools 모바일 시뮬레이터 사용
2. 최소 너비 320px 확인
3. 터치 영역 크기 확인 (44x44px 이상)
4. 실제 기기에서 테스트

### 7.7 Vercel 함수 타임아웃

**증상**: API 요청이 타임아웃됩니다.

**해결 방법**:
- Hobby Plan: 10초 제한
- Pro Plan: 60초 제한

GPT 피드백 API가 10초를 초과하면:
1. `vercel.json` 파일 생성:
   ```json
   {
     "functions": {
       "api/gpt-feedback.ts": {
         "maxDuration": 30
       }
     }
   }
   ```
2. Pro Plan으로 업그레이드 고려

---

## 8. 도메인 설정 (선택사항)

### 8.1 커스텀 도메인 연결

Vercel에서 커스텀 도메인을 추가할 수 있습니다:

1. Vercel Dashboard > Project > Settings > Domains
2. "Add Domain" 클릭
3. 도메인 입력 (예: `thesis-survey.com`)
4. DNS 레코드 설정 안내에 따라 설정

### 8.2 DNS 레코드 예시

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

---

## 9. 배포 체크리스트

### 배포 전
- [ ] 로컬에서 빌드 성공 (`npm run build`)
- [ ] 모든 환경 변수 설정 완료
- [ ] Supabase 테이블 생성 완료
- [ ] RLS 정책 활성화 확인
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] GitHub에 코드 푸시 완료

### 배포 중
- [ ] Vercel에서 프로젝트 Import
- [ ] 환경 변수 Vercel에 등록
- [ ] 빌드 로그 확인
- [ ] 배포 성공 확인

### 배포 후
- [ ] 홈페이지 접속 확인
- [ ] API Health Check 통과
- [ ] 데이터베이스 연결 확인
- [ ] 테스트 식별자로 전체 플로우 테스트
- [ ] 모바일 기기 테스트 (iOS, Android)
- [ ] 관리자 대시보드 접근 확인
- [ ] GPT 피드백 작동 확인 (A집단)
- [ ] 데이터 내보내기 기능 테스트

---

## 10. 연구 시작 전 최종 확인

### 참여자 초대 전
- [ ] 30개 식별자 생성 및 집단 배정 완료
- [ ] 식별자별 고유 링크 생성
- [ ] 카카오톡 메시지 템플릿 준비
- [ ] IRB 승인 완료
- [ ] 참여자 동의서 텍스트 확인
- [ ] 모든 설문 문항 최종 검토
- [ ] 예상 소요 시간 테스트 (30-35분)

### 모니터링 준비
- [ ] Vercel 알림 설정 (에러 발생 시 이메일)
- [ ] Supabase 알림 설정
- [ ] OpenAI API 사용량 알림 설정
- [ ] 매일 백업 스케줄 설정
- [ ] 관리자 대시보드 북마크

---

## 참고 링크

- **Vercel 문서**: https://vercel.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Supabase 문서**: https://supabase.com/docs
- **OpenAI API 문서**: https://platform.openai.com/docs

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-13
**배포 플랫폼**: Vercel
**데이터베이스**: Supabase (PostgreSQL)
