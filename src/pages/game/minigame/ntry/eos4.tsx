import { withSsrSession } from "@libs/server/withSession";
import type { NextPage } from "next";
import Head from "next/head";
import { NextPageContext } from "next/types";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ClientLayout } from "@layouts/clientLayout";
import useSWR from "swr";
import client from "@libs/server/client";
import {
  levelsetup,
  minigameSetup,
  PowerballSetup,
  EosPowerball4,
  PowerladderSetup,
  kinoLadderSetup,
  EosPowerballSetup,
  StarladderSetup,
  BasicSetup,
} from "@prisma/client";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import MinigameLayoutNew from "@/layouts/minigameLayoutNew";
import PowerballPanel from "@/components/minigame/PowerballPanel";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  clearCart,
  updateCartList,
  updateCartSetup,
} from "src/redux/slices/cartSlice";
import type { cartState } from "src/types/cart";
import type { PowerballOdds } from "@/types/minigame";
import authGuard from "@libs/authGuard";
import MobileCartDock from "@/components/cart/mobile-cart-dock";

interface serverSideProps {
  levelSetup: levelsetup;
  gameSetup: {
    powerball: PowerballSetup;
    powerladder: PowerladderSetup;
    kinoladder: kinoLadderSetup;
    eos: EosPowerballSetup;
    starladder: StarladderSetup;
  };
  minigameSetup: minigameSetup;
  setActiveTab: Dispatch<SetStateAction<string>>;
  basicSetup: BasicSetup;
}
interface props {
  gameSetup: {
    powerball: PowerballSetup;
    powerladder: PowerladderSetup;
    kinoladder: kinoLadderSetup;
    eos: EosPowerballSetup;
    starladder: StarladderSetup;
  };
  lvsetup: levelsetup;
  game_Event: string;
  minigameSetup: minigameSetup;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  data?: SWR;
}
interface SWR {
  ok: boolean;
  Eos4: EosPowerball4;
  list: {
    betDetail: {
      game_Event: string;
      game_Name: string;
      game_Type: string;
      PickOdds: string | null;
      Pick: string;
    }[];
    id: number;
    betTime: Date;
    totalOdd: string;
    betPrice: number;
    winPrice: number;
    payment: number;
    status: string;
  }[];
}

const REVERSE_MAPPING: Record<string, string> = {
  powerball_oe_홀: "P_ODD",
  powerball_oe_짝: "P_EVEN",
  powerball_unover_언더: "P_UNDER",
  powerball_unover_오버: "P_OVER",
  ball_oe_홀: "N_ODD",
  ball_oe_짝: "N_EVEN",
  ball_unover_언더: "N_UNDER",
  ball_unover_오버: "N_OVER",
  ball_size_대: "N_BIG",
  ball_size_중: "N_MID",
  ball_size_소: "N_SMALL",
};

