/**
 * Pagination 유틸리티 (User 앱)
 *
 * 전체 API에서 반복되는 페이지네이션 로직을 공통화
 */

import { PrismaClient } from "@prisma/client";

export interface PaginationOptions<T = any> {
  where?: any;
  select?: any;
  include?: any;
  orderBy?: any;
  page: number;
  rowsPerPage: number;
}

export interface PaginationResult<T> {
  list: T[];
  count: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Offset 기반 페이지네이션
 *
 * @param model - Prisma 모델
 * @param options - 페이지네이션 옵션
 * @returns 페이지네이션 결과
 */
export async function paginateWithOffset<T>(
  model: any,
  options: PaginationOptions<T>
): Promise<PaginationResult<T>> {
  const { where, select, include, orderBy, page, rowsPerPage } = options;

  // 병렬로 조회 (성능 향상)
  const [list, count] = await Promise.all([
    model.findMany({
      where,
      select,
      include,
      orderBy,
      take: rowsPerPage,
      skip: page * rowsPerPage,
    }),
    model.count({ where }),
  ]);

  return {
    list,
    count,
    totalPages: Math.ceil(count / rowsPerPage),
    currentPage: page,
  };
}

/**
 * 레거시 호환 함수
 */
export async function paginateQuery<T>(
  model: any,
  options: PaginationOptions<T>
): Promise<{
  list: T[];
  listcount: { _count: number };
}> {
  const result = await paginateWithOffset(model, options);

  return {
    list: result.list,
    listcount: { _count: result.count },
  };
}
















