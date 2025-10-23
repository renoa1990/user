import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import { NextPage } from "next";
import ContactWriteNew from "@components/contact/contact-write-new";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import geoip from "fast-geoip";
import BoardTabs from "@/components/tabs/contactTabs";

const Write: NextPage = () => {
  return (
    <>
      <Head>
        <title>문의하기</title>
      </Head>
      <main>
        <Container
          sx={{
            pt: 0,
            pb: 2,
            px: { xs: 0, sm: 3, md: 4 },
          }}
        >
          <BoardTabs />
          <ContactWriteNew />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage = () => {
  return (
    <ClientLayout>
      <Write />
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
      lastPage: "문의글 작성",
    },
  });

  return {
    props: {},
  };
});
