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
    body: { id },
  } = req;

  const application = Boolean(
    await client.eventPoint.update({
      where: { id },
      data: {
        application: true,
        applicationDate: new Date(),
      },
    })
  );
  res.json({
    ok: true,
    application,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
