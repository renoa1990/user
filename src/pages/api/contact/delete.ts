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
    session: { user },
  } = req;

  const check = await client.contact.findFirst({
    where: {
      id: id,
      userDelete: false,
    },
  });

  if (check) {
    const contactDelete = await client.contact.update({
      where: {
        id: id,
      },
      data: {
        userDelete: true,
      },
    });

    res.json({
      ok: true,
      contactDelete,
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
