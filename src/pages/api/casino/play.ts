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
    body: { item, gameKey },
  } = req;

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
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //접속 문제있는경우 활성화
  // const vandors = await fetch(
  //   "https://api.timemoon-games.com/prod/api/v2/vendors",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       vendorKey: item.key,
  //       store_key: process.env.BG_STOREKEY,
  //       module: item.module,
  //     }),
  //   }
  // );
  // const vandor2 = await vandors.json();
  // console.log(vandor2.result.vendors["13"]);

  const resGame = await fetch(
    "https://api.timemoon-games.com/prod/api/v2/games",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendorKey: item.key,
        store_key: process.env.BG_STOREKEY,
        module: item.module,
      }),
    }
  );
  const gamelist = await resGame.json();
  if (gamelist.code === 0) {
    const resUrl = await fetch(
      "https://api.timemoon-games.com/prod/api/v2/play",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userData?.userId,
          vendorKey: item.key,
          gameKey: gameKey ? gameKey : "evolution_all_games",
          store_key: process.env.BG_STOREKEY,
          module: item.module,
        }),
      }
    );
    const Url = await resUrl.json();
    if (Url.result.url) {
      return res.json({ ok: true, url: Url.result.url });
    } else {
      console.log("오류발생 고객센터로 문의하세요");
      return res.json({ ok: false });
    }
  } else {
    //게임 실행 실패
    console.log("게임 실행 실패");
    return res.json({ ok: false });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
