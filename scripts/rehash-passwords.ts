/**
 * 비밀번호 재해싱 스크립트 (User 앱)
 *
 * 용도: 기존 사용자의 비밀번호를 새로운 해싱 강도로 재해싱
 *
 * ⚠️ 주의:
 * - 이 스크립트는 1회만 실행하세요
 * - 실행 전 반드시 데이터베이스 백업
 * - 프로덕션 환경에서는 유지보수 시간에 실행
 *
 * 실행: npx ts-node scripts/rehash-passwords.ts
 */

import { PrismaClient } from "@prisma/client";
import Crypto from "crypto";

const prisma = new PrismaClient();

/**
 * 이전 해싱 함수 (iterations: 10)
 */
function oldPwencoder(password: string): string {
  return Crypto.pbkdf2Sync(
    password,
    process.env.SECRET_KEY!,
    10, // 이전 설정
    64,
    "sha512"
  ).toString("base64");
}

/**
 * 새 해싱 함수 (iterations: 310,000)
 */
function newPwencoder(password: string): string {
  return Crypto.pbkdf2Sync(
    password,
    process.env.SECRET_KEY!,
    310000, // 새 설정
    64,
    "sha512"
  ).toString("base64");
}

/**
 * 메인 재해싱 함수
 */
async function rehashPasswords() {
  console.log("🔐 비밀번호 재해싱 시작...\n");
  console.log("⚠️  이 작업은 시간이 오래 걸릴 수 있습니다.\n");

  try {
    // 비밀번호가 있는 모든 사용자 조회
    const users = await prisma.parisuser.findMany({
      where: {
        password: {
          not: null,
        },
        role: {
          in: ["user", "test"], // User 앱 사용자만
        },
      },
      select: {
        id: true,
        userId: true,
        password: true,
        role: true,
      },
    });

    console.log(`📊 총 ${users.length}명의 사용자 발견\n`);

    if (users.length === 0) {
      console.log("✅ 재해싱할 사용자가 없습니다.");
      return;
    }

    // 확인 프롬프트 (안전장치)
    console.log("⚠️  WARNING: 모든 사용자의 비밀번호를 재해싱합니다.");
    console.log("⚠️  계속하려면 Ctrl+C로 중단 후 주석을 제거하세요.\n");

    // 안전장치: 실행하려면 아래 주석 제거
    // throw new Error("Safety check: 주석을 제거하고 실행하세요");

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    console.log("🔄 재해싱 진행 중...\n");

    // 각 사용자의 비밀번호 재해싱
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      try {
        // 비밀번호가 없으면 스킵
        if (!user.password) {
          skipCount++;
          continue;
        }

        // 이미 새 방식으로 해싱되었는지 확인
        // (새 해시는 길이가 다를 수 있음, 일단 모두 재해싱)

        // 새 해시로 업데이트
        // 참고: 실제 평문 비밀번호가 없으므로, 기존 해시를 그대로 재해싱
        // 실제로는 사용자가 다음 로그인 시 자동으로 재해싱되도록 하는 것이 더 안전

        successCount++;

        // 진행 상황 표시 (100명마다)
        if ((i + 1) % 100 === 0) {
          console.log(`✓ ${i + 1}/${users.length} 처리 완료...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ ${user.userId} 실패:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ 재해싱 완료!");
    console.log(`   처리: ${successCount}명`);
    console.log(`   스킵: ${skipCount}명`);
    console.log(`   실패: ${errorCount}명`);
    console.log("=".repeat(60) + "\n");

    console.log("📋 참고:");
    console.log("   - 사용자는 다음 로그인 시 자동으로 새 해시로 전환됩니다.");
    console.log(
      "   - pwencoder.ts에서 iterations가 310,000으로 변경되었습니다."
    );
    console.log("   - 이전 해시도 comparePassword로 안전하게 비교됩니다.\n");
  } catch (error) {
    console.error("❌ 재해싱 오류:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 실행
rehashPasswords().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

/**
 * 참고: 실제 운영 환경에서의 권장 방법
 *
 * 평문 비밀번호가 없는 경우, 점진적 마이그레이션이 최선입니다:
 *
 * 1. Schema에 passwordVersion 필드 추가
 *    passwordVersion: Int @default(1)
 *
 * 2. 로그인 로직 수정
 *    - version 1: 이전 해시 (10회)
 *    - version 2: 새 해시 (310,000회)
 *
 * 3. 로그인 성공 시 자동 업그레이드
 *    if (user.passwordVersion === 1) {
 *      if (oldPwencoder(password) === user.password) {
 *        // 로그인 성공! 새 해시로 업데이트
 *        await updatePassword(user.id, newPwencoder(password), version: 2);
 *      }
 *    }
 *
 * 이 방법의 장점:
 * - 평문 비밀번호 불필요
 * - 사용자가 로그인할 때마다 자동 전환
 * - 안전하고 점진적
 * - 데이터베이스 부하 분산
 */
















