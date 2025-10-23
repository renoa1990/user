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
      admincheck: false,
      confirm: null,
    },
  });

  if (check) {
    const cancleitem = Boolean(
      await client.money.update({
        where: {
          id: id,
        },
        data: {
          confirm: false,
          updateAt: new Date(),
          Parisuser: {
            update: {
              money: {
                increment: check.Money,
              },
            },
          },
        },
      })
    );

    res.json({
      ok: true,
      cancleitem,
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
