import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { amount, selectBonus },
    session: { user },
  } = req;

  if (!selectBonus) {
    return res.json({ ok: true, message: "이용하실 게임을 선택해주세요." });
  }

  if (user?.role === "test") {
    return res.json({
      ok: true,
      message: "테스트 회원은 이용이 불가능합니다.",
    });
  }

  const startDate = new Date(new Date().toLocaleDateString());
  const endDate = new Date(+startDate + 86399999);

  if (!amount || amount < 0) {
    return res.json({ ok: true, message: "충전하실 금액을 입력해주세요" });
  }

  const [check, setup] = await Promise.all([
    client.money.findFirst({
      where: {
        parisuserId: user?.id,
        confirm: null,
        type: "deposit",
      },
    }),
    client.moneySetup.findFirst({
      select: {
        minDeposit: true,
        depositUnit: true,
        bonusSetup: true,
        pointLimit: true,
        MaxPoint: true,
      },
    }),
  ]);

  if (check) {
    res.json({ ok: true, message: "처리되지 않은 신청이 있습니다." });
    return;
  }

  if (setup && setup.minDeposit > amount) {
    res.json({
      ok: true,
      message: `${setup.minDeposit}원 이상부터 충전이 가능합니다`,
    });
    return;
  }

  if (setup && amount % setup.depositUnit !== 0) {
    return res.json({
      ok: true,
      message: `${setup.depositUnit}원 이상부터 충전이 가능합니다`,
    });
  }

  const userData = await client.parisuser.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      money: true,
      point: true,
      name: true,
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
  });
  let bonusFilter = {
    Point: 0,
    pointType: "",
  };

  //name 체크
  if (
    setup?.bonusSetup &&
    userData?.Money.some((item) => item.type === "withdraw") &&
    selectBonus.bonus !== 0
  ) {
    return res.json({
      ok: true,
      message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
    });
  }
  if (
    selectBonus.name === "가입첫충" &&
    userData?.depositCount &&
    userData?.depositCount > 0
  ) {
    return res.json({
      ok: true,
      message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
    });
  }
  if (
    selectBonus.name === "첫충" &&
    userData?.Money.some((item) => item.type === "deposit")
  ) {
    return res.json({
      ok: true,
      message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
    });
  }
  if (
    selectBonus.name === "매충" &&
    !userData?.Money.some((item) => item.type === "deposit")
  ) {
    return res.json({
      ok: true,
      message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
    });
  }

  if (selectBonus.type === "스포츠") {
    if (selectBonus.name === "가입첫충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.joinBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      } else {
        if (userData?.levelStup.joinBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      }
    }
    if (selectBonus.name === "첫충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.firstBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      } else {
        if (userData?.levelStup.firstBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      }
    }
    if (selectBonus.name === "매충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.everythingBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      } else {
        if (userData?.levelStup.everythingBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      }
    }
  }
  if (selectBonus.type === "카지노") {
    if (selectBonus.name === "가입첫충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.casinoJoinBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      } else {
        if (userData?.levelStup.casinoJoinBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      }
    }
    if (selectBonus.name === "첫충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.casinoFirstBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      } else {
        if (userData?.levelStup.casinoFirstBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요`,
          });
        }
      }
    }
    if (selectBonus.name === "매충") {
      if (userData?.Code?.bonusActivate) {
        if (userData.Code.casinoEverythingBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요?`,
          });
        }
      } else {
        if (userData?.levelStup.casinoEverythingBonus !== selectBonus.bonus) {
          return res.json({
            ok: true,
            message: `오류가 발생했습니다. 새로고침후 다시 신청해주세요?`,
          });
        }
      }
    }
  }
  if (selectBonus.bonus) {
    if (
      setup?.pointLimit &&
      +amount * (0.01 * +selectBonus.bonus) > setup.MaxPoint
    ) {
      bonusFilter = {
        Point: +setup.MaxPoint,
        pointType: `${selectBonus.type} ${selectBonus.name}(${selectBonus.bonus}%)`,
      };
    } else {
      bonusFilter = {
        Point: +amount * (0.01 * +selectBonus.bonus),
        pointType: `${selectBonus.type} ${selectBonus.name}(${selectBonus.bonus}%)`,
      };
    }
  }

  if (userData) {
    const codeFilter = userData.joinCode
      ? {
          Code: {
            connect: {
              code: userData.joinCode,
            },
          },
        }
      : {};

    const deposit = Boolean(
      await client.money.create({
        data: {
          ...bonusFilter,
          ...codeFilter,
          Money: amount,
          type: "deposit",
          userMoney: +userData.money,
          userPoint: +userData.point,
          name: userData.name,
          Parisuser: {
            connect: {
              id: user?.id,
            },
          },
        },
      })
    );
    res.json({
      ok: true,
      deposit,
    });
    return;
  } else {
    res.json({
      ok: true,
      message: "오류가 발생했습니다",
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
