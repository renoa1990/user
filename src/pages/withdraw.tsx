import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import { NextPage } from "next";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import { withSsrSession } from "@libs/server/withSession";
import { Money, MoneySetup } from "@prisma/client";
import WithdrawPageNew from "@components/withdraw/withdraw-page-new";
import useSWR from "swr";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import { MoneyTabs } from "@/components/tabs/moneyTabs";
import Container from "@components/Container";

interface props {
  setup: MoneySetup;
  bank: string;
  money: number;
}
interface swr {
  ok: boolean;
  list: Money[];
  Rolling: {
    sportsRolling: number;
    minigameRolling: number;
    casinoRolling: number;
    slotRolling: number;
  };
}
interface mut {
  ok: boolean;
  withdraw: boolean;
  message?: string;
}
const WithDraw: NextPage<props> = (props) => {
  const { setup, bank, money } = props;
  const { data, mutate } = useSWR<swr>(`/api/withdraw/pageData`, {
    refreshInterval: 0,
  });
  return (
    <>
      <Head>
        <title>출금신청</title>
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
          <WithdrawPageNew
            setup={setup}
            bank={bank}
            money={money}
            list={data?.list}
            rolling={data?.Rolling}
            mutate={mutate}
          />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage<props> = (props) => {
  return (
    <ClientLayout>
      <WithDraw {...props} />
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

  let bank = "";

  if (!user)
    return {
      notFound: true,
    };
  req.session.save();
  const [userData, setup] = await Promise.all([
    client.parisuser.findFirst({
      where: {
        id: user?.id,
      },
      select: {
        bankName: true,
        name: true,
        bankNumber: true,
        money: true,
      },
    }),
    client.moneySetup.findFirst({
      select: {
        maxWithdraw: true,
        minWithdraw: true,
        withdrawTime: true,
        withdrawCheck: true,
        withdrawLimitCheck: true,
        withdrawLimitNum: true,
        withdrawLimitPrice: true,
      },
    }),
    client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "환전신청",
      },
    }),
  ]);

  if (userData?.bankNumber && userData?.name) {
    let buf0: any[] = [];
    let buf1: any[] = [];
    buf0 = [...(userData?.bankNumber as any)];
    buf1 = [...(userData?.name as any)];

    buf0 = buf0.map((char, index) => (index > 3 ? "*" : char));
    buf1 = buf1.map((char, index) => (index > 0 ? "*" : char));

    bank = `${userData?.bankName}  ${buf0.join("")}  ${buf1.join("")}`;
  }

  return {
    props: {
      setup: JSON.parse(JSON.stringify(setup)),
      bank: JSON.parse(JSON.stringify(bank)),
      money: JSON.parse(JSON.stringify(userData?.money)),
    },
  };
});
