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
        lastPageAt: null,
        session: "", // 세션 토큰을 빈 문자열로 설정
      },
    });
  }

  // 세션 완전히 파괴
  req.session.destroy();

  res.json({
    ok: true,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
