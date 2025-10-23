import type { NextPage } from "next";
import Head from "next/head";
import { Box, Paper, Typography } from "@mui/material";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import useSWR from "swr";
import {
  eventBoard,
  eventCalendarSetup,
  eventLoseAllSetup,
} from "@prisma/client";
import EventBoardListNew from "@components/eventboard/event-board-list-new";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import BoardTabs from "@/components/tabs/contactTabs";

interface swr {
  ok: boolean;
  eventBoard: eventBoard[];
  eventCalendar: eventCalendarSetup | null;
  eventLoseAllSetup: eventLoseAllSetup | null;
}

const Event: NextPage = () => {
  const { data } = useSWR<swr>("/api/event", {
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
          <EventBoardListNew
            eventCalendar={data?.eventCalendar}
            eventLoseAll={data?.eventLoseAllSetup}
            eventBoard={data?.eventBoard}
          />
        </Container>
      </main>
    </>
  );
};

const Page: NextPage = (props) => {
  return (
    <ClientLayout>
      <Event />
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
      lastPage: "이벤트",
    },
  });

  return { props: {} };
});
