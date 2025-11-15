/**
 * 참여자 등록 스크립트 (보안 강화 버전)
 *
 * 사용법:
 * node scripts/register-participants.js
 *
 * 30명의 참여자 코드를 무작위로 생성합니다
 * - 예측 불가능한 6자리 숫자 (예: 482756, 917234)
 * - 중복 검사를 통한 고유성 보장
 * - group_assignment는 NULL로 설정하여 첫 로그인 시 자동 배정
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomInt } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 로드
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 암호학적으로 안전한 6자리 무작위 코드 생성
 * @returns {string} 6자리 숫자 문자열
 */
function generateSecureCode() {
  // 100000 ~ 999999 범위의 무작위 숫자 생성 (암호학적으로 안전)
  const code = randomInt(100000, 1000000);
  return code.toString();
}

/**
 * 기존 코드와 중복되지 않는 고유 코드 생성
 */
async function generateUniqueCode(existingCodes) {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const code = generateSecureCode();

    // 기존 코드와 중복 확인
    if (!existingCodes.has(code)) {
      return code;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique code after maximum attempts');
}

async function registerParticipants() {
  console.log('🚀 Starting secure participant registration...\n');

  // 기존에 등록된 코드 조회
  const { data: existingParticipants } = await supabase
    .from('thesis_participants')
    .select('identifier');

  const existingCodes = new Set(
    existingParticipants?.map(p => p.identifier) || []
  );

  console.log(`📊 Existing participants: ${existingCodes.size}`);
  console.log(`🎲 Generating 30 new secure random codes...\n`);

  // 30개의 고유한 무작위 코드 생성
  const participants = [];
  const generatedCodes = new Set();

  for (let i = 0; i < 30; i++) {
    let code;
    let attempts = 0;

    // 생성된 코드들과도 중복되지 않도록
    do {
      code = generateSecureCode();
      attempts++;

      if (attempts > 100) {
        throw new Error('Failed to generate unique codes');
      }
    } while (existingCodes.has(code) || generatedCodes.has(code));

    generatedCodes.add(code);
    participants.push({
      identifier: code,
      group_assignment: null, // NULL로 설정 → 첫 로그인 시 자동 배정
      status: 'pending',
    });
  }

  // DB에 삽입
  const { data, error } = await supabase
    .from('thesis_participants')
    .insert(participants)
    .select();

  if (error) {
    console.error('❌ Error inserting participants:', error.message);
    process.exit(1);
  }

  console.log(`✅ Successfully registered ${data?.length || 0} participants\n`);

  // 현재 등록된 참여자 수 확인
  const { count } = await supabase
    .from('thesis_participants')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total participants in database: ${count}\n`);

  console.log('🎉 Registration complete!');
  console.log('\n🔐 Secure Participant Codes (무작위 생성)');
  console.log('─'.repeat(60));

  // 코드를 정렬하여 출력 (배포 편의성)
  const sortedParticipants = [...participants].sort((a, b) =>
    a.identifier.localeCompare(b.identifier)
  );

  sortedParticipants.forEach((p, idx) => {
    console.log(`${(idx + 1).toString().padStart(2, '0')}. ${p.identifier}`);
  });
  console.log('─'.repeat(60));
  console.log('\n💡 Tip: Share these codes via KakaoTalk to participants');
  console.log('💡 Each code is randomly generated and unpredictable');
  console.log('💡 Group assignment will happen automatically on first login');
  console.log('\n⚠️  Security: Keep these codes confidential!');
}

registerParticipants().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
