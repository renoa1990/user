import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import { BettingQuery } from "@libs/bet-query-helper";
import type { cartState } from "src/types/cart";
import {
  SportsSetup,
  betDetail,
  bettinglist,
  levelsetup,
} from "@prisma/client";
import numeral from "numeral";

interface user {
  money: number;
  levelStup: levelsetup | null;
  id: number;
  userId: string;
  nickName: string;
  cross_1_block: boolean;
  cross_2_block: boolean;
  special_1_block: boolean;
  special_2_block: boolean;
  live_1_block: boolean;
  live_2_block: boolean;
  minigame_block: boolean;
}
interface detail extends betDetail {
  bettinglist: bettinglist;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      cartList,
      betPrice,
      winPrice,
      totalOdd,
      gameCode,
      game_Event,
      bonus,
    },
    session: { user },
  } = req;
  if (
    !user ||
    !cartList ||
    !betPrice ||
    !winPrice ||
    !totalOdd ||
    !gameCode ||
    !game_Event
  )
    return res.json({ ok: false });

  //유효성 검증

  const userData = await client.parisuser.findFirst({
    where: {
      id: user.id,
    },
    select: {
      money: true,
      levelStup: true,
      id: true,
      userId: true,
      nickName: true,
      cross_1_block: true,
      cross_2_block: true,
      special_1_block: true,
      special_2_block: true,
      live_1_block: true,
      live_2_block: true,
      minigame_block: true,
      blacklist: true,
      role: true,
      joinCode: true,
    },
  });

  if (!userData || !userData.levelStup) return res.json({ ok: false });
  let bettingDataFilter;

  let valid = undefined;
  switch (gameCode) {
    case "미니게임":
      if (userData.minigame_block) {
        return res.json({
          ok: true,
          message: "미니게임 배팅이 제한되었습니다.",
        });
      }

      valid = await minigameValid(userData, +betPrice, cartList, +winPrice);
      if (!valid) {
        bettingDataFilter = await minigameBettingVal(
          game_Event,
          cartList,
          +betPrice
        );
      } else {
        return res.json({ ok: true, message: valid.message });
      }
      break;
    case "스포츠":
      const sportsSetup = await client.sportsSetup.findFirst({});
      valid = await sportsValidate(
        userData,
        +betPrice,
        cartList,
        +winPrice,
        game_Event,
        sportsSetup,
        totalOdd
      );
      if (!valid) {
        bettingDataFilter = await sportsBettingVal(
          game_Event,
          cartList,
          +betPrice
        );
      } else {
        return res.json({
          ok: true,
          message: valid.message,
          changeItem: valid.changeItem,
        });
      }
      break;
  }

  if (bettingDataFilter?.message) {
    res.json({
      ok: true,
      message: bettingDataFilter?.message,
    });
  } else if (bettingDataFilter) {
    const game = BettingQuery({ cartList, gameCode, game_Event });
    const codeFilter = userData.joinCode ? { codeName: userData.joinCode } : {};

    const betting = Boolean(
      await client.parisuser.update({
        where: {
          id: user.id,
        },
        data:
          user.role !== "test"
            ? {
                money: { decrement: +betPrice },
                betTotal: { increment: +betPrice },
                lastBet: new Date(),
                betCount: { increment: 1 },
                bettinglist: {
                  create: {
                    ...codeFilter,
                    gameCode,
                    game_Event: game_Event,
                    totalOdd: totalOdd.toString(),
                    betPrice: +betPrice,
                    winPrice: +winPrice,
                    blackBetting: userData.blacklist,

                    betDetail: {
                      createMany: {
                        data: game.detail,
                      },
                    },
                  },
                },
                moneyLog: {
                  create: {
                    type: `${gameCode} 배팅`,
                    memo: game.memo,
                    beforeMoney: userData.money,
                    money: 0 - +betPrice,
                    afterMoney: userData.money - +betPrice,
                    confirmUser: `${userData.userId}(${userData.nickName})`,
                  },
                },
                bettingData: {
                  ...bettingDataFilter,
                },
              }
            : {
                bettinglist: {
                  create: {
                    gameCode,
                    game_Event: game_Event,
                    totalOdd: totalOdd.toString(),
                    betPrice: +betPrice,
                    winPrice: +winPrice,
                    blackBetting: userData.blacklist,
                    betDetail: {
                      createMany: {
                        data: game.detail,
                      },
                    },
                  },
                },
              },
      })
    );
    await req.session.save();

    res.json({
      ok: true,
      betting,
    });
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
const sportsValidate = async (
  userData: user,
  betPrice: number,
  cartList: cartState[],
  winPrice: number,
  game_Event: string,
  sportsSetup: SportsSetup | null,
  totalOdd: number
) => {
  if (!userData.levelStup) {
    return { message: "오류가 발생하였습니다", validate: true };
  }
  if (!sportsSetup) {
    return { message: "오류가 발생하였습니다", validate: true };
  }
  if (userData?.money < betPrice) {
    return { message: "보유머니가 부족합니다", validate: true };
  }
  if (!cartList || cartList.length < 1) {
    return {
      message: `배팅할 경기를 선택하세요.`,
      validate: true,
    };
  }
  if (
    cartList.length > +sportsSetup.combi_max ||
    cartList.reduce((sum, item) => sum * +item.pickOdds, 1) >
      +sportsSetup.combi_odds
  ) {
    return {
      message: `최대 ${sportsSetup.combi_max}게임, 최대 X${sportsSetup.combi_odds}배당 이상 선택할수 없습니다.`,
      validate: true,
    };
  }

  //조합 디테일 검사 //게임별 조합 설정
  if (cartList.length > 1) {
    for (let i = 0; i < cartList.length; i++) {
      for (let v = 0; v < cartList.length; v++) {
        if (
          i !== v &&
          cartList[i].game_Event === cartList[v].game_Event &&
          cartList[i].game_Time === cartList[v].game_Time &&
          cartList[i].game_Name === cartList[v].game_Name &&
          cartList[i].team_home === cartList[v].team_home &&
          cartList[i].team_away === cartList[v].team_away
        ) {
          if (cartList[i].game_Type === cartList[v].game_Type) {
            return {
              message: `같은 타입의 경기에 배팅할수없습니다.`,
              validate: true,
            };
          }
          if (cartList[i].game_Event === "soccer") {
            if (sportsSetup.soccer_combi_1) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: `축구 승무패 + 핸디캡은 배팅할수없습니다.`,
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.soccer_combi_2) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: `축구 승무패 + 언더오버는 배팅할수없습니다.`,
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.soccer_combi_3) {
              if (
                cartList[i].game_Type === "handicap" ||
                cartList[v].game_Type === "handicap"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: `축구 핸디캡 + 언더오버는 배팅할수없습니다.`,
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.soccer_combi_4) {
              if (cartList[i].pick === "tie" || cartList[v].pick === "tie") {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "축구 무 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.soccer_combi_5) {
              if (cartList[i].pick === "tie" || cartList[v].pick === "tie") {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: `축구 무 + 언더오버는 배팅할수없습니다.`,
                    validate: true,
                  };
                }
              }
            }
          } else if (cartList[i].game_Event === "basketball") {
            if (sportsSetup.basketball_combi_1) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "농구 승패 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.basketball_combi_2) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "농구 승패 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.basketball_combi_3) {
              if (
                cartList[i].game_Type === "handicap" ||
                cartList[v].game_Type === "handicap"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "농구 핸디캡 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
          } else if (cartList[i].game_Event === "baseball") {
            if (sportsSetup.baseball_combi_1) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "야구 승패 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.baseball_combi_2) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "야구 승패 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.baseball_combi_3) {
              if (
                cartList[i].game_Type === "handicap" ||
                cartList[v].game_Type === "handicap"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "야구 핸디캡 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
          } else if (cartList[i].game_Event === "volleyball") {
            if (sportsSetup.volleyball_combi_1) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "배구 승패 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.volleyball_combi_2) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "배구 승패 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.volleyball_combi_3) {
              if (
                cartList[i].game_Type === "handicap" ||
                cartList[v].game_Type === "handicap"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "배구 핸디캡 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
          } else {
            if (sportsSetup.other_combi_1) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "동일경기 승무패 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.other_combi_2) {
              if (
                cartList[i].game_Type === "match" ||
                cartList[v].game_Type === "match"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "동일경기 승무패 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.other_combi_3) {
              if (
                cartList[i].game_Type === "handicap" ||
                cartList[v].game_Type === "handicap"
              ) {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "동일경기 핸디캡 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.other_combi_4) {
              if (cartList[i].pick === "tie" || cartList[v].pick === "tie") {
                if (
                  cartList[i].game_Type === "handicap" ||
                  cartList[v].game_Type === "handicap"
                ) {
                  return {
                    message: "동일경기 무 + 핸디캡은 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
            if (sportsSetup.other_combi_5) {
              if (cartList[i].pick === "tie" || cartList[v].pick === "tie") {
                if (
                  cartList[i].game_Type === "unover" ||
                  cartList[v].game_Type === "unover"
                ) {
                  return {
                    message: "동일경기 승무패 + 오버언더는 배팅할수없습니다.",
                    validate: true,
                  };
                }
              }
            }
          }
        }
      }
    }
  }

  //최대배팅금액 / 최소배팅금액 / 최대당첨금 체크 // 단폴더체크
  if (game_Event === "크로스") {
    if (cartList.length > 1) {
      //다폴더
      if (userData.cross_2_block && cartList.length === 2) {
        return {
          message: `2폴더 배팅이 제한되었습니다. 3폴더 이상 선택하세요`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.cross_maxbet < betPrice) {
        return {
          message: `최대 배팅금액은 ${numeral(
            userData?.levelStup?.cross_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.cross_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.cross_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.cross_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.cross_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.cross_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.cross_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    } else {
      //단폴더인경우
      if (userData.cross_1_block) {
        return {
          message: `단폴더 배팅이 제한되었습니다.`,
          validate: true,
        };
      }

      if (!sportsSetup.single_cross) {
        return {
          message: `1게임 이상 선택하세요.`,
          validate: true,
        };
      }

      if (+userData?.levelStup?.cross_1_maxbet < betPrice) {
        return {
          message: `단폴더 배팅시 최대 배팅금액은 ${numeral(
            userData?.levelStup?.cross_1_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.cross_1_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.cross_1_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.cross_1_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.cross_1_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.cross_1_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.cross_1_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    }
  } else if (game_Event === "스페셜") {
    if (cartList.length > 1) {
      //다폴더
      if (userData.special_2_block && cartList.length === 2) {
        return {
          message: `2폴더 배팅이 제한되었습니다. 3폴더 이상 선택하세요`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_maxbet < betPrice) {
        return {
          message: `최대 배팅금액은 ${numeral(
            userData?.levelStup?.special_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.special_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.special_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.special_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.special_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    } else {
      //단폴더
      if (userData.special_1_block) {
        return {
          message: `단폴더 배팅이 제한되었습니다.`,
          validate: true,
        };
      }
      if (!sportsSetup.single_special) {
        return {
          message: `1게임 이상 선택하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_1_maxbet < betPrice) {
        return {
          message: `단폴더 배팅시 최대 배팅금액은 ${numeral(
            userData?.levelStup?.special_1_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.special_1_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_1_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.special_1_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.special_1_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.special_1_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.special_1_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    }
  } else if (game_Event === "라이브") {
    if (cartList.length > 1) {
      //다폴더
      if (userData.live_2_block && cartList.length === 2) {
        return {
          message: `2폴더 배팅이 제한되었습니다. 3폴더 이상 선택하세요`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_maxbet < betPrice) {
        return {
          message: `최대 배팅금액은 ${numeral(
            userData?.levelStup?.live_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.live_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.live_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.live_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.live_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    } else {
      //단폴더
      if (userData.live_1_block) {
        return {
          message: `단폴더 배팅이 제한되었습니다.`,
          validate: true,
        };
      }
      if (!sportsSetup.single_live) {
        return {
          message: `1게임 이상 선택하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_1_maxbet < betPrice) {
        return {
          message: `단폴더 배팅시 최대 배팅금액은 ${numeral(
            userData?.levelStup?.live_1_maxbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.live_1_maxbet
          ).format(`0,0`)}원 이하로 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_1_minbet > betPrice) {
        return {
          message: `최소 배팅금액은 ${numeral(
            userData?.levelStup?.live_1_minbet
          ).format(`0,0`)}원 입니다.  ${numeral(
            userData?.levelStup?.live_1_minbet
          ).format(`0,0`)}원 이상 배팅하세요.`,
          validate: true,
        };
      }
      if (+userData?.levelStup?.live_1_maxresult < winPrice) {
        return {
          message: `당첨금액은 최대 ${numeral(
            userData?.levelStup?.live_1_maxresult
          ).format(`0,0`)}원을 초과할수 없습니다.  `,
          validate: true,
        };
      }
    }
  } else {
    return {
      message: "오류발생-code1",
      validate: true,
    };
  }

  //배당 변경 체크  //odds 총합 체크, // 보너스 배당 부여
  if (game_Event === "크로스") {
    const ids = cartList?.map((item) => item.id as number);
    const changeGame: any = [];
    let validCheck = false;
    const checkCross = await client.cross.findMany({
      where: { id: { in: ids } },
    });
    let checkTotalOdds = 1;

    for (const itemA of cartList) {
      const itemB = checkCross.find((item) => item.id === itemA.id);
      if (
        itemB &&
        (itemA.Odds_home !== itemB.homeOdds.toString() ||
          itemA.Odds_away !== itemB.awayOdds.toString())
      ) {
        changeGame.push(itemB);
        return;
      }

      if (itemA.pick === "home") {
        if (itemA.pickOdds !== itemB?.homeOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.homeOdds;
        }
      }
      if (itemA.pick === "tie") {
        if (!itemB?.tieOdds) return;
        if (itemA.pickOdds !== itemB?.tieOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.tieOdds;
        }
      }
      if (itemA.pick === "away") {
        if (itemA.pickOdds !== itemB?.awayOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.awayOdds;
        }
      }
    }

    if (changeGame.length > 0) {
      return {
        message: `배당이 변경된 경기가 있습니다. 배팅카트를 확인해주세요`,
        validate: true,
        changeItem: changeGame,
      };
    }
    if (validCheck) {
      return {
        message: `변조된 배당율이 있습니다`,
        validate: true,
      };
    }
    if (sportsSetup && sportsSetup.cross_bonus_odds) {
      const bonusOdds = +(<any>sportsSetup)[`bonus_odds_${cartList.length}`];
      if (cartList.length <= 10 && bonusOdds > 1) {
        checkTotalOdds = +checkTotalOdds * +bonusOdds;
      }
    }
    checkTotalOdds = +checkTotalOdds.toFixed(2);

    if (checkTotalOdds !== totalOdd) {
      return {
        message: `변조된 배당율이 있습니다.`,
        validate: true,
      };
    }
  } else if (game_Event === "스페셜") {
    const ids = cartList?.map((item) => item.id as number);
    const changeGame: any = [];
    let validCheck = false;
    const checkCross = await client.special.findMany({
      where: { id: { in: ids } },
    });
    let checkTotalOdds = 1;

    for (const itemA of cartList) {
      const itemB = checkCross.find((item) => item.id === itemA.id);
      if (
        itemB &&
        (itemA.Odds_home !== itemB.homeOdds.toString() ||
          itemA.Odds_away !== itemB.awayOdds.toString())
      ) {
        changeGame.push(itemB);
        return;
      }

      if (itemA.pick === "home") {
        if (itemA.pickOdds !== itemB?.homeOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.homeOdds;
        }
      }
      if (itemA.pick === "tie") {
        if (!itemB?.tieOdds) return;
        if (itemA.pickOdds !== itemB?.tieOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.tieOdds;
        }
      }
      if (itemA.pick === "away") {
        if (itemA.pickOdds !== itemB?.awayOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.awayOdds;
        }
      }
    }

    if (changeGame.length > 0) {
      return {
        message: `배당이 변경된 경기가 있습니다. 배팅카트를 확인해주세요`,
        validate: true,
        changeItem: changeGame,
      };
    }
    if (validCheck) {
      return {
        message: `변조된 배당율이 있습니다`,
        validate: true,
      };
    }
    if (sportsSetup && sportsSetup.special_bonus_odds) {
      const bonusOdds = +(<any>sportsSetup)[`bonus_odds_${cartList.length}`];
      if (cartList.length <= 10 && bonusOdds > 1) {
        checkTotalOdds = +checkTotalOdds * +bonusOdds;
      }
    }
    checkTotalOdds = +checkTotalOdds.toFixed(2);

    if (checkTotalOdds !== totalOdd) {
      return {
        message: `변조된 배당율이 있습니다.`,
        validate: true,
      };
    }
  } else if (game_Event === "라이브") {
    const ids = cartList?.map((item) => item.id as number);
    const changeGame: any = [];
    let validCheck = false;
    const checkCross = await client.live.findMany({
      where: { id: { in: ids } },
    });
    let checkTotalOdds = 1;

    for (const itemA of cartList) {
      const itemB = checkCross.find((item) => item.id === itemA.id);
      if (
        itemB &&
        (itemA.Odds_home !== itemB.homeOdds.toString() ||
          itemA.Odds_away !== itemB.awayOdds.toString())
      ) {
        changeGame.push(itemB);
        return;
      }

      if (itemA.pick === "home") {
        if (itemA.pickOdds !== itemB?.homeOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.homeOdds;
        }
      }
      if (itemA.pick === "tie") {
        if (!itemB?.tieOdds) return;
        if (itemA.pickOdds !== itemB?.tieOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.tieOdds;
        }
      }
      if (itemA.pick === "away") {
        if (itemA.pickOdds !== itemB?.awayOdds.toString()) {
          validCheck = true;
          return;
        } else {
          checkTotalOdds = checkTotalOdds * +itemB?.awayOdds;
        }
      }
    }

    if (changeGame.length > 0) {
      return {
        message: `배당이 변경된 경기가 있습니다. 배팅카트를 확인해주세요`,
        validate: true,
        changeItem: changeGame,
      };
    }
    if (validCheck) {
      return {
        message: `변조된 배당율이 있습니다`,
        validate: true,
      };
    }
    if (sportsSetup && sportsSetup.cross_bonus_odds) {
      const bonusOdds = +(<any>sportsSetup)[`bonus_odds_${cartList.length}`];
      if (cartList.length <= 10 && bonusOdds > 1) {
        checkTotalOdds = +checkTotalOdds * +bonusOdds;
      }
    }
    checkTotalOdds = +checkTotalOdds.toFixed(2);

    if (checkTotalOdds !== totalOdd) {
      return {
        message: `변조된 배당율이 있습니다.`,
        validate: true,
      };
    }
  } else {
    return {
      message: "오류발생-code2",
      validate: true,
    };
  }

  //축배팅 검사
  if (game_Event === "크로스") {
    let validate = false;
    let message = "";
    const ids = cartList?.map((item) => item.id as number);
    const axisBetCheck = await client.betDetail.findMany({
      where: {
        bettinglist: {
          parisuserId: userData.id,
          NOT: {
            status: "cancle",
          },
        },
        crossId: { in: ids },
      },
      include: {
        bettinglist: true,
      },
    });

    const filteredData: Record<string, detail[]> = {};

    axisBetCheck.forEach((item) => {
      const key = `${item.game_Event}_${item.game_Name}_${item.game_Type}_${item.team_home}_${item.team_away}`;
      if (filteredData[key]) {
        filteredData[key].push(item);
      } else {
        filteredData[key] = [item];
      }
    });
    Object.values(filteredData).forEach((group) => {
      if (group.length > 0) {
        if (+sportsSetup.axisBet_count <= group.length) {
          message = `축배팅은 최대 ${sportsSetup.axisBet_count}회 가능합니다`;
          validate = true;
          return;
        } else {
          const totalWinPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.winPrice,
            +winPrice
          );
          const totalBetPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.betPrice,
            +betPrice
          );

          if (cartList.length > 1 && userData.levelStup) {
            //다폴
            if (totalWinPrice > +userData.levelStup?.cross_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.cross_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          } else if (userData.levelStup) {
            //단폴
            if (totalWinPrice > +userData.levelStup?.cross_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.cross_1_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          }
        }
      }
    });
    if (validate) {
      return {
        message,
        validate,
      };
    }
  } else if (game_Event === "스페셜") {
    let validate = false;
    let message = "";
    const ids = cartList?.map((item) => item.id as number);
    const axisBetCheck = await client.betDetail.findMany({
      where: {
        bettinglist: {
          parisuserId: userData.id,
          NOT: {
            status: "cancle",
          },
        },
        specialId: { in: ids },
      },
      include: {
        bettinglist: true,
      },
    });

    const filteredData: Record<string, detail[]> = {};

    axisBetCheck.forEach((item) => {
      const key = `${item.game_Event}_${item.game_Name}_${item.game_Type}_${item.team_home}_${item.team_away}`;
      if (filteredData[key]) {
        filteredData[key].push(item);
      } else {
        filteredData[key] = [item];
      }
    });
    Object.values(filteredData).forEach((group) => {
      if (group.length > 0) {
        if (+sportsSetup.axisBet_count <= group.length) {
          message = `축배팅은 최대 ${sportsSetup.axisBet_count}회 가능합니다`;
          validate = true;
          return;
        } else {
          const totalWinPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.winPrice,
            +winPrice
          );
          const totalBetPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.betPrice,
            +betPrice
          );

          if (cartList.length > 1 && userData.levelStup) {
            //다폴
            if (totalWinPrice > +userData.levelStup?.special_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.special_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          } else if (userData.levelStup) {
            //단폴
            if (totalWinPrice > +userData.levelStup?.special_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.special_1_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          }
        }
      }
    });
    if (validate) {
      return {
        message,
        validate,
      };
    }
  } else if (game_Event === "라이브") {
    let validate = false;
    let message = "";
    const ids = cartList?.map((item) => item.id as number);
    const axisBetCheck = await client.betDetail.findMany({
      where: {
        bettinglist: {
          parisuserId: userData.id,
          NOT: {
            status: "cancle",
          },
        },
        liveId: { in: ids },
      },
      include: {
        bettinglist: true,
      },
    });

    const filteredData: Record<string, detail[]> = {};

    axisBetCheck.forEach((item) => {
      const key = `${item.game_Event}_${item.game_Name}_${item.game_Type}_${item.team_home}_${item.team_away}`;
      if (filteredData[key]) {
        filteredData[key].push(item);
      } else {
        filteredData[key] = [item];
      }
    });
    Object.values(filteredData).forEach((group) => {
      if (group.length > 0) {
        if (+sportsSetup.axisBet_count <= group.length) {
          message = `축배팅은 최대 ${sportsSetup.axisBet_count}회 가능합니다`;
          validate = true;
          return;
        } else {
          const totalWinPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.winPrice,
            +winPrice
          );
          const totalBetPrice = group.reduce(
            (sum, item) => sum + item.bettinglist.betPrice,
            +betPrice
          );

          if (cartList.length > 1 && userData.levelStup) {
            //다폴
            if (totalWinPrice > +userData.levelStup?.cross_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.cross_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          } else if (userData.levelStup) {
            //단폴
            if (totalWinPrice > +userData.levelStup?.cross_axis_maxresult) {
              message = "최대당첨금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
            if (totalBetPrice > +userData.levelStup?.cross_1_maxbet) {
              message = "최대배팅금액을 초과한 게임이 있습니다";
              validate = true;
              return;
            }
          }
        }
      }
    });
    if (validate) {
      return {
        message,
        validate,
      };
    }
  } else {
    return {
      message: "오류발생-code3",
      validate: true,
    };
  }

  return undefined;
};
const sportsBettingVal = async (
  game_Event: string,
  cartList: cartState[],
  betPrice: number
) => {
  const gameTypeToFieldMap: { [key: string]: string } = {
    크로스: "cross",
    스페셜: "special",
    라이브: "live",
  };

  const fieldName = gameTypeToFieldMap[game_Event];
  if (fieldName) {
    const ids = cartList?.map((item) => item.id as number);
    const checkup = await (client as any)[fieldName].findMany({
      where: { id: { in: ids }, playTime: { lte: new Date() } },
    });

    if (checkup.length !== 0) {
      return { message: "이미 시작한 경기는 배팅할수 없습니다" };
    } else if (checkup.length === 0) {
      return {
        upsert: {
          create: {
            [`${fieldName}Bet`]: +betPrice,
            [`${fieldName}Count`]: 1,
            [`${fieldName}At`]: new Date(),
          },
          update: {
            [`${fieldName}Bet`]: { increment: +betPrice },
            [`${fieldName}Count`]: { increment: 1 },
            [`${fieldName}At`]: new Date(),
          },
        },
      };
    } else {
      return { message: "오류가 발생했습니다" };
    }
  }
};

const minigameValid = async (
  userData: user,
  betPrice: number,
  cartList: cartState[],
  winPrice: number
) => {
  if (!userData.levelStup)
    return { message: "오류가 발생하였습니다", validate: true };

  if (userData?.money < betPrice) {
    return { message: "보유머니가 부족합니다", validate: true };
  }
  if (cartList.length !== 1) {
    return {
      message: `미니게임은 1폴더만 배팅이 가능합니다.`,
      validate: true,
    };
  }
  if (+userData?.levelStup?.minigame_maxbet < betPrice) {
    return {
      message: `최대 배팅금액은 ${numeral(
        userData?.levelStup?.minigame_maxbet
      ).format("0,0")}원 입니다.  ${numeral(
        userData?.levelStup?.minigame_maxbet
      ).format("0,0")}원 이하로 배팅하세요.`,
      validate: true,
    };
  }

  if (+userData?.levelStup?.minigame_minbet > betPrice) {
    return {
      message: `최소 배팅금액은 ${numeral(
        userData?.levelStup?.minigame_minbet
      ).format("0,0")}원 입니다.  ${numeral(
        userData?.levelStup?.minigame_minbet
      ).format("0,0")}원 이상 배팅하세요.`,
      validate: true,
    };
  }

  //중복배팅 검사
  const duplicate = await client.betDetail.findMany({
    where: {
      game_Event: cartList[0].game_Event,
      game_Name: cartList[0].game_Name,
      game_Time: cartList[0].game_Time,
      bettinglist: {
        parisuserId: userData.id,
      },
    },
    include: {
      bettinglist: {
        select: {
          betPrice: true,
          winPrice: true,
        },
      },
    },
  });

  if (duplicate.length > 0) {
    const minigameSetup = await client.minigameSetup.findFirst({});
    let betTotal = betPrice;
    let winTotal = winPrice;
    let checkup = [];

    // duplicate.forEach((item) => {
    //   if (
    //     item.game_Type === cartList[0].game_Type &&
    //     item.Pick === cartList[0].pick
    //   ) {
    //   }
    // });

    const uniqueData: (betDetail & {
      bettinglist: { betPrice: number; winPrice: number };
    })[] = [];
    const uniqueSet = new Set();

    duplicate.forEach((item) => {
      const key = item.game_Type + "|" + item.Pick; // 중복 확인을 위한 키 생성
      if (!uniqueSet.has(key)) {
        uniqueData.push(item);
        uniqueSet.add(key);
      }
      betTotal = betTotal + item.bettinglist.betPrice;
      winTotal = winTotal + item.bettinglist.winPrice;
    });
    if (
      uniqueData.some(
        (item) =>
          item.game_Type === cartList[0].game_Type &&
          item.Pick === cartList[0].pick
      )
    ) {
      //같은거
      if (
        userData.levelStup &&
        winTotal > +userData.levelStup.minigame_maxresult
      ) {
        return {
          message: `같은회차 최대 당첨 가능 금액을 초과하였습니다.`,
          validate: true,
        };
      } else if (
        userData.levelStup &&
        betTotal > +userData.levelStup.minigame_maxbet
      ) {
        return {
          message: `같은회차 최대 배팅 가능 금액을 초과하였습니다.현재 회차 배팅 가능 금액은 ${numeral(
            +userData.levelStup.minigame_maxbet - betTotal + betPrice
          ).format("0,0")} 입니다`,
          validate: true,
        };
      }
    } else {
      //다른거
      if (
        userData.levelStup &&
        winTotal > +userData.levelStup.minigame_maxresult
      ) {
        return {
          message: `같은회차 최대 당첨 가능 금액을 초과하였습니다.`,
          validate: true,
        };
      } else if (
        userData.levelStup &&
        betTotal > +userData.levelStup.minigame_maxbet
      ) {
        return {
          message: `같은회차 최대 배팅 가능 금액을 초과하였습니다.현재 회차 배팅 가능 금액은 ${numeral(
            +userData.levelStup.minigame_maxbet - betTotal + betPrice
          ).format("0,0")} 입니다`,
          validate: true,
        };
      }
      if (
        minigameSetup?.anotherMinigameCheck &&
        minigameSetup.anotherMinigameNum
      ) {
        if (minigameSetup.anotherMinigameNum === "0") {
          //안되요 발생
          return {
            message: `같은회차 다른 경기에 배팅할수 없습니다.`,
            validate: true,
          };
        } else if (+minigameSetup.anotherMinigameNum < uniqueData.length) {
          const isDuplicate = uniqueData.some(
            (item) =>
              item.game_Type === cartList[0].game_Type &&
              item.Pick === cartList[0].pick
          );
          if (!isDuplicate) {
            return {
              message: `같은회차 ${minigameSetup.anotherMinigameNum}경기 이상 배팅할수 없습니다.`,
              validate: true,
            };
          } else {
          }
        }
      } else {
        //안되요 발생
        //이전에 배팅과 같은경우는 가능하게 수정
        return {
          message: `같은회차 다른 경기에 배팅할수 없습니다.`,
          validate: true,
        };
      }
    }
  }

  return undefined;
};

const minigameBettingVal = async (
  game_Event: string,
  cartList: cartState[],
  betPrice: number
) => {
  const gameTypeToFieldMap: { [key: string]: string } = {
    파워볼: "powerball",
    파워사다리: "powerLadder",
    키노사다리: "kinoLadder",
    "eos파워볼 5분": "EosPowerball5",
    "eos파워볼 4분": "EosPowerball4",
    "eos파워볼 3분": "EosPowerball3",
    "eos파워볼 2분": "EosPowerball2",
    "eos파워볼 1분": "EosPowerball1",
    "별다리 1분": "StarLadder1",
    "별다리 2분": "StarLadder2",
    "별다리 3분": "StarLadder3",
  };
  const betDataFieldMap: { [key: string]: string } = {
    파워볼: "powerball",
    파워사다리: "powerLadder",
    키노사다리: "kinoLadder",
    "eos파워볼 5분": "eos5",
    "eos파워볼 4분": "eos4",
    "eos파워볼 3분": "eos3",
    "eos파워볼 2분": "eos2",
    "eos파워볼 1분": "eos1",
    "별다리 1분": "starladder1",
    "별다리 2분": "starladder2",
    "별다리 3분": "starladder3",
  };
  const fieldName = gameTypeToFieldMap[game_Event];
  const betDataName = betDataFieldMap[game_Event];
  if (fieldName && betDataName) {
    const checkup = await (client as any)[fieldName].findFirst({
      where: { id: cartList[0].id, Playtime: { gte: new Date() } },
    });
    if (!checkup) {
      return { message: "이미 시작한 경기는 배팅할수 없습니다" };
    } else if (oddsCheckup(game_Event, cartList[0], checkup)) {
      return {
        upsert: {
          create: {
            [`${betDataName}Bet`]: +betPrice,
            [`${betDataName}Count`]: 1,
            [`${betDataName}At`]: new Date(),
          },
          update: {
            [`${betDataName}Bet`]: { increment: +betPrice },
            [`${betDataName}Count`]: { increment: 1 },
            [`${betDataName}At`]: new Date(),
          },
        },
      };
    } else {
      return { message: "오류가 발생했습니다" };
    }
  }
};
type GameValidations = {
  [key: string]: () => boolean;
};

const oddsCheckup = (
  gameName: keyof GameValidations,
  cartList: cartState,
  gameData: any
) => {
  const validations: GameValidations = {
    파워볼: () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "ball_mix":
          if (
            (cartList.pick === "홀+언더" &&
              cartList.pickOdds === gameData.game4_odd_home_under) ||
            (cartList.pick === "홀+오버" &&
              cartList.pickOdds === gameData.game4_odd_home_over) ||
            (cartList.pick === "짝+언더" &&
              cartList.pickOdds === gameData.game4_odd_away_under) ||
            (cartList.pick === "짝+오버" &&
              cartList.pickOdds === gameData.game4_odd_away_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_mix_size":
          if (
            (cartList.pick === "홀+소" &&
              cartList.pickOdds === gameData.game5_odd_home_small) ||
            (cartList.pick === "홀+중" &&
              cartList.pickOdds === gameData.game5_odd_home_medium) ||
            (cartList.pick === "홀+대" &&
              cartList.pickOdds === gameData.game5_odd_home_large) ||
            (cartList.pick === "짝+소" &&
              cartList.pickOdds === gameData.game5_odd_home_small) ||
            (cartList.pick === "짝+중" &&
              cartList.pickOdds === gameData.game5_odd_home_medium) ||
            (cartList.pick === "짝+대" &&
              cartList.pickOdds === gameData.game5_odd_home_large)
          ) {
            return true; // 정상
          }
          break;
        default:
          return false; // 오류
      }
      return false; // 오류
    },
    파워사다리: () => {
      switch (cartList.game_Type) {
        case "powerladder_rl":
          if (
            (cartList.pick === "좌" &&
              cartList.pickOdds === gameData.game_odd_left) ||
            (cartList.pick === "우" &&
              cartList.pickOdds === gameData.game_odd_right)
          ) {
            return true; // 정상
          }
          break;
        case "powerladder_line":
          if (
            (cartList.pick === "3줄" &&
              cartList.pickOdds === gameData.game_odd_line3) ||
            (cartList.pick === "4줄" &&
              cartList.pickOdds === gameData.game_odd_line4)
          ) {
            return true; // 정상
          }
          break;
        case "powerladder_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game_odd_away)
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    키노사다리: () => {
      switch (cartList.game_Type) {
        case "kinoladder_rl":
          if (
            (cartList.pick === "좌" &&
              cartList.pickOdds === gameData.game_odd_left) ||
            (cartList.pick === "우" &&
              cartList.pickOdds === gameData.game_odd_right)
          ) {
            return true; // 정상
          }
          break;
        case "kinoladder_line":
          if (
            (cartList.pick === "3줄" &&
              cartList.pickOdds === gameData.game_odd_line3) ||
            (cartList.pick === "4줄" &&
              cartList.pickOdds === gameData.game_odd_line4)
          ) {
            return true; // 정상
          }
          break;
        case "kinoladder_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game_odd_away)
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "eos파워볼 5분": () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "powerball":
          if (
            cartList.pickOdds === gameData.game4_odd_powerball &&
            (cartList.pick === "0" ||
              cartList.pick === "1" ||
              cartList.pick === "2" ||
              cartList.pick === "3" ||
              cartList.pick === "4" ||
              cartList.pick === "5" ||
              cartList.pick === "6" ||
              cartList.pick === "7" ||
              cartList.pick === "8" ||
              cartList.pick === "9")
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "eos파워볼 4분": () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "powerball":
          if (
            cartList.pickOdds === gameData.game4_odd_powerball &&
            (cartList.pick === "0" ||
              cartList.pick === "1" ||
              cartList.pick === "2" ||
              cartList.pick === "3" ||
              cartList.pick === "4" ||
              cartList.pick === "5" ||
              cartList.pick === "6" ||
              cartList.pick === "7" ||
              cartList.pick === "8" ||
              cartList.pick === "9")
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "eos파워볼 3분": () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "powerball":
          if (
            cartList.pickOdds === gameData.game4_odd_powerball &&
            (cartList.pick === "0" ||
              cartList.pick === "1" ||
              cartList.pick === "2" ||
              cartList.pick === "3" ||
              cartList.pick === "4" ||
              cartList.pick === "5" ||
              cartList.pick === "6" ||
              cartList.pick === "7" ||
              cartList.pick === "8" ||
              cartList.pick === "9")
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "eos파워볼 2분": () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "powerball":
          if (
            cartList.pickOdds === gameData.game4_odd_powerball &&
            (cartList.pick === "0" ||
              cartList.pick === "1" ||
              cartList.pick === "2" ||
              cartList.pick === "3" ||
              cartList.pick === "4" ||
              cartList.pick === "5" ||
              cartList.pick === "6" ||
              cartList.pick === "7" ||
              cartList.pick === "8" ||
              cartList.pick === "9")
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "eos파워볼 1분": () => {
      switch (cartList.game_Type) {
        case "powerball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game1_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game1_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "powerball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game1_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game1_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game2_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game2_odd_away)
          ) {
            return true; // 정상
          }
          break;
        case "ball_unover":
          if (
            (cartList.pick === "언더" &&
              cartList.pickOdds === gameData.game2_odd_under) ||
            (cartList.pick === "오버" &&
              cartList.pickOdds === gameData.game2_odd_over)
          ) {
            return true; // 정상
          }
          break;
        case "ball_size":
          if (
            (cartList.pick === "소" &&
              cartList.pickOdds === gameData.game3_odd_small) ||
            (cartList.pick === "중" &&
              cartList.pickOdds === gameData.game3_odd_medium) ||
            (cartList.pick === "대" &&
              cartList.pickOdds === gameData.game3_odd_large)
          ) {
            return true; // 정상
          }
          break;
        case "powerball":
          if (
            cartList.pickOdds === gameData.game4_odd_powerball &&
            (cartList.pick === "0" ||
              cartList.pick === "1" ||
              cartList.pick === "2" ||
              cartList.pick === "3" ||
              cartList.pick === "4" ||
              cartList.pick === "5" ||
              cartList.pick === "6" ||
              cartList.pick === "7" ||
              cartList.pick === "8" ||
              cartList.pick === "9")
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "별다리 1분": () => {
      switch (cartList.game_Type) {
        case "starladder_rl":
          if (
            (cartList.pick === "좌" &&
              cartList.pickOdds === gameData.game_odd_left) ||
            (cartList.pick === "우" &&
              cartList.pickOdds === gameData.game_odd_right)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_line":
          if (
            (cartList.pick === "3줄" &&
              cartList.pickOdds === gameData.game_odd_line3) ||
            (cartList.pick === "4줄" &&
              cartList.pickOdds === gameData.game_odd_line4)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game_odd_away)
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "별다리 2분": () => {
      switch (cartList.game_Type) {
        case "starladder_rl":
          if (
            (cartList.pick === "좌" &&
              cartList.pickOdds === gameData.game_odd_left) ||
            (cartList.pick === "우" &&
              cartList.pickOdds === gameData.game_odd_right)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_line":
          if (
            (cartList.pick === "3줄" &&
              cartList.pickOdds === gameData.game_odd_line3) ||
            (cartList.pick === "4줄" &&
              cartList.pickOdds === gameData.game_odd_line4)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game_odd_away)
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
    "별다리 3분": () => {
      switch (cartList.game_Type) {
        case "starladder_rl":
          if (
            (cartList.pick === "좌" &&
              cartList.pickOdds === gameData.game_odd_left) ||
            (cartList.pick === "우" &&
              cartList.pickOdds === gameData.game_odd_right)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_line":
          if (
            (cartList.pick === "3줄" &&
              cartList.pickOdds === gameData.game_odd_line3) ||
            (cartList.pick === "4줄" &&
              cartList.pickOdds === gameData.game_odd_line4)
          ) {
            return true; // 정상
          }
          break;
        case "starladder_oe":
          if (
            (cartList.pick === "홀" &&
              cartList.pickOdds === gameData.game_odd_home) ||
            (cartList.pick === "짝" &&
              cartList.pickOdds === gameData.game_odd_away)
          ) {
            return true; // 정상
          }
          break;

        default:
          return false; // 오류
      }
      return false; // 오류
    },
  };
  const validationFn = validations[gameName];
  if (validationFn) {
    return validationFn();
  } else {
    return false; // 오류
  }
};
