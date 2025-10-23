import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import { cross, live, special } from "@prisma/client";
type ActiveTabType = "cross" | "special" | "live";
interface PrismaModel {
  findMany: (args: any) => Promise<cross[] | special[] | live[]>; // 실제 인자와 반환 타입으로 변경해주세요.
}
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
    query: { tabs },
  } = req;
  if (
    typeof tabs !== "string" ||
    !["cross", "special", "live"].includes(tabs)
  ) {
    res.json({ ok: false });
  }
  const currentDate = new Date();
  const twentyFourHoursLater = new Date(
    currentDate.getTime() + 18 * 60 * 60 * 1000
  ); // 현재 시간으로부터 24시간 후

  const models: Record<ActiveTabType, PrismaModel> = {
    cross: client.cross,
    special: client.special,
    live: client.live,
  };

  const list = await models[tabs as ActiveTabType].findMany({
    where: {
      activate: true,
      playTime: {
        gte: currentDate,
        lte: twentyFourHoursLater,
      },
      result_exception: false,
      result_cancle: false,
      result: null,
      NOT: {
        league: {
          parse: false,
        },
      },
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      gameMemo: true,
    },

    orderBy: [
      {
        playTime: "asc",
      },
      {
        game_Name: "asc",
      },

      {
        tieOdds: "asc",
      },
    ],
  });

  const grouped = list.reduce((acc, item) => {
    const key = `${item.playTime}-${item.leagueId}-${item.homeTeamId}-${item.awayTeamId}`;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);

    return acc;
  }, {} as { [key: string]: cross[] });

  // 각 그룹 내에서 '승무패' 타입이 먼저 오도록 정렬
  Object.values(grouped).forEach((group: any[]) => {
    group.sort((a, b) => (a.game_Type === "match" ? -1 : 1));
  });

  // 그룹핑된 배열을 다시 하나의 배열로 합침
  const sortedList = ([] as any[]).concat(...(Object.values(grouped) as any[]));

  let newItem: any = [];
  sortedList?.map((i, index, arr) => {
    if (
      index !== 0 &&
      i.game_Name === arr[index - 1].game_Name &&
      +i.playTime === +arr[index - 1].playTime &&
      i.homeTeamId === arr[index - 1].homeTeamId &&
      i.awayTeamId === arr[index - 1].awayTeamId
    ) {
      if (newItem[newItem.length - 1]?.handicap) {
        newItem[newItem.length - 1].handicap.push(i);
      } else {
        newItem[newItem.length - 1] = {
          ...newItem[newItem.length - 1],
          handicap: [i],
        };
      }
    } else {
      if (
        index !== 0 &&
        i.game_Event === arr[index - 1].game_Event &&
        i.game_Name === arr[index - 1].game_Name &&
        +i.playTime === +arr[index - 1].playTime
      ) {
      } else {
        newItem.push({
          tag: true,
          game_Event: i.game_Event,
          league: i.league,
          playTime: i.playTime,
        });
      }
      newItem.push(i);
    }
  });

  res.json({ ok: true, list: newItem });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
