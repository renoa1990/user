import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import { NextPage } from "next";
import { infomation } from "@prisma/client";
import client from "@libs/server/client";
import InfomationNew from "@components/infomation/infomation-new";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import { useState } from "react";
import useSWR from "swr";
import geoip from "fast-geoip";
import { ClientLoading } from "@/components/client-loading";
import BoardTabs from "@/components/tabs/contactTabs";

interface props {
  ok: boolean;
  list: infomation[];
  listcount: { _count: number };
  adminName: string;
}

const Infomation: NextPage = () => {
  const [page, setPage] = useState<number>(1);
  const rowPerPage = 10;
  const { data, mutate } = useSWR<props>(
    `/api/infomation/${page}?rowPerPage=${rowPerPage}`,
    {
      refreshInterval: 0,
    }
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
  return (
    <>
      <Head>
        <title>공지사항</title>
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
          <BoardTabs />
          <InfomationNew
            adminName={data?.adminName}
            list={data?.list}
            listcount={data?.listcount}
            count={count}
            mutate={mutate}
            page={page}
            handleChange={handlePageChange}
            rowPerPage={rowPerPage}
          />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage = () => {
  return (
    <ClientLayout>
      <Infomation />
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
      lastPage: "쪽지",
    },
  });

  return {
    props: {},
  };
});
