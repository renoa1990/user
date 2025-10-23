import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  const check = Boolean(
    await client.message.findFirst({
      where: {
        parisuserId: user?.id,
        userCheck: false,
      },
    })
  );

  if (check) {
    const viewAll = Boolean(
      await client.message.updateMany({
        where: {
          parisuserId: user?.id,
          userCheck: false,
        },
        data: {
          userCheck: true,
        },
      })
    );

    res.json({
      ok: true,
      viewAll,
    });
  } else {
    res.json({
      ok: true,
      nothing: true,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
