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

  const contact = await client.contact.findMany({
    where: {
      parisuserId: user?.id,
      userDelete: false,
    },
    include: {
      Parisuser: {
        select: {
          nickName: true,
        },
      },
    },
  });

  res.json({
    ok: true,
    contact,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
