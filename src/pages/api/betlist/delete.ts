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
    body: { id, method, value },
  } = req;

  let query = {};
  if (method === "all") {
    query = {
      where: {
        userdelete: false,
        parisuserId: user?.id,
        status: {
          not: "ready",
        },
        betTime: {
          gte: new Date(+new Date() - 604800000),
          lte: new Date(),
        },
      },
    };
  } else if (method === "check") {
    query = {
      where: { userdelete: false, parisuserId: user?.id, id: { in: value } },
    };
  } else {
    query = {
      where: { userdelete: false, parisuserId: user?.id, id: +id },
    };
  }

  const data = Boolean(
    await client.bettinglist.updateMany({
      ...query,
      data: {
        userdelete: true,
      },
    })
  );

  res.json({
    ok: true,
    data,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
