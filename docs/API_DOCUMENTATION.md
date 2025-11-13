# 🔌 API 문서

## 개요

이 문서는 노년기 여성 자기자비 글쓰기 연구 시스템의 API 엔드포인트를 정의합니다.

### 기본 정보
- **Base URL**: `https://your-domain.vercel.app` (배포 후)
- **개발 URL**: `http://localhost:3000`
- **인증 방식**: 세션 기반 (식별자 → JWT 토큰)
- **응답 형식**: JSON
- **문자 인코딩**: UTF-8

---

## 목차

1. [인증 API](#1-인증-api)
2. [설문 데이터 API](#2-설문-데이터-api)
3. [GPT 피드백 API](#3-gpt-피드백-api)
4. [세션 관리 API](#4-세션-관리-api)
5. [관리자 API](#5-관리자-api)
6. [에러 코드](#6-에러-코드)

---

## 1. 인증 API

### 1.1 식별자 검증 및 세션 생성

참여자가 카카오톡으로 받은 식별자를 검증하고 세션을 생성합니다.

**Endpoint**: `POST /api/session/validate`

**Request Body**:
```json
{
  "identifier": "WGE-2025-001"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "participantId": "550e8400-e29b-41d4-a716-446655440000",
    "groupAssignment": "A",
    "currentStage": "consent",
    "isFirstAccess": true,
    "expiresAt": "2025-01-13T23:59:59Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - 잘못된 식별자
{
  "success": false,
  "error": {
    "code": "INVALID_IDENTIFIER",
    "message": "유효하지 않은 식별자입니다."
  }
}

// 403 Forbidden - 이미 사용된 식별자
{
  "success": false,
  "error": {
    "code": "IDENTIFIER_ALREADY_USED",
    "message": "이미 사용된 식별자입니다."
  }
}

// 429 Too Many Requests - Rate limit 초과
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요."
  }
}
```

---

### 1.2 세션 상태 확인

현재 세션의 유효성을 확인합니다.

**Endpoint**: `GET /api/session/status`

**Headers**:
```
Authorization: Bearer {sessionToken}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "participantId": "550e8400-e29b-41d4-a716-446655440000",
    "groupAssignment": "A",
    "currentStage": "pre_test",
    "lastActiveAt": "2025-01-13T14:30:00Z",
    "expiresAt": "2025-01-13T18:00:00Z"
  }
}
```

**Error Responses**:
```json
// 401 Unauthorized - 세션 만료
{
  "success": false,
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "세션이 만료되었습니다. 다시 로그인해주세요."
  }
}
```

---

## 2. 설문 데이터 API

### 2.1 인구통계 정보 저장

참여자의 인구통계 정보를 저장합니다.

**Endpoint**: `POST /api/survey/demographics`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "age": 65,
  "educationLevel": "고졸",
  "maritalStatus": "기혼",
  "livingArrangement": "배우자와 동거",
  "mainStressor": "건강 문제와 경제적 어려움"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "nextStage": "pre_test"
  }
}
```

---

### 2.2 사전 검사 저장

사전 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)을 저장합니다.

**Endpoint**: `POST /api/survey/pre-test`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "scs": {
    "scs_1": 3,
    "scs_2": 4,
    "scs_3": 2,
    "scs_4": 3,
    "scs_5": 4,
    "scs_6": 3,
    "scs_7": 2,
    "scs_8": 4,
    "scs_9": 3,
    "scs_10": 3,
    "scs_11": 4,
    "scs_12": 3
  },
  "panas": {
    "positive": [3, 2, 3, 3, 4],
    "negative": [4, 3, 2, 3, 4]
  },
  "gas": [2, 3, 2, 1, 2, 3, 2, 2, 1, 3]
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "scores": {
      "scs_total": 3.17,
      "panas_positive": 3.0,
      "panas_negative": 3.2,
      "gas_total": 21
    },
    "nextStage": "negative_event"
  }
}
```

**Validation Error** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      {
        "field": "scs.scs_1",
        "message": "1에서 5 사이의 값이어야 합니다."
      }
    ]
  }
}
```

---

### 2.3 글쓰기 과제 저장

참여자의 글쓰기 내용을 저장합니다.

**Endpoint**: `POST /api/survey/writing`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "taskType": "negative_event",
  "writingContent": "지난해 여름, 갑자기 남편이 쓰러지셨을 때가 가장 힘들었습니다...",
  "wordCount": 342,
  "durationSeconds": 587,
  "startedAt": "2025-01-13T14:00:00Z",
  "completedAt": "2025-01-13T14:09:47Z"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "taskType": "negative_event",
    "wordCount": 342,
    "nextStage": "mid_test"
  }
}
```

---

### 2.4 중간 측정 저장

부정적 사건 회상 후 PANAS 측정 결과를 저장합니다.

**Endpoint**: `POST /api/survey/mid-test`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "panas": {
    "positive": [2, 1, 2, 2, 3],
    "negative": [5, 4, 3, 4, 5]
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "scores": {
      "panas_positive": 2.0,
      "panas_negative": 4.2
    },
    "nextStage": "intervention"
  }
}
```

---

### 2.5 사후 검사 저장

사후 검사 응답 (SCS-SF-12, PANAS-SF-10, GAS-10)을 저장합니다.

**Endpoint**: `POST /api/survey/post-test`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "scs": {
    "scs_1": 4,
    "scs_2": 4,
    "scs_3": 3,
    "scs_4": 4,
    "scs_5": 5,
    "scs_6": 4,
    "scs_7": 3,
    "scs_8": 4,
    "scs_9": 4,
    "scs_10": 4,
    "scs_11": 5,
    "scs_12": 4
  },
  "panas": {
    "positive": [4, 3, 4, 4, 4],
    "negative": [2, 2, 1, 2, 3]
  },
  "gas": [1, 2, 1, 0, 1, 2, 1, 1, 0, 2]
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440000",
    "scores": {
      "scs_total": 4.0,
      "panas_positive": 3.8,
      "panas_negative": 2.0,
      "gas_total": 11
    },
    "changes": {
      "scs_delta": 0.83,
      "panas_negative_delta": -1.2,
      "gas_delta": -10
    },
    "nextStage": "descriptive"
  }
}
```

