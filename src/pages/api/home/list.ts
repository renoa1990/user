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

  const [
    infoDataResult,
    eventDataResult,
    calendarDataResult,
    loseAllDataResult,
  ] = await Promise.allSettled([
    client.infomation.findMany({
      where: { open: true },
      select: { title: true, id: true },
      orderBy: { id: "desc" },
      take: 4,
    }),
    client.eventBoard.findMany({
      where: { open: true },
      select: { title: true, id: true },
      orderBy: { number: "asc" },
      take: 4,
    }),
    client.eventCalendarSetup.findFirst({
      where: { calendarCheck: true },
    }),
    client.eventLoseAllSetup.findFirst({
      where: {
        LoseAllCheck: true,
      },
    }),
  ]);

  const infoData =
    infoDataResult.status === "fulfilled" ? infoDataResult.value : [];
  const eventData =
    eventDataResult.status === "fulfilled" ? eventDataResult.value : [];

  const eventList: { title: string; id: number; link: string }[] = [];
  const infoList: { title: string; id: number; link: string }[] = [];

  infoData.forEach((i) => {
    infoList.push({
      title: i.title,
      id: i.id,
      link: `/infomation`,
    });
  });

  if (calendarDataResult.status === "fulfilled" && calendarDataResult.value) {
    eventList.push({
      title: "출석체크 이벤트",
      id: 9999999999999,
      link: "/event/calendar",
    });
  }
  if (loseAllDataResult.status === "fulfilled" && loseAllDataResult.value) {
    eventList.push({
      title: "올 미당첨 이벤트",
      id: 99999999998,
      link: "/event/loseAll",
    });
  }

  eventData.forEach((i) => {
    if (eventList.length < 4) {
      eventList.push({
        title: i.title,
        id: i.id,
        link: `/event/${i.id}`,
      });
    }
  });

  res.json({
    ok: true,
    eventList,
    infoList,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
