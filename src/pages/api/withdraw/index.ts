import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import numeral from "numeral";
import moment from "moment";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { amount, password },
    session: { user },
  } = req;
  if (user?.role === "test") {
    res.json({ ok: true, message: "테스트 회원은 이용이 불가능합니다." });
    return;
  }
  if (!amount) {
    res.json({ ok: true, message: "출금하실 금액을 입력해주세요" });
    return;
  }
  if (amount % 10000 !== 0) {
    res.json({
      ok: true,
      message: `만원 단위로 출금이 가능합니다`,
    });
    return;
  }
  if (!user) return;
  if (!password) {
    res.json({
      ok: true,
      message: `출금 비밀번호를 입력하세요`,
    });
    return;
  }

  const startDate = new Date(new Date().toLocaleDateString());
  const endDate = new Date(+startDate + 86399999);

  const [userData, setupData, check] = await Promise.all([
    client.parisuser.findFirst({
      where: {
        id: user?.id,
      },
      select: {
        levelStup: true,
        money: true,
        point: true,
        name: true,
        bankName: true,
        bankNumber: true,
        bankPassword: true,
        joinCode: true,
        Money: {
          where: {
            type: "withdraw",
            confirm: true,
            createAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            createAt: "desc",
          },
        },
      },
    }),
    client.moneySetup.findFirst({
      select: {
        minWithdraw: true, //최소 환전금액
        maxWithdraw: true, //최대 환전금액
        withdrawCheck: true, //환전제한시간
        withdrawLimitCheck: true, //환전제한 on off
        withdrawLimitNum: true, //최대환전횟수
        withdrawLimitPrice: true, //최대환전금액
        withdrawTime: true, //환전제한시간
      },
    }),
    client.money.findFirst({
      where: {
        parisuserId: user?.id,
        confirm: null,
        type: "withdraw",
      },
    }),
  ]);
  if (!userData || !setupData) {
    res.json({
      ok: false,
    });
    return;
  }
  if (check) {
    res.json({ ok: true, message: "처리되지 않은 신청이 있습니다." });
    return;
  }
  if (userData?.money < amount) {
    res.json({
      ok: true,
      message: "보유금액보다 더 많은 금액을 출금할수 없습니다",
    });
    return;
  }
  if (setupData?.minWithdraw > amount) {
    res.json({
      ok: true,
      message: `${numeral(
        setupData?.minWithdraw
      )}원 이상부터 출금신청이 가능합니다`,
    });
    return;
  }
  if (setupData?.maxWithdraw < amount) {
    res.json({
      ok: true,
      message: `1회 최대 ${numeral(setupData?.maxWithdraw).format(
        "0,0"
      )}원 까지 출금신청이 가능합니다`,
    });
    return;
  }

  if (setupData?.withdrawLimitCheck) {
    const sumMoney = userData?.Money.reduce(
      (sum, transaction) => sum + transaction.Money,
      0
    );
    if (userData?.Money.length >= setupData.withdrawLimitNum) {
      res.json({
        ok: true,
        message: `1일 최대 환전횟수 ${setupData.withdrawLimitNum}회 이상 출금할수 없습니다`,
      });
      return;
    }
    if (sumMoney + amount > setupData.withdrawLimitPrice) {
      res.json({
        ok: true,
        message: `1일 최대 출금한도(${numeral(
          setupData.withdrawLimitPrice
        ).format("0,0")})를 초과할수 없습니다.(현재 출금 가능금액 :${numeral(
          setupData.withdrawLimitPrice - sumMoney
        ).format(`0,0`)})`,
      });
      return;
    }
  }
  if (userData.bankPassword !== password) {
    res.json({
      ok: true,
      message: `출금 비밀번호를 확인하세요`,
    });
    return;
  }
  if (setupData?.withdrawCheck) {
    const lastWithdraw = await client.money.findFirst({
      where: {
        parisuserId: user.id,
        type: "withdraw",
        confirm: true,
      },
      select: {
        updateAt: true,
      },
      orderBy: { updateAt: "desc" },
    });
    ///테스트 필요
    if (lastWithdraw?.updateAt) {
      const now = new Date();
      const timeDifferenceInMilliseconds = +now - +lastWithdraw.updateAt;
      const millisecondsInThreeHours =
        +setupData?.withdrawTime * 60 * 60 * 1000;

      if (timeDifferenceInMilliseconds <= millisecondsInThreeHours) {
        res.json({
          ok: true,
          message: `마지막 출금시간부터 ${
            setupData?.withdrawTime
          }시간 후 환전이 가능합니다,${moment(
            +lastWithdraw.updateAt + millisecondsInThreeHours
          ).format("HH:mm")} 부터 출금이 가능합니다`,
        });
        return;
      }
    }
  }
  let Rolling = { sportsRolling: 0, minigameRolling: 0, casinoRolling: 0 };
  const lastDeposit = await client.money.findFirst({
    where: {
      parisuserId: user.id,
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
        parisuserId: user.id,
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
            Rolling.minigameRolling + (i.betPrice / Money) * 100;
          break;
        case "스포츠":
          Rolling.sportsRolling =
            Rolling.sportsRolling + (i.betPrice / Money) * 100;
          break;
        case "카지노":
          Rolling.casinoRolling =
            Rolling.casinoRolling + (i.betPrice / Money) * 100;
          break;
      }
    });
  }
  const codeFilter = userData.joinCode
    ? {
        Code: {
          connect: {
            code: userData.joinCode,
          },
        },
      }
    : {};

  const withdraw = Boolean(
    await client.parisuser.update({
      where: {
        id: user.id,
      },
      data: {
        money: {
          decrement: +amount,
        },
        Money: {
          create: {
            ...codeFilter,
            Money: +amount,
            type: "withdraw",
            userMoney: userData?.money,
            userPoint: userData?.point,
            Point: 0,
            name: userData?.name,
            bankName: userData?.bankName,
            bankNumber: userData?.bankNumber,
            lastDeposit: lastDeposit?.Money,
            lastBonus: lastDeposit?.Point,
            lastBonusType: lastDeposit?.pointType,
            sportsRolling: Math.floor(Rolling.sportsRolling),
            minigameRolling: Math.floor(Rolling.minigameRolling),
            casinoRolling: Math.floor(Rolling.casinoRolling),
          },
        },
      },
    })
  );
  res.json({
    ok: true,
    withdraw,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
