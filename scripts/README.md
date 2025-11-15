# 참여자 관리 스크립트

## 📋 참여자 등록 (보안 강화)

### 1. 환경 설정 확인

`.env.local` 파일에 다음 값이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 참여자 등록 실행

```bash
npm run register-participants
```

이 명령어는 **30명의 참여자 코드**를 자동으로 생성합니다:
- **무작위 6자리 코드** (예: `482756`, `917234`, `635421`)
- **암호학적으로 안전**: Node.js `crypto.randomInt()` 사용
- **예측 불가능**: 순차적이지 않아 다른 코드 추측 불가
- 집단 배정: NULL (첫 로그인 시 자동 균형 배정)
- 상태: `pending`

### 3. 보안 특징

✅ **예측 불가능성**: 100001 → 100002 같은 패턴 없음
✅ **무단 접근 방지**: 한 코드를 알아도 다른 참여자 코드 추측 불가
✅ **중복 검사**: 기존 코드와 절대 중복되지 않음
✅ **암호학적 안전성**: 보안 랜덤 생성기 사용

### 4. 참여자 코드 배포

생성된 코드를 카카오톡으로 **개별적으로** 참여자들에게 전달합니다.

⚠️ **주의**: 코드는 절대 공개하지 마세요!

---

## 🎯 자동 균형 배정 시스템

### 작동 원리

1. **참여자 코드 입력**: 참여자가 6자리 코드 입력 (예: 100001)
2. **첫 로그인 시 자동 배정**:
   - 현재 A/B/C 집단 인원수 확인
   - 가장 인원이 적은 집단에 배정
   - 동점일 경우 랜덤 선택
3. **재접속 시**: 이미 배정된 집단 유지

### 배정 예시

```
로그인 순서  |  A집단  |  B집단  |  C집단  |  배정 결과
─────────────┼─────────┼─────────┼─────────┼──────────────
참여자 1     |   0     |   0     |   0     |  → 랜덤 (예: A)
참여자 2     |   1     |   0     |   0     |  → B or C 중 랜덤
참여자 3     |   1     |   1     |   0     |  → C
참여자 4     |   1     |   1     |   1     |  → 랜덤
참여자 5     |   2     |   1     |   1     |  → B or C 중 랜덤
...
```

**최종 결과**: 30명 → A집단 10명, B집단 10명, C집단 10명 (균형 유지)

---

## 🔍 모니터링

### 현재 집단별 인원수 확인

```sql
SELECT
  group_assignment,
  COUNT(*) as count
FROM thesis_participants
WHERE group_assignment IS NOT NULL
GROUP BY group_assignment
ORDER BY group_assignment;
```

### 전체 참여자 현황

```sql
SELECT
  status,
  COUNT(*) as count
FROM thesis_participants
GROUP BY status;
```

---

## ⚠️ 주의사항

1. **중복 등록 방지**: 스크립트는 이미 존재하는 코드를 무시합니다
2. **Service Role Key 보안**: `.env.local` 파일을 절대 공유하지 마세요
3. **코드 전달**: 참여자에게 6자리 숫자만 전달 (예: "100001")

---

## 📊 논문 작성 시 방법론 기술

```
참여자는 균형 무작위 배정(balanced randomization)을 통해
세 집단(A: 자기자비 글쓰기 + ChatGPT 피드백,
B: 자기자비 글쓰기만, C: 중립 글쓰기)에 배정되었다.
배정은 참여자의 첫 로그인 시 자동으로 이루어졌으며,
각 집단의 인원수가 균등하게 유지되도록 알고리즘이 설계되었다.
```

**영문 버전**:
```
Participants were randomly assigned to one of three groups
(A: self-compassion writing with ChatGPT feedback,
B: self-compassion writing alone,
C: neutral writing control)
using a balanced randomization algorithm.
The assignment occurred automatically at first login,
ensuring equal distribution across groups.
```
