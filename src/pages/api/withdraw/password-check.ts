import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      data: { bankPassword },
    },
    session: { user },
  } = req;

  if (!user || !bankPassword) {
    res.json({ ok: true, passwordCheck: false });
    return;
  }

  const passwordCheck = Boolean(
    await client.parisuser.findFirst({
      where: {
        id: user?.id,
        bankPassword: bankPassword,
      },
    })
  );

  res.json({
    ok: true,
    passwordCheck,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
