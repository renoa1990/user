/**
 * 커스텀 에러 타입 정의 (User 앱)
 */

export enum ErrorCode {
  // 인증 에러 (1xxx)
  UNAUTHORIZED = 1001,
  INVALID_CREDENTIALS = 1002,
  SESSION_EXPIRED = 1003,
  ACCOUNT_SUSPENDED = 1004,

  // 리소스 에러 (2xxx)
  NOT_FOUND = 2001,
  ALREADY_EXISTS = 2002,

  // 유효성 검증 에러 (3xxx)
  VALIDATION_ERROR = 3001,
  INVALID_INPUT = 3002,
  MISSING_REQUIRED_FIELD = 3003,

  // 비즈니스 로직 에러 (4xxx)
  INSUFFICIENT_BALANCE = 4001,
  BETTING_CLOSED = 4002,
  WITHDRAWAL_NOT_ALLOWED = 4003,
  DEPOSIT_FAILED = 4004,
  BETTING_LIMIT_EXCEEDED = 4005,

  // 데이터베이스 에러 (5xxx)
  DATABASE_ERROR = 5001,
  TRANSACTION_FAILED = 5002,

  // 서버 에러 (9xxx)
  INTERNAL_SERVER_ERROR = 9001,
  UNKNOWN_ERROR = 9999,
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  constraint?: string;
  message?: string;
}

/**
 * 애플리케이션 커스텀 에러 클래스
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    details?: ErrorDetails[],
    isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * 사전 정의된 에러 생성 함수들
 */

export class AuthenticationError extends AppError {
  constructor(message: string = "로그인이 필요합니다") {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = "아이디 또는 비밀번호가 일치하지 않습니다") {
    super(message, ErrorCode.INVALID_CREDENTIALS, 401);
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message: string = "계정이 정지되었습니다") {
    super(message, ErrorCode.ACCOUNT_SUSPENDED, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "리소스") {
    super(`${resource}를 찾을 수 없습니다`, ErrorCode.NOT_FOUND, 404);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = "입력값이 유효하지 않습니다",
    details?: ErrorDetails[]
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, details);
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(message: string = "보유금이 부족합니다") {
    super(message, ErrorCode.INSUFFICIENT_BALANCE, 400);
  }
}

export class BettingClosedError extends AppError {
  constructor(message: string = "베팅이 마감되었습니다") {
    super(message, ErrorCode.BETTING_CLOSED, 400);
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string = "데이터베이스 오류가 발생했습니다",
    originalError?: Error
  ) {
    super(message, ErrorCode.DATABASE_ERROR, 500, undefined, false);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class TransactionError extends AppError {
  constructor(
    message: string = "거래 처리 중 오류가 발생했습니다",
    originalError?: Error
  ) {
    super(message, ErrorCode.TRANSACTION_FAILED, 500, undefined, false);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Prisma 에러를 AppError로 변환
 */
export function handlePrismaError(error: any): AppError {
  if (error.code === "P2002") {
    return new AppError(
      "이미 존재하는 데이터입니다",
      ErrorCode.ALREADY_EXISTS,
      409
    );
  }

  if (error.code === "P2025") {
    return new NotFoundError("데이터");
  }

  if (error.code === "P2003") {
    return new ValidationError("참조 무결성 오류가 발생했습니다");
  }

  return new DatabaseError("데이터베이스 오류가 발생했습니다", error);
}

/**
 * 에러 로깅 유틸리티
 */
export function logError(error: Error | AppError, context?: any) {
  const timestamp = new Date().toISOString();
  const isAppError = error instanceof AppError;

  console.error("=".repeat(80));
  console.error(`[ERROR] ${timestamp}`);
  console.error(`Name: ${error.name}`);
  console.error(`Message: ${error.message}`);

  if (isAppError) {
    console.error(`Code: ${error.code}`);
    console.error(`Status: ${error.statusCode}`);
    if (error.details) {
      console.error(`Details:`, JSON.stringify(error.details, null, 2));
    }
  }

  if (context) {
    console.error(`Context:`, JSON.stringify(context, null, 2));
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(`Stack:`, error.stack);
  }
  console.error("=".repeat(80));
}
















