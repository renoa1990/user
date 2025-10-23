import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
  } = req;

  if (id) {
    const event = await client.eventBoard.findFirst({
      where: {
        open: true,
        id: +id,
      },
      orderBy: {
        number: "asc",
      },
    });

    res.json({
      ok: true,
      event,
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
    methods: ["GET"],
    handler,
  })
);
