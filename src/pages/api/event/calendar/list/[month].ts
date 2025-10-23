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
    query: { month, year },
  } = req;
  if (!year || !month) return;

  const today = new Date();
  const threeyDays = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); //30일전
  const eventPoint = await client.eventPoint.findMany({
    where: {
      parisuserId: user?.id,
      eventname: "출석체크",
      OR: [
        { confirm: null },
        { NOT: { confirm: null }, createAt: { gte: threeyDays, lte: today } },
      ],
    },
    orderBy: { createAt: "desc" },
  });

  const currentYear = today.getFullYear();
  let currentMonth = today.getMonth(); // 이제 0부터 11까지의 값을 가짐

  const startOfMonth = new Date(currentYear, currentMonth, 1);
  let endOfMonth;

  if (currentMonth === 11) {
    // 12월인 경우, 다음 해의 1월로 넘어갑니다
    endOfMonth = new Date(currentYear + 1, 0, 1);
  } else {
    endOfMonth = new Date(currentYear, currentMonth + 1, 1);
  }

  const calendarDay = await client.calendarEventData.findMany({
    where: {
      parisuserId: user?.id,
      check: {
        gte: startOfMonth,
        lt: endOfMonth,
      },
    },
    select: {
      check: true,
    },
  });

  res.json({
    ok: true,
    eventPoint,
    calendarDay,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
