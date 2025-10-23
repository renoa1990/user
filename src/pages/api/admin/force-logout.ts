import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { userId },
  } = req;

  if (!userId) {
    return res.json({
      ok: false,
      message: "사용자 ID가 필요합니다",
    });
  }

  try {
    // 해당 사용자의 세션을 FORCE_LOGOUT으로 설정
    await client.parisuser.update({
      where: { userId },
      data: {
        session: "FORCE_LOGOUT",
        lastPageAt: null,
      },
    });

    res.json({
      ok: true,
      message: "강제 로그아웃이 적용되었습니다",
    });
  } catch (error) {
    console.error("Force logout error:", error);
    res.json({
      ok: false,
      message: "강제 로그아웃 처리 중 오류가 발생했습니다",
    });
  }
}

export default withHandler({
  methods: ["POST"],
  handler,
  isPrivate: false,
});
