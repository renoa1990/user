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
  const userBonus = [];
  const startDate = new Date(new Date().toLocaleDateString());
  const endDate = new Date(+startDate + 86399999);

  //첫충 셋업 체크
  const [list, setup, joinbonusCheck] = await Promise.all([
    client.money.findMany({
      where: {
        parisuserId: user?.id,
        type: "deposit",
        userDelete: false,
      },
      take: 10,
      orderBy: { id: "desc" },
      select: {
        id: true,
        Money: true,
        Point: true,
        confirm: true,
        updateAt: true,
        pointType: true,
        userDelete: true,
      },
    }),
    client.moneySetup.findFirst({
      select: {
        bonusSetup: true,
        depositUnit: true,
        minDeposit: true,
      },
    }),
    client.parisuser.findFirst({
      where: {
        id: user?.id,
      },
      select: {
        joinCode: true,
        depositCount: true,
        Money: {
          where: {
            OR: [
              {
                type: "withdraw",
                confirm: true,
                createAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                type: "deposit",
                confirm: true,
                createAt: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
        },
        levelStup: {
          select: {
            joinBonus: true,
            firstBonus: true,
            everythingBonus: true,
            casinoEverythingBonus: true,
            casinoFirstBonus: true,
            casinoJoinBonus: true,
          },
        },
        Code: {
          select: {
            bonusActivate: true,
            joinBonus: true,
            firstBonus: true,
            everythingBonus: true,
            casinoJoinBonus: true,
            casinoEverythingBonus: true,
            casinoFirstBonus: true,
          },
        },
      },
    }),
  ]);

  if (
    setup?.bonusSetup &&
    joinbonusCheck?.Money.some((item) => item.type === "withdraw")
  ) {
    //당일 환전보너스 체크 && 당일 환전 있는경우
    return res.json({
      ok: true,
      list,
      bonusName: "",
      sportsBonus: 0,
      casinoBonus: 0,
      depositUnit: setup ? setup.depositUnit : 0,
      minDeposit: setup ? setup.minDeposit : 0,
    });
  }

  if (joinbonusCheck?.depositCount === 0) {
    //가입 첫충전 지급
    if (joinbonusCheck?.Code?.bonusActivate) {
      //코드 가입첫충
      return res.json({
        ok: true,
        list,
        bonusName: "가입첫충",
        sportsBonus: joinbonusCheck?.Code.joinBonus
          ? joinbonusCheck?.Code.joinBonus
          : 0,
        casinoBonus: joinbonusCheck?.Code.casinoJoinBonus
          ? joinbonusCheck?.Code.casinoJoinBonus
          : 0,
      });
    } else {
      //코어 가입첫충
      return res.json({
        ok: true,
        list,
        bonusName: "가입첫충",
        sportsBonus: joinbonusCheck?.levelStup.joinBonus
          ? joinbonusCheck?.levelStup.joinBonus
          : 0,
        casinoBonus: joinbonusCheck?.levelStup.casinoJoinBonus
          ? joinbonusCheck?.levelStup.casinoJoinBonus
          : 0,
        depositUnit: setup ? setup.depositUnit : 0,
        minDeposit: setup ? setup.minDeposit : 0,
      });
    }
  }

  if (!joinbonusCheck?.Money.some((item) => item.type === "deposit")) {
    //첫충
    if (joinbonusCheck?.Code?.bonusActivate) {
      //코드 첫충
      return res.json({
        ok: true,
        list,
        bonusName: "첫충",
        sportsBonus: joinbonusCheck?.Code.firstBonus
          ? joinbonusCheck?.Code.firstBonus
          : 0,
        casinoBonus: joinbonusCheck?.Code.casinoFirstBonus
          ? joinbonusCheck?.Code.casinoFirstBonus
          : 0,
      });
    } else {
      //코어 첫충
      return res.json({
        ok: true,
        list,
        bonusName: "첫충",
        sportsBonus: joinbonusCheck?.levelStup.firstBonus
          ? joinbonusCheck?.levelStup.firstBonus
          : 0,
        casinoBonus: joinbonusCheck?.levelStup.casinoFirstBonus
          ? joinbonusCheck?.levelStup.casinoFirstBonus
          : 0,
        depositUnit: setup ? setup.depositUnit : 0,
        minDeposit: setup ? setup.minDeposit : 0,
      });
    }
  }

  if (joinbonusCheck?.Money.some((item) => item.type === "deposit")) {
    //매충
    if (joinbonusCheck?.Code?.bonusActivate) {
      //코드 매충
      return res.json({
        ok: true,
        list,
        bonusName: "매충",
        sportsBonus: joinbonusCheck?.Code.everythingBonus
          ? joinbonusCheck?.Code.everythingBonus
          : 0,
        casinoBonus: joinbonusCheck?.Code.casinoEverythingBonus
          ? joinbonusCheck?.Code.casinoEverythingBonus
          : 0,
        depositUnit: setup ? setup.depositUnit : 0,
        minDeposit: setup ? setup.minDeposit : 0,
      });
    } else {
      //코어 매충
      return res.json({
        ok: true,
        list,
        bonusName: "매충",
        sportsBonus: joinbonusCheck?.levelStup.everythingBonus
          ? joinbonusCheck?.levelStup.everythingBonus
          : 0,
        casinoBonus: joinbonusCheck?.levelStup.casinoEverythingBonus
          ? joinbonusCheck?.levelStup.casinoEverythingBonus
          : 0,
        depositUnit: setup ? setup.depositUnit : 0,
        minDeposit: setup ? setup.minDeposit : 0,
      });
    }
  }
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
