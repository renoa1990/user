import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import numeral from "numeral";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  const userCheck = await client.parisuser.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      point: true,
      money: true,
      nickName: true,
      userId: true,
    },
  });

  if (userCheck?.point && userCheck.point !== 0) {
    const setup = await client.moneySetup.findFirst({
      select: {
        pointChange: true,
      },
    });

    if (setup && +userCheck.point >= setup?.pointChange) {
      const change = Boolean(
        await client.parisuser.update({
          where: {
            id: user?.id,
          },
          data: {
            money: +userCheck.money + +userCheck.point,
            moneyLog: {
              create: {
                type: "포인트 전환",
                memo: "",
                beforeMoney: userCheck.money,
                money: userCheck.point,
                afterMoney: +userCheck.money + +userCheck.point,
                confirmUser: `${userCheck.userId}(${userCheck.nickName})`,
              },
            },
            point: 0,
            pointLog: {
              create: {
                type: "포인트 전환",
                memo: "",
                beforePoint: userCheck.point,
                point: 0 - +userCheck.point,
                afterPoint: 0,
                confirmUser: `${userCheck.userId}(${userCheck.nickName})`,
              },
            },
          },
        })
      );
      res.json({
        ok: true,
        change,
      });
    } else {
      res.json({
        ok: true,
        notChange: {
          ok: true,
          message: `${numeral(setup?.pointChange).format(
            `0,0`
          )}부터 머니로 전환이 가능합니다`,
        },
      });
    }
  } else {
    res.json({
      ok: true,
      nothing: true,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
