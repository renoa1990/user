import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Box, CircularProgress, Paper, styled, alpha } from "@mui/material";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import {
  SportsSetup,
  gameMemo,
  Team,
  league,
  levelsetup,
  BasicSetup,
} from "@prisma/client";
import { ClientLoading } from "@components/client-loading";
import { useDispatch } from "react-redux";
import { updateCartSetup } from "src/redux/slices/cartSlice";
import useSWR from "swr";
import { NewSportsTable } from "@components/sports/new-sports-table";
import { Decimal } from "@prisma/client/runtime/library";
import geoip from "fast-geoip";
import SportsTabs from "@components/tabs/sportsTabs";
import SportsSubTabs from "@components/tabs/sportsSubTabs";
import RightCartShell from "@components/cart/right-cart-shell";
import MobileCartDock from "@components/cart/mobile-cart-dock";
import authGuard from "@libs/authGuard";

const LayoutWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "center",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    gap: 0,
  },
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  overflow: "visible",
  border: "none",
  boxShadow: "none",
  width: "100%",
  background: "transparent",
  [theme.breakpoints.up("md")]: {
    width: "calc(100% - 376px)",
    flex: "0 0 auto",
  },
}));

interface serverSideProps {
  levelSetup: levelsetup;
  sportsSetup: SportsSetup;
  basicSetup: BasicSetup;
}
interface props {
  data?: swr;
  sportsSetup: SportsSetup;
  isLoadingMore?: boolean;
  bonus: {
    bonus: string;
    count: number;
  } | null;
  setBonus: Dispatch<
    SetStateAction<{
      bonus: string;
      count: number;
    } | null>
  >;
  userMoney?: number;
  mutate?: () => void;
}
interface swr {
  ok: boolean;
  list: sports[];
}
interface sports {
  id: number;
  parseId: number;
  game_Event: string;
  game_Type: string;
  game_Name: string;
  game_Memo: string;
  playTime: Date;
  homeTeam: Team;
  homeTeamId: number;
  homeOdds: Decimal;
  tieOdds: Decimal;
  awayTeam: Team;
  awayTeamId: number;
  awayOdds: Decimal;
  activate: boolean;
  score_Home: number;
  score_Away: number;
  result: string;
  result_exception: boolean;
  result_cancle: boolean;
  gameMemo: gameMemo;
  league: league;
  leagueId: number;
  tag?: boolean;
  handicap?: {
    id: number;
    parseId: number;
    game_Event: string;
    game_Type: string;
    game_Name: string;
    game_Memo: string;
    playTime: Date;
    homeTeam: Team;
    homeTeamId: number;
    homeOdds: Decimal;
    tieOdds: Decimal;
    awayTeam: Team;
    awayTeamId: number;
    awayOdds: Decimal;
    activate: boolean;
    score_Home: number;
    score_Away: number;
    result: string;
    result_exception: boolean;
    result_cancle: boolean;
    gameMemo: gameMemo;
    league: league;
    leagueId: number;
    tag?: boolean;
  }[];
}

const Cross: NextPage<props> = (props) => {
  const {
    data,
    sportsSetup,
    bonus,
    setBonus,
    isLoadingMore,
    userMoney,
    mutate,
  } = props;
  const [activeSubTab, setActiveSubTab] = useState("all");

  const handleSubTabChange = (newValue: string) => {
    setActiveSubTab(newValue);
  };

  return (
    <>
      <Head>
        <title>크로스</title>
      </Head>
      <main>
        <ClientLoading loading={data ? false : true} />
        <Container
          sx={{
            pb: 0,
            px: { xs: 0, sm: 2, md: 3 },
            maxWidth: { md: "1600px !important" },
          }}
        >
          <LayoutWrapper>
            <ContentPaper
              sx={{
                padding: 0,
              }}
            >
              <SportsTabs />
              <SportsSubTabs
                activeTab={activeSubTab}
                onTabChange={handleSubTabChange}
              />
              <NewSportsTable
                subTab={activeSubTab}
                mainTab="cross"
                list={data?.list}
                sportsSetup={sportsSetup}
                bonus={bonus}
                setBonus={setBonus}
              />
              {isLoadingMore && (
                <Box display={"flex"} justifyContent={"center"} width={"100%"}>
                  <CircularProgress color="primary" />
                </Box>
              )}
            </ContentPaper>

            {/* 우측 카트 (데스크톱만) */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                width: 360,
                flexShrink: 0,
                position: "sticky",
                top: 24,
                alignSelf: "flex-start",
              }}
            >
              <RightCartShell
                gameCode="스포츠"
                game_Event="크로스"
                userMoney={userMoney}
                mutate={mutate}
                bonus={bonus}
              />
            </Box>
          </LayoutWrapper>
        </Container>
      </main>
    </>
  );
};

