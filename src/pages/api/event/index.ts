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

  const [eventBoard, eventCalendar, eventLoseAllSetup] = await Promise.all([
    client.eventBoard.findMany({
      where: {
        open: true,
      },
      orderBy: {
        number: "asc",
      },
    }),
    client.eventCalendarSetup.findFirst({
      where: {
        id: 1,
        calendarCheck: true,
      },
    }),
    client.eventLoseAllSetup.findFirst({
      where: {
        id: 1,
        LoseAllCheck: true,
      },
    }),
  ]);

  res.json({
    ok: true,
    eventBoard,
    eventCalendar,
    eventLoseAllSetup,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
