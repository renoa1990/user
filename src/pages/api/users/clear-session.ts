import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withAipSession } from "@libs/server/withSession";
import client from "@libs/server/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  if (user?.id) {
    await client.parisuser.update({
      where: { id: user.id },
      data: {
        session: "", // 세션 토큰을 빈 문자열로 설정
        lastPageAt: null, // 마지막 활동 시간 초기화
      },
    });
  }

  // 세션 완전히 파괴
  req.session.destroy();

  // 응답 헤더 설정 (keepalive 요청에 대응)
  res.setHeader("Connection", "close");

  res.json({
    ok: true,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false, // 세션이 만료된 상태에서도 호출 가능
  })
);
