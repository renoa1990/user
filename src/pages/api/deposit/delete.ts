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

  const check = await client.money.findFirst({
    where: {
      id,
      userDelete: false,
    },
  });

  if (check) {
    const deleteitem = Boolean(
      await client.money.update({
        where: {
          id,
        },
        data: {
          userDelete: true,
        },
      })
    );

    res.json({
      ok: true,
      deleteitem,
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
