import type { NextPage } from "next";
import Head from "next/head";
import { Box } from "@mui/material";
import useSWR from "swr";
import {
  SportsSetup,
  betDetail,
  bettinglist,
  gameMemo,
  Team,
  league,
} from "@prisma/client";
import { useState } from "react";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import { ClientLayout } from "@layouts/clientLayout";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import Container from "@components/Container";
import BettingListPageNew from "@components/bettinglist/bettinglist-page-new";
interface details extends betDetail {
  away_TeamName: Team;
  home_TeamName: Team;
  leagueName: league;
  gameMemo: gameMemo;
}
interface detail extends bettinglist {
  betDetail: details[];
}

interface swr {
  ok: boolean;
  list: detail[];
  listcount: { _count: number };
}

interface props {
  setup: SportsSetup;
}

const BettingList: NextPage<props> = (props) => {
  const [page, setPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("전체");
  const rowPerPage = 10;

  const { data, mutate } = useSWR<swr>(
    `/api/betlist/${page}?rowPerPage=${rowPerPage}&gameCode=${activeTab}`,
    { refreshInterval: 0 }
  );
  const count = Math.ceil(
    data?.listcount?._count ? data?.listcount._count / rowPerPage : 1
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setPage(1); // 탭 변경 시 페이지를 1로 초기화
  };

  return (
    <>
      <Head>
        <title>배팅내역</title>
      </Head>
      <main>
        <ClientLoading loading={data ? false : true} />
        <Container
          sx={{
            pt: 0,
            pb: 2,
            px: { xs: 0, sm: 3, md: 4 },
          }}
        >
          <BettingListPageNew
            list={data?.list}
            page={page}
            count={count}
            handleChange={handlePageChange}
            mutate={mutate}
            setup={props.setup}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage<props> = (props) => {
  return (
    <ClientLayout>
      <BettingList {...props} />
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
  const [setup] = await Promise.all([
    await client.sportsSetup.findFirst({}),
    await client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "배팅내역",
      },
    }),
  ]);

  return { props: { setup: JSON.parse(JSON.stringify(setup)) } };
});
