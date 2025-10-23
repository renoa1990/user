import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import pwencoder from "@libs/server/pwencoder";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  const list = await client.message.findMany({
    where: {
      parisuserId: user?.id,
      userDelete: false,
    },
  });

  res.json({
    ok: true,
    list,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
