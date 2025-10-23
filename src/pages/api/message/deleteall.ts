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

  const check = await client.message.findFirst({
    where: {
      parisuserId: user?.id,
      userCheck: true,
      userDelete: false,
    },
  });
  if (check) {
    const deleteAll = Boolean(
      await client.message.updateMany({
        where: {
          parisuserId: user?.id,
          userDelete: false,
          userCheck: true,
        },
        data: {
          userDelete: true,
        },
      })
    );

    res.json({
      ok: true,
      deleteAll,
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
