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
  if (!user) return;
  const list = await client.money.findMany({
    where: {
      parisuserId: user?.id,
      type: "withdraw",
    },
    take: 10,
    orderBy: { id: "desc" },
    select: {
      id: true,
      Money: true,
      Point: true,
      confirm: true,
      updateAt: true,
      userDelete: true,
    },
  });

  let Rolling = {
    sportsRolling: 0,
    minigameRolling: 0,
    casinoRolling: 0,
    slotRolling: 0,
  };
  const lastDeposit = await client.money.findFirst({
    where: {
      type: "deposit",
      confirm: true,
    },
    orderBy: {
      createAt: "desc",
    },
  });
  if (lastDeposit?.createAt) {
    const betData = await client.bettinglist.findMany({
      where: {
        betTime: {
          gte: lastDeposit.createAt,
        },
      },
    });
    betData.map((i) => {
      const Money = lastDeposit.Money + lastDeposit.Point;
      switch (i.gameCode) {
        case "미니게임":
          Rolling.minigameRolling =
            Rolling.minigameRolling + Math.floor((i.betPrice / Money) * 100);

          break;
        case "스포츠":
          Rolling.sportsRolling =
            Rolling.sportsRolling + Math.floor((i.betPrice / Money) * 100);

          break;
        case "카지노":
          Rolling.casinoRolling =
            Rolling.casinoRolling + Math.floor((i.betPrice / Money) * 100);
          break;
        case "슬롯":
          Rolling.slotRolling =
            Rolling.slotRolling + Math.floor((i.betPrice / Money) * 100);
          break;
      }
    });
  }

  res.json({
    ok: true,
    list: list.filter((item) => item.userDelete !== true),
    Rolling,
  });
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