---

### 2.6 서술형 응답 저장

6개 서술형 질문 응답과 인터뷰 동의를 저장합니다.

**Endpoint**: `POST /api/survey/descriptive`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "q1_negative_experience": "처음에는 힘든 기억을 떠올리는 게 괴로웠지만...",
  "q2_intervention_experience": "ChatGPT의 따뜻한 피드백이 큰 위로가 되었습니다...",
  "q3_anxiety_change": "글을 쓰면서 마음이 한결 가벼워진 느낌입니다...",
  "q4_self_care_thoughts": "평소에는 나 자신을 돌보는 게 이기적이라고 생각했는데...",
  "q5_online_program_experience": "집에서 편하게 참여할 수 있어서 좋았습니다...",
  "q6_daily_life_impact": "앞으로는 나 자신에게 좀 더 친절하게 대하려고 합니다...",
  "interviewConsent": true,
  "interviewContact": "010-1234-5678"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "bb0e8400-e29b-41d4-a716-446655440000",
    "interviewConsent": true,
    "nextStage": "complete"
  }
}
```

---

## 3. GPT 피드백 API

### 3.1 GPT 피드백 요청 (A집단만)

자기자비 글쓰기에 대한 ChatGPT 피드백을 요청합니다.

**Endpoint**: `POST /api/gpt-feedback`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "writingContent": "많은 사람들이 나와 비슷한 어려움을 겪고 있다는 걸 알게 되었습니다...",
  "feedbackType": "common_humanity",
  "writingTaskId": "880e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440000",
    "feedback": "많은 분들이 비슷한 어려움을 경험하고 계십니다. 혼자가 아니라는 것을 기억해 주세요. 이런 경험을 통해 우리는 서로를 더 깊이 이해할 수 있습니다.",
    "modelVersion": "gpt-4o-mini",
    "tokensUsed": 87,
    "responseTimeMs": 1243,
    "isFallback": false
  }
}
```

**Fallback Response** (200 OK - API 실패 시):
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440000",
    "feedback": "많은 분들이 비슷한 어려움을 경험하십니다. 혼자가 아니라는 것을 기억해 주세요.",
    "isFallback": true,
    "fallbackReason": "API timeout"
  }
}
```

**Error Responses**:
```json
// 403 Forbidden - B/C집단 접근 시도
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED_GROUP",
    "message": "이 기능은 A집단만 사용할 수 있습니다."
  }
}
```

---

## 4. 세션 관리 API

### 4.1 자동 저장 (Auto-save)

현재 작성 중인 폼 데이터를 자동으로 저장합니다.

**Endpoint**: `POST /api/session/auto-save`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentStage": "pre_test",
  "stageData": {
    "scs_1": 3,
    "scs_2": 4,
    "scs_3": null,
    "partiallyCompleted": true
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "savedAt": "2025-01-13T14:25:30Z",
    "canRestore": true
  }
}
```

