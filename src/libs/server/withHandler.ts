import { NextApiRequest, NextApiResponse } from "next/types";
import { handleApiError } from "./error-handler";
import { AuthenticationError } from "@/types/errors";

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

type method = "GET" | "POST" | "DELETE";

interface ConfigType {
  methods: method[];
  handler: (req: NextApiRequest, res: NextApiResponse) => void;
  isPrivate?: boolean;
}

export default function withHandler({
  methods,
  handler,
  isPrivate = true,
}: ConfigType) {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<any> {
    try {
      // HTTP 메서드 검증
      if (req.method && !methods.includes(req.method as any)) {
        return res.status(405).json({
          ok: false,
          error: {
            message: "허용되지 않은 메서드입니다",
            allowedMethods: methods,
          },
        });
      }

      // 인증 검증
      if (isPrivate && !req.session.user) {
        throw new AuthenticationError("로그인이 필요합니다");
      }

      // 핸들러 실행
      await handler(req, res);
    } catch (error) {
      // 통합 에러 처리
      handleApiError(error, res, {
        method: req.method,
        url: req.url,
        userId: req.session.user?.userId,
        timestamp: new Date().toISOString(),
      });
    }
  };
}
