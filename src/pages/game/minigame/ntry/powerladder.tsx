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
  powerLadder,
  PowerladderSetup,
  kinoLadderSetup,
  EosPowerballSetup,
  StarladderSetup,
  BasicSetup,
} from "@prisma/client";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import MinigameLayoutNew from "@/layouts/minigameLayoutNew";
import LadderPanel from "@/components/minigame/LadderPanel";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  clearCart,
  updateCartList,
  updateCartSetup,
} from "src/redux/slices/cartSlice";
import type { cartState } from "src/types/cart";
import type { LadderOdds } from "@/types/minigame";
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
  powerladder: powerLadder;
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

// 역매핑: game_Type_pick → code
const REVERSE_MAPPING: Record<string, string> = {
  powerladder_oe_홀: "ODD",
  powerladder_oe_짝: "EVEN",
  powerladder_rl_좌: "LEFT",
  powerladder_rl_우: "RIGHT",
  powerladder_line_3줄: "LINES3",
  powerladder_line_4줄: "LINES4",
};

const PowerladderPage: NextPage<
  props & { userMoney?: number; mutate?: () => void }
> = ({ gameSetup, lvsetup, minigameSetup, data, userMoney, mutate }) => {
  const dispatch = useDispatch();
  const cartList = useSelector((state: RootState) => state.cart.items);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isDisable, setIsDisable] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  // Redux 초기화
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

  // 타이머 계산
  useEffect(() => {
    if (!data?.powerladder) {
      setIsDisable(true);
      setTimeLeft({ minutes: 0, seconds: 0 });
      dispatch(clearCart());
      return;
    }

    const updateTimer = () => {
      const currentTime = new Date();
      const playTime = new Date(data.powerladder.Playtime);
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

  const odds: LadderOdds = {
    ldOddOdds: parseFloat(data?.powerladder?.game_odd_home || "1.95"),
    ldEvenOdds: parseFloat(data?.powerladder?.game_odd_away || "1.95"),
    ldLeftOdds: parseFloat(data?.powerladder?.game_odd_left || "1.95"),
    ldRightOdds: parseFloat(data?.powerladder?.game_odd_right || "1.95"),
    ld3LineOdds: parseFloat(data?.powerladder?.game_odd_line3 || "2.95"),
    ld4LineOdds: parseFloat(data?.powerladder?.game_odd_line4 || "2.95"),
    ldLeft3EvenOdds: 0,
    ldLeft4OddOdds: 0,
    ldRight3OddOdds: 0,
    ldLeft4EvenOdds: 0,
  };

  const codeMapping: Record<string, any> | null = !data?.powerladder
    ? null
    : {
        ODD: {
          gameType: "powerladder_oe",
          pick: "홀",
          pickOdds: data.powerladder.game_odd_home,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.powerladder.game_odd_home,
          Odds_away: data.powerladder.game_odd_away,
        },
        EVEN: {
          gameType: "powerladder_oe",
          pick: "짝",
          pickOdds: data.powerladder.game_odd_away,
          team_home: "홀",
          team_away: "짝",
          Odds_home: data.powerladder.game_odd_home,
          Odds_away: data.powerladder.game_odd_away,
        },
        LEFT: {
          gameType: "powerladder_rl",
          pick: "좌",
          pickOdds: data.powerladder.game_odd_left,
          team_home: "좌",
          team_away: "우",
          Odds_home: data.powerladder.game_odd_left,
          Odds_away: data.powerladder.game_odd_right,
        },
        RIGHT: {
          gameType: "powerladder_rl",
          pick: "우",
          pickOdds: data.powerladder.game_odd_right,
          team_home: "좌",
          team_away: "우",
          Odds_home: data.powerladder.game_odd_left,
          Odds_away: data.powerladder.game_odd_right,
        },
        LINES3: {
          gameType: "powerladder_line",
          pick: "3줄",
          pickOdds: data.powerladder.game_odd_line3,
          team_home: "3줄",
          team_away: "4줄",
          Odds_home: data.powerladder.game_odd_line3,
          Odds_away: data.powerladder.game_odd_line4,
        },
        LINES4: {
          gameType: "powerladder_line",
          pick: "4줄",
          pickOdds: data.powerladder.game_odd_line4,
          team_home: "3줄",
          team_away: "4줄",
          Odds_home: data.powerladder.game_odd_line3,
          Odds_away: data.powerladder.game_odd_line4,
        },
      };

  const handleSelect = (code: string | null) => {
    if (isDisable || !data?.powerladder || !codeMapping) return;

    setSelectedCode(code);

    if (!code) {
      dispatch(clearCart());
      return;
    }

    const gameData = codeMapping[code];
    if (!gameData) return;

    const cartData: cartState = {
      id: data.powerladder.id,
      gameCode: "미니게임",
      game_Event: "파워사다리",
      game_Name: `${data.powerladder.round} 회차`,
      game_Type: gameData.gameType,
      pickOdds: gameData.pickOdds,
      pick: gameData.pick,
      game_Time: data.powerladder.Playtime,
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
        <title>파워사다리 - 미니게임</title>
      </Head>
      <main>
        <MinigameLayoutNew
          list={data?.list}
          src="https://ntry.com/scores/power_ladder/live.php"
          title="파워사다리"
          contentWidth={830}
          contentHeight={640}
          roundNo={data?.powerladder?.round}
          timeLeft={timeLeft}
          gameCode="미니게임"
          game_Event="파워사다리"
          userMoney={userMoney}
          mutate={mutate}
        >
          <LadderPanel
            odds={odds}
            onSelect={handleSelect}
            selectedCode={selectedCode}
            disabled={!data?.powerladder || isDisable}
          />
        </MinigameLayoutNew>
      </main>
    </>
  );
};

PowerladderPage.displayName = "PowerladderPage";

const Page: NextPage<serverSideProps> = (props) => {
  const { data, mutate } = useSWR<SWR>(`/api/minigame/timecounter/파워사다리`, {
    refreshInterval: 1000,
    dedupingInterval: 500,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
  });
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
          <PowerladderPage
            gameSetup={props.gameSetup}
            lvsetup={props.levelSetup}
            minigameSetup={props.minigameSetup}
            activeTab="powerladder"
            setActiveTab={() => {}}
            game_Event="파워사다리"
            data={data}
            userMoney={userData?.user?.money}
            mutate={mutate}
          />
          <MobileCartDock
            gameCode="미니게임"
            game_Event="파워사다리"
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
    client.powerladderSetup.findFirst({}),
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
        lastPage: "파워사다리",
      },
    }),
  ]);

  if (!game?.powerladderCheck) {
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
