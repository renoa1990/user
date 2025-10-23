import type { NextPage } from "next";
import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import Container from "@components/Container";
import { Box, Paper, styled } from "@mui/material";
import { useEffect } from "react";
import { BasicSetup } from "@prisma/client";
import geoip from "fast-geoip";
import CasinoTabs from "@components/tabs/casinoTabs";
import { CasinoGrid } from "@components/casino/casino-grid";

interface props {
  basicSetup: BasicSetup;
}

const ContentPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  overflow: "visible",
  border: "none",
  boxShadow: "none",
  width: "100%",
  background: "transparent",
}));

const Casino: NextPage = () => {
  return (
    <>
      <Head>
        <title>카지노</title>
      </Head>
      <main>
        <Container
          sx={{
            pt: 0,
            pb: 0,
            px: { xs: 0, sm: 3, md: 4 },
          }}
        >
          <ContentPaper>
            <CasinoTabs />
            <Box sx={{ pt: 2, px: { xs: 1.5, sm: 2, md: 3 }, pb: 3 }}>
              <CasinoGrid />
            </Box>
          </ContentPaper>
        </Container>
      </main>
    </>
  );
};

const Page: NextPage<props> = (props) => {
  useEffect(() => {
    if (props.basicSetup.casinoBlock) {
      alert("카지노 점검으로 현재 이용이 불가능 합니다.");
      window.location.href = "/";
    }
  }, [props.basicSetup]);

  return (
    <ClientLayout>{!props.basicSetup.casinoBlock && <Casino />}</ClientLayout>
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

  const [basicSetup] = await Promise.all([
    client.basicSetup.findFirst({
      select: {
        casinoBlock: true,
      },
    }),
    client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "카지노",
      },
    }),
  ]);

  return {
    props: { basicSetup: JSON.parse(JSON.stringify(basicSetup)) },
  };
});
