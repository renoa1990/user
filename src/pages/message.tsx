import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import { NextPage } from "next";
import { message } from "@prisma/client";
import MessageInboxNew from "@components/message/message-inbox-new";
import client from "@libs/server/client";
import { NextPageContext } from "next/types";
import { withSsrSession } from "@libs/server/withSession";
import { useState } from "react";
import useSWR from "swr";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";

interface props {
  ok: boolean;
  list: message[];
  listcount: { _count: number };
}
const Message: NextPage = () => {
  const [page, setPage] = useState<number>(1);
  const rowPerPage = 10;
  const { data, mutate } = useSWR<props>(
    `/api/message/${page}?rowPerPage=${rowPerPage}`,
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
        <title>쪽지함</title>
      </Head>
      <main>
        <ClientLoading loading={data ? false : true} />
        <Container
          maxWidth="lg"
          sx={{
            pt: 0,
            pb: 2,
            px: { xs: 0, sm: 3, md: 4 },
            maxWidth: "1000px",
          }}
        >
          <MessageInboxNew
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
      <Message />
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