const Eos4: NextPage<props & { userMoney?: number; mutate?: () => void }> = ({
  gameSetup,
  lvsetup,
  minigameSetup,
  data,
  userMoney,
  mutate,
}) => {
  const dispatch = useDispatch();
  const cartList = useSelector((state: RootState) => state.cart.items);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isDisable, setIsDisable] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  useEffect(() => {
    dispatch(clearCart());
    dispatch(
      updateCartSetup({
        minBet: lvsetup?.minigame_minbet || "0",
        maxBet: lvsetup?.minigame_maxbet || "0",
        maxResult: lvsetup?.minigame_maxresult || "0",
      })
    );
  }, [dispatch, lvsetup]);

  useEffect(() => {
    if (!data?.Eos4) {
      setIsDisable(true);
      setTimeLeft({ minutes: 0, seconds: 0 });
      dispatch(clearCart());
      return;
    }

    const updateTimer = () => {
      const currentTime = new Date();
      const playTime = new Date(data.Eos4.Playtime);
      const setupTime = minigameSetup?.battingCtuSec
        ? +minigameSetup.battingCtuSec * 1000
        : 0;
      const timeDiff = +playTime - +currentTime - setupTime;

      if (timeDiff <= 0) {
        setIsDisable(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        setSelectedCode(null);
        dispatch(clearCart());
      } else {
        setIsDisable(false);
        const totalSeconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft({ minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data, minigameSetup, dispatch]);

  const odds: PowerballOdds = {
    pbPowerOddOdds: parseFloat(data?.Eos4?.game1_odd_home || "1.95"),
    pbPowerEvenOdds: parseFloat(data?.Eos4?.game1_odd_away || "1.95"),
    pbPowerUnderOdds: parseFloat(data?.Eos4?.game1_odd_under || "1.95"),
    pbPowerOverOdds: parseFloat(data?.Eos4?.game1_odd_over || "1.95"),
    pbNormalOddOdds: parseFloat(data?.Eos4?.game2_odd_home || "1.95"),
    pbNormalEvenOdds: parseFloat(data?.Eos4?.game2_odd_away || "1.95"),
    pbNormalUnderOdds: parseFloat(data?.Eos4?.game2_odd_under || "1.95"),
    pbNormalOverOdds: parseFloat(data?.Eos4?.game2_odd_over || "1.95"),
    pbNormalBigOdds: parseFloat(data?.Eos4?.game3_odd_large || "2.95"),
    pbNormalMidOdds: parseFloat(data?.Eos4?.game3_odd_medium || "2.95"),
    pbNormalSmallOdds: parseFloat(data?.Eos4?.game3_odd_small || "2.95"),
  };

  const codeMapping: Record<string, any> | null = !data?.Eos4
    ? null
    : {
        P_ODD: {
          gameType: "powerball_oe",
          pick: "홀",
          pickOdds: data.Eos4.game1_odd_home,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.Eos4.game1_odd_home,
          Odds_away: data.Eos4.game1_odd_away,
        },
        P_EVEN: {
          gameType: "powerball_oe",
          pick: "짝",
          pickOdds: data.Eos4.game1_odd_away,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.Eos4.game1_odd_home,
          Odds_away: data.Eos4.game1_odd_away,
        },
        P_UNDER: {
          gameType: "powerball_unover",
          pick: "언더",
          pickOdds: data.Eos4.game1_odd_under,
          team_home: "언더",
          team_away: "오버",
          Odds_home: data.Eos4.game1_odd_under,
          Odds_away: data.Eos4.game1_odd_over,
        },
        P_OVER: {
          gameType: "powerball_unover",
          pick: "오버",
          pickOdds: data.Eos4.game1_odd_over,
          team_home: "언더",
          team_away: "오버",
          Odds_home: data.Eos4.game1_odd_under,
          Odds_away: data.Eos4.game1_odd_over,
        },
        N_ODD: {
          gameType: "ball_oe",
          pick: "홀",
          pickOdds: data.Eos4.game2_odd_home,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.Eos4.game2_odd_home,
          Odds_away: data.Eos4.game2_odd_away,
        },
        N_EVEN: {
          gameType: "ball_oe",
          pick: "짝",
          pickOdds: data.Eos4.game2_odd_away,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.Eos4.game2_odd_home,
          Odds_away: data.Eos4.game2_odd_away,
        },
        N_UNDER: {
          gameType: "ball_unover",
          pick: "언더",
          pickOdds: data.Eos4.game2_odd_under,
          team_home: "언더",
          team_away: "오버",
          Odds_home: data.Eos4.game2_odd_under,
          Odds_away: data.Eos4.game2_odd_over,
        },
        N_OVER: {
          gameType: "ball_unover",
          pick: "오버",
          pickOdds: data.Eos4.game2_odd_over,
          team_home: "언더",
          team_away: "오버",
          Odds_home: data.Eos4.game2_odd_under,
          Odds_away: data.Eos4.game2_odd_over,
        },
        N_BIG: {
          gameType: "ball_size",
          pick: "대",
          pickOdds: data.Eos4.game3_odd_large,
          team_home: "소",
          team_tie: "중",
          team_away: "대",
          Odds_home: data.Eos4.game3_odd_small,
          Odds_tie: data.Eos4.game3_odd_medium,
          Odds_away: data.Eos4.game3_odd_large,
        },
        N_MID: {
          gameType: "ball_size",
          pick: "중",
          pickOdds: data.Eos4.game3_odd_medium,
          team_home: "소",
          team_tie: "중",
          team_away: "대",
          Odds_home: data.Eos4.game3_odd_small,
          Odds_tie: data.Eos4.game3_odd_medium,
          Odds_away: data.Eos4.game3_odd_large,
        },
        N_SMALL: {
          gameType: "ball_size",
          pick: "소",
          pickOdds: data.Eos4.game3_odd_small,
          team_home: "소",
          team_tie: "중",
          team_away: "대",
          Odds_home: data.Eos4.game3_odd_small,
          Odds_tie: data.Eos4.game3_odd_medium,
          Odds_away: data.Eos4.game3_odd_large,
        },
      };

  const handleSelect = (code: string | null) => {
    if (isDisable || !data?.Eos4 || !codeMapping) return;

    setSelectedCode(code);

    if (!code) {
      dispatch(clearCart());
      return;
    }

    const gameData = codeMapping[code];
    if (!gameData) return;

    const cartData: cartState = {
      id: data.Eos4.id,
      gameCode: "미니게임",
      game_Event: "eos파워볼 4분",
      game_Name: `${data.Eos4.round} 회차`,
      game_Type: gameData.gameType,
      pickOdds: gameData.pickOdds,
      pick: gameData.pick,
      game_Time: data.Eos4.Playtime,
      team_home: gameData.team_home,
      team_away: gameData.team_away,
      team_tie: gameData.team_tie,
      Odds_home: gameData.Odds_home,
      Odds_away: gameData.Odds_away,
      Odds_tie: gameData.Odds_tie,
    };

    if (
      cartList &&
      cartList.length > 0 &&
      cartList[0].game_Event === cartData.game_Event &&
      cartList[0].game_Type === cartData.game_Type &&
      cartList[0].pick === cartData.pick &&
      cartList[0].pickOdds === cartData.pickOdds
    ) {
      dispatch(clearCart());
      setSelectedCode(null);
    } else {
      dispatch(updateCartList([cartData]));
    }
  };

  useEffect(() => {
    if (cartList && cartList.length > 0) {
      const cart = cartList[0];
      const key = `${cart.game_Type}_${cart.pick}`;
      const code = REVERSE_MAPPING[key];
      if (code) setSelectedCode(code);
    } else {
      setSelectedCode(null);
    }
  }, [cartList]);

  return (
    <>
      <Head>
        <title>EOS파워볼 4분 - 미니게임</title>
      </Head>
      <main>
        <MinigameLayoutNew
          list={data?.list}
          src="https://ntry.com/scores/eos_powerball/live.php?game_type=4"
          title="EOS파워볼 4분"
          contentWidth={830}
          contentHeight={640}
          roundNo={data?.Eos4?.round}
          timeLeft={timeLeft}
          gameCode="미니게임"
          game_Event="eos파워볼 4분"
          userMoney={userMoney}
          mutate={mutate}
        >
          <PowerballPanel
            odds={odds}
            onSelect={handleSelect}
            powerThresholdText="4.5"
            normalThresholdText="72.5"
            selectedCode={selectedCode}
            disabled={!data?.Eos4 || isDisable}
          />
        </MinigameLayoutNew>
      </main>
    </>
  );
};

Eos4.displayName = "Eos4";

const Page: NextPage<serverSideProps> = (props) => {
  const { data, mutate } = useSWR<SWR>(
    `/api/minigame/timecounter/eos파워볼 4분`,
    {
      refreshInterval: 1000,
      dedupingInterval: 500,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );
  const userData = authGuard();

  useEffect(() => {
    if (props.basicSetup.minigameBlock) {
      alert("미니게임 점검으로 현재 이용이 불가능 합니다.");
      window.location.href = "/";
    }
  }, [props.basicSetup]);

  return (
    <ClientLayout>
      <ClientLoading loading={data ? false : true} />
      {!props.basicSetup.minigameBlock && (
        <>
          <Eos4
            gameSetup={props.gameSetup}
            lvsetup={props.levelSetup}
            minigameSetup={props.minigameSetup}
            activeTab="eos4"
            setActiveTab={() => {}}
            game_Event="eos파워볼 4분"
            data={data}
            userMoney={userData?.user?.money}
            mutate={mutate}
          />
          <MobileCartDock
            gameCode="미니게임"
            game_Event="eos파워볼 4분"
            userMoney={userData?.user?.money}
            mutate={mutate}
          />
        </>
      )}
    </ClientLayout>
  );
};

export default Page;
export const getServerSideProps = withSsrSession(async function ({
  req,
}: NextPageContext) {
  const ip =
    req?.headers["x-real-ip"] ||
    req?.headers["x-forwarded-for"] ||
    req?.connection.remoteAddress;
  const geo = await geoip.lookup(ip as string);

  if (!ip) {
    return { notFound: true };
  } else {
    const ipBlockCheck = await client.basicSetup.findFirst({
      select: {
        userIpBlock: true,
        serverDown: true,
        foreignBlock: true,
      },
    });
    if (!ipBlockCheck) return { notFound: true };
    if (ipBlockCheck?.serverDown) return { notFound: true };
    if (ipBlockCheck?.foreignBlock && geo?.country !== "KR")
      return { notFound: true };
    if (ipBlockCheck?.userIpBlock) {
      const ipCheck = await client.ipblock.findFirst({
        where: {
          ip: ip.toString(),
        },
      });

      if (ipCheck) {
        return { notFound: true };
      }
    }
  }
  const user = req?.session.user;
  if (!user)
    return {
      notFound: true,
    };
  req.session.save();

  const [minigameSetup, game, levelSetup, basicSetup] = await Promise.all([
    client.minigameSetup.findFirst({}),
    client.eosPowerballSetup.findFirst({}),
    client.levelsetup.findUnique({
      where: {
        lv: user?.lv,
      },
      select: {
        minigame_maxbet: true,
        minigame_maxresult: true,
        minigame_minbet: true,
      },
    }),
    client.basicSetup.findFirst({
      select: {
        minigameBlock: true,
      },
    }),

    await client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "EOS4분",
      },
    }),
  ]);

  if (!game?.Eos4Check) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      gameSetup: JSON.parse(JSON.stringify(game)),
      levelSetup: JSON.parse(JSON.stringify(levelSetup)),
      minigameSetup: JSON.parse(JSON.stringify(minigameSetup)),
      basicSetup: JSON.parse(JSON.stringify(basicSetup)),
    },
  };
});
