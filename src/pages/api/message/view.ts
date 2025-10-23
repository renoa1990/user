import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { id },
  } = req;

  await client.message.update({
    where: {
      id: id,
    },
    data: {
      userCheck: true,
    },
  });

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