---

### 4.2 저장된 데이터 복구

자동 저장된 데이터를 불러옵니다.

**Endpoint**: `GET /api/session/restore`

**Headers**:
```
Authorization: Bearer {sessionToken}
```

**Query Parameters**:
```
stage=pre_test
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "currentStage": "pre_test",
    "stageData": {
      "scs_1": 3,
      "scs_2": 4,
      "scs_3": null,
      "partiallyCompleted": true
    },
    "savedAt": "2025-01-13T14:25:30Z"
  }
}
```

**No Data Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NO_SAVED_DATA",
    "message": "저장된 데이터가 없습니다."
  }
}
```

---

### 4.3 진행 상태 업데이트

참여자의 현재 진행 단계를 업데이트합니다.

**Endpoint**: `POST /api/session/progress`

**Headers**:
```
Authorization: Bearer {sessionToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentStage": "intervention",
  "clearAutoSave": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "currentStage": "intervention",
    "updatedAt": "2025-01-13T14:30:00Z"
  }
}
```

---

## 5. 관리자 API

### 5.1 참여자 목록 조회

모든 참여자의 목록과 진행 상태를 조회합니다.

**Endpoint**: `GET /api/admin/participants`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Query Parameters**:
```
status=all           // all, pending, in_progress, completed, dropped
group=all            // all, A, B, C
page=1
limit=20
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "identifier": "WGE-2025-001",
        "groupAssignment": "A",
        "ageBlock": "60-64",
        "status": "completed",
        "startedAt": "2025-01-13T13:00:00Z",
        "completedAt": "2025-01-13T13:32:15Z",
        "durationMinutes": 32,
        "currentStage": "complete"
      },
      // ... more participants
    ],
    "pagination": {
      "total": 30,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    },
    "statistics": {
      "total": 30,
      "completed": 28,
      "inProgress": 1,
      "dropped": 1,
      "avgDurationMinutes": 31.5
    }
  }
}
```

---

### 5.2 참여자 상세 조회

특정 참여자의 모든 응답 데이터를 조회합니다.

**Endpoint**: `GET /api/admin/participants/:participantId`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "participant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "identifier": "WGE-2025-001",
      "groupAssignment": "A",
      "status": "completed"
    },
    "demographics": {
      "age": 65,
      "educationLevel": "고졸",
      "maritalStatus": "기혼",
      "livingArrangement": "배우자와 동거"
    },
    "preTest": {
      "scs_total": 3.17,
      "panas_positive": 3.0,
      "panas_negative": 3.2,
      "gas_total": 21
    },
    "postTest": {
      "scs_total": 4.0,
      "panas_positive": 3.8,
      "panas_negative": 2.0,
      "gas_total": 11
    },
    "changes": {
      "scs_delta": 0.83,
      "panas_negative_delta": -1.2,
      "gas_delta": -10
    },
    "writings": [
      {
        "taskType": "negative_event",
        "wordCount": 342,
        "durationSeconds": 587
      },
      // ... more writings
    ],
    "gptFeedbacks": [
      {
        "feedbackType": "common_humanity",
        "tokensUsed": 87
      },
      // ... more feedbacks (A집단만)
    ],
    "descriptive": {
      "q1_negative_experience": "...",
      "interviewConsent": true
    }
  }
}
```

---

### 5.3 데이터 내보내기

연구 데이터를 CSV 형식으로 내보냅니다.

**Endpoint**: `GET /api/admin/export`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Query Parameters**:
```
type=quantitative    // quantitative, qualitative, all
format=csv           // csv, json
group=all            // all, A, B, C
```

**Success Response** (200 OK):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="thesis_export_20250113.csv"

