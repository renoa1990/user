import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { type },
    session: { user },
  } = req;

  const [
    powerball,
    powerladder,
    kinoladder,
    Eos5,
    Eos4,
    Eos3,
    Eos2,
    Eos1,
    starladder1,
    starladder2,
    starladder3,
    list,
  ] = await Promise.all([
    client.powerball.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,
        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_home_under: true,
        game4_odd_home_over: true,
        game4_odd_away_under: true,
        game4_odd_away_over: true,
        game5_odd_home_small: true,
        game5_odd_home_medium: true,
        game5_odd_home_large: true,
        game5_odd_away_small: true,
        game5_odd_away_medium: true,
        game5_odd_away_large: true,
      },
    }),
    await client.powerLadder.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,
        game_odd_left: true,
        game_odd_right: true,
        game_odd_line3: true,
        game_odd_line4: true,
        game_odd_home: true,
        game_odd_away: true,
      },
    }),
    client.kinoLadder.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game_odd_left: true,
        game_odd_right: true,
        game_odd_line3: true,
        game_odd_line4: true,
        game_odd_home: true,
        game_odd_away: true,
      },
    }),
    client.eosPowerball5.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_powerball: true,
      },
    }),
    client.eosPowerball4.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_powerball: true,
      },
    }),
    client.eosPowerball3.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_powerball: true,
      },
    }),
    client.eosPowerball2.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_powerball: true,
      },
    }),
    client.eosPowerball1.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,
        game1_odd_home: true,
        game1_odd_away: true,
        game1_odd_under: true,
        game1_odd_over: true,
        game2_odd_home: true,
        game2_odd_away: true,
        game2_odd_under: true,
        game2_odd_over: true,
        game3_odd_small: true,
        game3_odd_medium: true,
        game3_odd_large: true,
        game4_odd_powerball: true,
      },
    }),
    client.starLadder1.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game_odd_left: true,
        game_odd_right: true,
        game_odd_line3: true,
        game_odd_line4: true,
        game_odd_home: true,
        game_odd_away: true,
      },
    }),
    client.starLadder2.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game_odd_left: true,
        game_odd_right: true,
        game_odd_line3: true,
        game_odd_line4: true,
        game_odd_home: true,
        game_odd_away: true,
      },
    }),
    client.starLadder3.findFirst({
      where: {
        Playtime: {
          gte: new Date(),
        },
      },
      orderBy: {
        Playtime: "asc",
      },
      select: {
        id: true,
        round: true,
        Playtime: true,

        game_odd_left: true,
        game_odd_right: true,
        game_odd_line3: true,
        game_odd_line4: true,
        game_odd_home: true,
        game_odd_away: true,
      },
    }),
    client.bettinglist.findMany({
      where: {
        parisuserId: user?.id,
        betTime: {
          gte: new Date(+new Date() - 604800000),
          lte: new Date(),
        },
        gameCode: "미니게임",
        game_Event: type?.toString(),
        NOT: {
          userdelete: true,
        },
      },
      orderBy: {
        betTime: "desc",
      },
      take: 10,
      select: {
        betDetail: {
          select: {
            Pick: true,
            PickOdds: true,
            game_Event: true,
            game_Name: true,
            game_Type: true,
          },
        },
        id: true,
        betPrice: true,
        betTime: true,
        totalOdd: true,
        winPrice: true,
        payment: true,
        status: true,
      },
    }),
  ]);

  res.json({
    ok: true,
    powerball,
    powerladder,
    kinoladder,
    Eos5,
    Eos4,
    Eos3,
    Eos2,
    Eos1,
    starladder1,
    starladder2,
    starladder3,
    list,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
