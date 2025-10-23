import type { NextPage } from "next";
import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import client from "@libs/server/client";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import { Money } from "@prisma/client";
import DepositPageNew from "@components/deposit/deposit-page-new";
import useSWR from "swr";

import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import { MoneyTabs } from "@/components/tabs/moneyTabs";
import Container from "@components/Container";

interface bonus {
  label: string;
  bonus: string;
  type: string;
}

interface swr {
  ok: boolean;
  list: Money[];
  bonusName: string;
  sportsBonus: number;
  casinoBonus: number;
  depositUnit: number;
  minDeposit: number;
}
interface deposit {
  ok: boolean;
  deposit: boolean;
  message?: string;
}

const Deposit: NextPage = () => {
  const { data, mutate } = useSWR<swr>(`/api/deposit/pageData`, {
    refreshInterval: 0,
  });

  return (
    <>
      <Head>
        <title>충전신청</title>
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
          <MoneyTabs />
          <DepositPageNew
            list={data?.list}
            bonusName={data?.bonusName}
            sportsBonus={data?.sportsBonus}
            casinoBonus={data?.casinoBonus}
            depositUnit={data?.depositUnit}
            minDeposit={data?.minDeposit}
            mutate={mutate}
          />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage = () => {
  return (
    <ClientLayout>
      <Deposit />
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

  await client.parisuser.update({
    where: {
      id: user?.id,
    },
    data: {
      lastPageAt: new Date(),
      lastPage: "충전신청",
    },
  });

  //셋업체크

  return {
    props: {},
  };
});
