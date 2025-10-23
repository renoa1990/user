/**
 * 에러 핸들러 유틸리티 (User 앱)
 */

import { NextApiResponse } from "next";
import {
  AppError,
  ErrorCode,
  logError,
  handlePrismaError,
} from "@/types/errors";
import { Prisma } from "@prisma/client";

/**
 * API 에러 응답 포맷
 */
export interface ErrorResponse {
  ok: false;
  error: {
    message: string;
    code?: ErrorCode;
    details?: any;
  };
}

/**
 * 에러를 적절한 HTTP 응답으로 변환
 */
export function handleApiError(
  error: unknown,
  res: NextApiResponse,
  context?: any
): void {
  // AppError 처리
  if (error instanceof AppError) {
    logError(error, context);

    const response: ErrorResponse = {
      ok: false,
      error: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Prisma 에러 처리
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    // 개발 환경에서만 상세 로그 출력
    if (process.env.NODE_ENV === "development") {
      console.error("=== Prisma Error Details ===");
      console.error("Error Type:", error.constructor.name);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Error Code:", error.code);
        console.error("Meta:", JSON.stringify(error.meta, null, 2));
      }
      console.error("Message:", error.message);
      console.error("===========================");
    }

    const appError = handlePrismaError(error);
    logError(appError, context);

    const response: ErrorResponse = {
      ok: false,
      error: {
        message: appError.message,
        code: appError.code,
      },
    };

    res.status(appError.statusCode).json(response);
    return;
  }

  // 일반 Error 처리
  if (error instanceof Error) {
    logError(error, context);

    const response: ErrorResponse = {
      ok: false,
      error: {
        message: "서버 오류가 발생했습니다",
        code: ErrorCode.INTERNAL_SERVER_ERROR,
      },
    };

    res.status(500).json(response);
    return;
  }

  // 알 수 없는 에러
  console.error("[UNKNOWN ERROR]", error);
  const response: ErrorResponse = {
    ok: false,
    error: {
      message: "알 수 없는 오류가 발생했습니다",
      code: ErrorCode.UNKNOWN_ERROR,
    },
  };

  res.status(500).json(response);
}

/**
 * 트랜잭션 래퍼 (에러 처리 포함)
 */
export async function withTransaction<T>(
  prisma: any,
  callback: (tx: any) => Promise<T>,
  errorMessage: string = "거래 처리 중 오류가 발생했습니다"
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx: any) => {
      return await callback(tx);
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      throw handlePrismaError(error);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      errorMessage,
      ErrorCode.TRANSACTION_FAILED,
      500,
      undefined,
      false
    );
  }
}

/**
 * 유효성 검증 헬퍼
 */
export function validateRequired(
  value: any,
  fieldName: string
): asserts value is NonNullable<typeof value> {
  if (value === null || value === undefined || value === "") {
    throw new AppError(
      `${fieldName}은(는) 필수 항목입니다`,
      ErrorCode.MISSING_REQUIRED_FIELD,
      400,
      [{ field: fieldName, message: "필수 항목입니다" }]
    );
  }
}

export function validateNumber(value: any, fieldName: string): number {
  const num = Number(value);
  if (isNaN(num)) {
    throw new AppError(
      `${fieldName}은(는) 숫자여야 합니다`,
      ErrorCode.INVALID_INPUT,
      400,
      [{ field: fieldName, value, message: "숫자여야 합니다" }]
    );
  }
  return num;
}

export function validatePositive(value: number, fieldName: string): number {
  if (value <= 0) {
    throw new AppError(
      `${fieldName}은(는) 양수여야 합니다`,
      ErrorCode.INVALID_INPUT,
      400,
      [{ field: fieldName, value, message: "양수여야 합니다" }]
    );
  }
  return value;
}
