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

  const today = new Date();
  const threeyDays = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); //30일전
  const eventPoint = await client.eventPoint.findMany({
    where: {
      parisuserId: user?.id,
      eventname: "올미당첨",
      OR: [
        { confirm: null },
        { NOT: { confirm: null }, createAt: { gte: threeyDays, lte: today } },
      ],
    },
    orderBy: { createAt: "desc" },
  });

  res.json({
    ok: true,
    eventPoint,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