const Page: NextPage<serverSideProps> = (props) => {
  const [bonus, setBonus] = useState<{ bonus: string; count: number } | null>(
    null
  );

  const dispatch = useDispatch();
  const userData = authGuard();

  const { data, mutate } = useSWR<swr>(`/api/sports/cross`, {
    refreshInterval: 0,
  });

  useEffect(() => {
    const newSetup = {
      minBet: props.levelSetup.cross_minbet,
      maxBet: props.levelSetup.cross_maxbet,
      maxResult: props.levelSetup.cross_maxresult,
      minBet_1: props.levelSetup.cross_1_minbet,
      maxBet_1: props.levelSetup.cross_1_maxbet,
      maxResult_1: props.levelSetup.cross_1_maxresult,
    };
    dispatch(updateCartSetup(newSetup));
  }, [props.levelSetup, dispatch]);

  useEffect(() => {
    if (props.basicSetup.sportsBlock) {
      alert("스포츠 점검으로 현재 이용이 불가능 합니다.");
      window.location.href = "/";
    }
  }, [props.basicSetup]);

  return (
    <ClientLayout
      gameCode={"스포츠"}
      game_Event="크로스"
      activeTab="cross"
      bonus={bonus}
      mutate={mutate}
    >
      {!props.basicSetup.sportsBlock && (
        <>
          <Cross
            sportsSetup={props.sportsSetup}
            bonus={bonus}
            data={data}
            setBonus={setBonus}
            userMoney={userData?.user?.money}
            mutate={mutate}
          />
          <MobileCartDock
            gameCode="스포츠"
            game_Event="크로스"
            userMoney={userData?.user?.money}
            mutate={mutate}
            bonus={bonus}
            autoOpen={false}
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
  if (!user) {
    // 세션이 없으면 로그인 페이지로 리다이렉트
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 사용자 정보를 데이터베이스에서 확인하여 세션 유효성 검증
  const userFromDB = await client.parisuser.findFirst({
    where: {
      id: user.id,
      OR: [{ role: "user" }, { role: "test" }],
      activate: "true",
    },
    select: {
      id: true,
      session: true,
      activate: true,
    },
  });

  // 사용자가 존재하지 않거나 비활성화된 경우
  if (!userFromDB) {
    req.session.destroy();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 세션 토큰이 일치하지 않는 경우 (중복 로그인 등)
  // 단, 세션이 비어있는 경우는 허용 (새로고침 등)
  if (userFromDB.session && userFromDB.session !== user.TTXD) {
    console.log("Session mismatch detected:", {
      dbSession: userFromDB.session,
      currentSession: user.TTXD,
    });
    req.session.destroy();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  req.session.save(); // 세션 갱신 (TTXD 보존됨)
  const [levelSetup, sportsSetup, basicSetup] = await Promise.all([
    client.levelsetup.findUnique({
      where: {
        lv: user?.lv,
      },
    }),
    client.sportsSetup.findFirst({}),
    client.basicSetup.findFirst({
      select: {
        sportsBlock: true,
      },
    }),

    await client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "크로스",
        // 세션 토큰이 비어있거나 현재 세션과 다른 경우에만 업데이트
        ...(userFromDB.session !== user?.TTXD && {
          session: user?.TTXD,
        }),
      },
    }),
  ]);

  return {
    props: {
      levelSetup: JSON.parse(JSON.stringify(levelSetup)),
      sportsSetup: JSON.parse(JSON.stringify(sportsSetup)),
      basicSetup: JSON.parse(JSON.stringify(basicSetup)),
    },
  };
});
