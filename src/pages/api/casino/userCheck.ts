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
    body: { item },
  } = req;

  if (!user) return;
  if (user.role !== "user") return;

  let BGUid = null;
  const userData = await client.parisuser.findFirst({
    where: {
      id: user?.id,
    },
    select: {
      id: true,
      money: true,
      BGid: true,
      casino_block: true,
      bettingDataId: true,
    },
  });
  if (userData?.casino_block) {
    //카지노 블럭인경우
    return res.json({
      ok: true,
      error: true,
      message: {
        title: "입장제한",
        message: "카지노를 이용할수 없는 유저입니다.",
      },
    });
  }
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  if (userData && !userData?.bettingDataId) {
    await client.parisuser.update({
      where: { id: +userData.id },
      data: {
        bettingData: {
          create: { casinoBet: 0 },
        },
      },
    });
  }

  if (userData?.BGid) {
    BGUid = userData.BGid;
  } else {
    const BG_User = await fetch(
      "https://api.timemoon-games.com/prod/api/v2/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.userId,
          store_key: process.env.BG_STOREKEY,
        }),
      }
    );
    const BGuserData = await BG_User.json();
    if (BGuserData.code === 0) {
      const userUpdate = await client.parisuser.update({
        where: {
          id: user.id,
        },
        data: {
          BGid: BGuserData.result.uid,
        },
        select: {
          BGid: true,
        },
      });
      BGUid = userUpdate.BGid;
    }
  }
  if (BGUid) {
    res.json({ ok: true });
  } else {
    return res.json({
      ok: true,
      error: true,
      message: {
        title: "오류발생",
        message: "오류가 발생했습니다",
      },
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
