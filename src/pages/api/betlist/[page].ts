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
    query: { page, rowPerPage, gameCode },
  } = req;

  // gameCode 탭 값에 따른 필터링 조건 설정
  // 요구사항: 크로스/스페셜/실시간 탭은 gameCode='스포츠' + game_Event 매칭(실시간 → 라이브)
  const normalizedTab = (gameCode as string) || "전체";
  const isSportsEventTab = ["크로스", "스페셜", "실시간"].includes(
    normalizedTab
  );
  const mappedEvent = normalizedTab === "실시간" ? "라이브" : normalizedTab; // 실시간 탭 → 라이브 이벤트명

  const baseFilter = {
    parisuserId: user?.id,
    betTime: {
      gte: new Date(+new Date() - 604800000),
      lte: new Date(),
    },
    userdelete: false,
  } as const;

  const gameCodeFilter =
    normalizedTab && normalizedTab !== "전체"
      ? isSportsEventTab
        ? { gameCode: "스포츠", game_Event: mappedEvent }
        : { gameCode: normalizedTab }
      : { NOT: { gameCode: "카지노" } };

  const where = { ...baseFilter, ...gameCodeFilter } as const;

  const listcount = await client.bettinglist.aggregate({
    where,
    orderBy: {
      betTime: "desc",
    },
    _count: true,
  });

  if (listcount._count > 0) {
    const lastId = await client.bettinglist.findFirst({
      where,
      orderBy: {
        betTime: "desc",
      },
      select: {
        id: true,
      },
    });

    const list = await client.bettinglist.findMany({
      where,
      take: rowPerPage ? +rowPerPage : 10,
      skip: page && rowPerPage ? (+page - 1) * +rowPerPage : 0,
      cursor: { id: lastId?.id },

      orderBy: {
        betTime: "desc",
      },
      select: {
        id: true,
        gameCode: true,
        game_Event: true,
        betTime: true,
        totalOdd: true,
        betPrice: true,
        winPrice: true,
        payment: true,
        status: true,
        userdelete: true,
        betDetail: {
          select: {
            id: true,
            game_Event: true,

            game_Name: true,
            game_Type: true,
            game_Time: true,
            game_Memo: true,
            team_home: true,
            team_tie: true,
            team_away: true,
            Odds_home: true,
            Odds_tie: true,
            Odds_away: true,
            score_home: true,
            score_away: true,
            PickOdds: true,
            Pick: true,
            result: true,
            status: true,

            away_TeamName: { select: { changeName: true } },
            home_TeamName: { select: { changeName: true } },
            leagueName: { select: { flegImg: true, changeName: true } },
            gameMemo: { select: { changeName: true } },
          },
        },
      },
    });
    res.json({
      ok: true,
      listcount,
      list,
    });
  } else {
    res.json({
      ok: true,
      listcount,
      list: [],
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