participant_id,group,age,pre_scs,post_scs,delta_scs,pre_na,post_na,delta_na,pre_gas,post_gas,delta_gas
WGE-2025-001,A,65,3.17,4.00,0.83,3.2,2.0,-1.2,21,11,-10
WGE-2025-002,A,62,3.25,3.92,0.67,3.4,2.2,-1.2,19,12,-7
...
```

---

### 5.4 집단별 통계

집단별 통계 정보를 조회합니다.

**Endpoint**: `GET /api/admin/statistics`

**Headers**:
```
Authorization: Bearer {adminToken}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "byGroup": {
      "A": {
        "totalParticipants": 10,
        "completed": 10,
        "avgDuration": 33.2,
        "avgPreScs": 3.15,
        "avgPostScs": 3.98,
        "avgScsDelta": 0.83,
        "avgPreGas": 20.3,
        "avgPostGas": 11.5,
        "avgGasDelta": -8.8
      },
      "B": {
        "totalParticipants": 10,
        "completed": 9,
        "avgDuration": 30.5,
        "avgPreScs": 3.20,
        "avgPostScs": 3.65,
        "avgScsDelta": 0.45
      },
      "C": {
        "totalParticipants": 10,
        "completed": 9,
        "avgDuration": 29.8,
        "avgPreScs": 3.18,
        "avgPostScs": 3.22,
        "avgScsDelta": 0.04
      }
    },
    "overall": {
      "totalParticipants": 30,
      "completed": 28,
      "completionRate": 93.3,
      "avgDuration": 31.2
    },
    "interviewConsent": {
      "total": 18,
      "byGroup": {
        "A": 7,
        "B": 6,
        "C": 5
      }
    }
  }
}
```

---

### 5.5 식별자 생성

새로운 참여자 식별자를 생성하고 집단에 배정합니다.

**Endpoint**: `POST /api/admin/generate-identifiers`

**Headers**:
```
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request Body**:
```json
{
  "count": 30,
  "prefix": "WGE-2025",
  "blockRandomization": [
    { "ageBlock": "60-64", "groups": ["A", "A", "B", "B", "C", "C"] },
    { "ageBlock": "65-69", "groups": ["A", "A", "B", "B", "C", "C"] },
    { "ageBlock": "70-74", "groups": ["A", "A", "B", "B", "C", "C", "A", "B", "C", "A", "B", "C"] }
  ]
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "identifiers": [
      {
        "identifier": "WGE-2025-001",
        "groupAssignment": "A",
        "ageBlock": "60-64",
        "url": "https://your-domain.vercel.app/survey/WGE-2025-001"
      },
      // ... 29 more
    ],
    "totalGenerated": 30,
    "groupDistribution": {
      "A": 10,
      "B": 10,
      "C": 10
    }
  }
}
```

---

## 6. 에러 코드

### 인증 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_IDENTIFIER` | 400 | 유효하지 않은 식별자 |
| `IDENTIFIER_ALREADY_USED` | 403 | 이미 사용된 식별자 |
| `SESSION_EXPIRED` | 401 | 세션 만료 |
| `UNAUTHORIZED_GROUP` | 403 | 권한 없는 집단 접근 |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit 초과 |

### 데이터 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `MISSING_REQUIRED_FIELD` | 400 | 필수 필드 누락 |
| `INVALID_STAGE` | 400 | 잘못된 진행 단계 |
| `DUPLICATE_SUBMISSION` | 409 | 중복 제출 |

### 시스템 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| `DATABASE_ERROR` | 500 | 데이터베이스 오류 |
| `GPT_API_ERROR` | 500 | OpenAI API 오류 (fallback 제공) |
| `INTERNAL_SERVER_ERROR` | 500 | 내부 서버 오류 |

---

## 부록

### A. 인증 헤더 예시

모든 인증이 필요한 API는 다음 헤더를 포함해야 합니다:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJncm91cCI6IkEiLCJpYXQiOjE2NDIwNjgwMDAsImV4cCI6MTY0MjA4MjQwMH0.signature
Content-Type: application/json
```

### B. Rate Limiting

API rate limit은 다음과 같이 적용됩니다:

- 식별자 검증: 5회/분
- GPT 피드백: 10회/분
- 자동 저장: 120회/시간
- 관리자 API: 60회/분

### C. CORS 정책

개발 환경에서는 `http://localhost:3000`에서의 요청을 허용합니다.
프로덕션 환경에서는 배포된 도메인만 허용합니다.

---

**문서 버전**: 1.0
**최종 수정일**: 2025-01-13
**API 버전**: v1
