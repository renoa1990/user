import type { NextPage } from "next";
import Head from "next/head";
import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import useSWR from "swr";
import { eventBoard } from "@prisma/client";
import { useRouter } from "next/router";
import Image from "next/image";
import { ClientLoading } from "@components/client-loading";
import { imageURL, imageURL2 } from "@libs/cfimageURL";
import EventDetailNew from "@components/eventboard/event-detail-new";
import geoip from "fast-geoip";
import BoardTabs from "@/components/tabs/contactTabs";

interface swr {
  ok: boolean;
  event: eventBoard;
}

const EventId: NextPage = () => {
  const router = useRouter();
  const id = router.query;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 화면인지 확인
  const { data } = useSWR<swr>(`/api/event/${router.query.id}`, {
    refreshInterval: 0,
  });

  return (
    <>
      <Head>
        <title>이벤트</title>
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
          <EventDetailNew event={data?.event} />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage = (props) => {
  return (
    <ClientLayout>
      <EventId />
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
      lastPage: `이벤트`,
    },
  });

  return { props: {} };
});
