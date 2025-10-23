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
    query: { key, module },
  } = req;

  if (!key || !module) return;
  if (!user) return;
  if (user.role !== "user") return;

  const userData = await client.parisuser.findFirst({
    where: {
      id: user?.id,
    },
    select: {
      money: true,
      BGid: true,
      casino_block: true,
      userId: true,
    },
  });
  if (userData?.casino_block) {
    //카지노 블럭인경우
    return;
  }
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const resGame = await fetch(
    "https://api.timemoon-games.com/prod/api/v2/games",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorKey: key,
        store_key: process.env.BG_STOREKEY,
        module: module,
      }),
    }
  );
  const gamelist = await resGame.json();
  res.json({ ok: true, gamelist });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
