import Crypto from "crypto";

interface cryptoResponse {
  password: String | any;
  SECRET_KEY: any;
}

/**
 * 비밀번호 해싱 함수 (PBKDF2)
 * OWASP 2023 권장 설정 적용
 * @param password - 해싱할 비밀번호
 * @returns Base64 인코딩된 해시
 */
export default function pwencoder(password: string) {
  return Crypto.pbkdf2Sync(
    password,
    process.env.SECRET_KEY!,
    310000, // OWASP 2023 권장: 310,000회 (이전: 10회)
    64,
    "sha512"
  ).toString("base64");
}

/**
 * 비밀번호 비교 (타이밍 공격 방어)
 * @param inputPassword - 입력된 비밀번호
 * @param storedHash - 저장된 해시
 * @returns 일치 여부
 */
export function comparePassword(
  inputPassword: string,
  storedHash: string
): boolean {
  try {
    const inputHash = Buffer.from(pwencoder(inputPassword));
    const storedBuffer = Buffer.from(storedHash);

    // 길이가 다르면 즉시 false
    if (inputHash.length !== storedBuffer.length) {
      return false;
    }

    // constant-time 비교 (타이밍 공격 방어)
    return Crypto.timingSafeEqual(inputHash, storedBuffer);
  } catch (error) {
    console.error("[comparePassword] Error:", error);
    return false;
  }
}
