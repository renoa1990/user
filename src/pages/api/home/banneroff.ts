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

  if (!user?.id) {
    res.json({
      ok: true,
      nothing: true,
    });
    return;
  } else {
    const off = Boolean(
      await client.bannerOff.create({
        data: {
          parisuserId: user?.id,
          bannerId: id,
        },
      })
    );
    res.json({
      ok: true,
      off,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
