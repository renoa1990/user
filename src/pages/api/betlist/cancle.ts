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
    body: { id },
  } = req;
  const nowTime = new Date();
  const todaystart = new Date(nowTime.toLocaleDateString());

  const [data, todaycancle, setup] = await Promise.all([
    client.bettinglist.findFirst({
      where: { id: +id },
      include: {
        betDetail: true,
        parisuser: {
          select: {
            money: true,
          },
        },
      },
    }),
    client.bettinglist.findMany({
      where: {
        id: +id,
        status: "cancle",
        cancleUser: user?.userId,
        betTime: { lte: todaystart },
      },
    }),
    client.sportsSetup.findFirst({
      select: {
        cancle_count: true,
        cancle_min: true,
        cancle_PlayTime: true,
      },
    }),
  ]);

  if (data && setup) {
    const betDataFilter =
      data.game_Event === "크로스"
        ? {
            crossBet: { decrement: data.betPrice },
            crossCount: { decrement: 1 },
          }
        : data.game_Event === "스페셜"
        ? {
            specialBet: { decrement: data.betPrice },
            specialCount: { decrement: 1 },
          }
        : data.game_Event === "라이브"
        ? { liveBet: { decrement: data.betPrice }, liveCount: { decrement: 1 } }
        : {};

    if (
      data.betDetail.every(
        (timecheck) =>
          +nowTime <
          +new Date(timecheck?.game_Time) - +setup.cancle_PlayTime * 60000
      )
    ) {
      if (+setup.cancle_count <= todaycancle.length) {
        return res.json({
          ok: true,
          message: `하루 최대 ${+setup.cancle_count}회까지 취소가능합니다`,
        });
      } else if (+data.betTime + +setup.cancle_min * 60000 < +nowTime) {
        return res.json({
          ok: true,
          message: `배팅후 ${setup.cancle_min}분이 지난 배팅은 취소할수 없습니다 `,
        });
      } else {
        const cancleData = Boolean(
          await client.bettinglist.update({
            where: { id: id },
            data: {
              status: "cancle",
              parisuser: {
                update: {
                  bettingData: {
                    update: {
                      ...betDataFilter,
                    },
                  },
                  money: { increment: data.betPrice },
                  moneyLog: {
                    create: {
                      type: "배팅 취소",
                      memo: `${data.game_Event} ${data.betDetail.length}폴더 배팅취소`,
                      beforeMoney: data?.parisuser?.money,
                      money: data.betPrice,
                      afterMoney: data?.parisuser?.money + data.betPrice,
                      confirmUser: `${user?.id}(${user?.nickName})`,
                    },
                  },
                },
              },
              betDetail: {
                updateMany: {
                  where: {},
                  data: { status: "cancle" },
                },
              },
            },
          })
        );
        return res.json({ ok: true, data: cancleData });
      }
    } else {
      return res.json({
        ok: true,
        message: `경기시작  ${setup.cancle_PlayTime}전 경기가 포함된경우 배팅을 취소할수없습니다`,
      });
    }
  } else {
    return res.json({
      ok: false,
      message: `오류가 발생했습니다`,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
