import type { NextPage } from "next";
import Head from "next/head";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import { eventLoseAllSetup, eventPoint } from "@prisma/client";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import { CalendarEventPointList } from "@components/eventboard/calendar/calendar-event-point-list";
import SpecialEventDetail from "@components/eventboard/special-event-detail";
import useSWR from "swr";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import BoardTabs from "@/components/tabs/contactTabs";

interface props {
  setupData: eventLoseAllSetup;
}
interface swr {
  ok: boolean;
  eventPoint: eventPoint[];
}

const LoseAll: NextPage<props> = (props) => {
  const { setupData } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 화면인지 확인

  const { data, mutate } = useSWR<swr>(`/api/event/loseall/list`, {
    refreshInterval: 0,
  });

  return (
    <>
      <Head>
        <title>올미당첨 이벤트</title>
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
          <SpecialEventDetail
            title="올미당첨 이벤트"
            type="loseAll"
            url={setupData?.url}
            img={setupData?.img}
            contents={setupData?.contents}
          >
            <Box>
              {/* 이벤트 현황 */}
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    bgcolor: "secondary.main",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  이벤트 현황
                </Typography>
              </Box>
              <CalendarEventPointList list={data?.eventPoint} mutate={mutate} />
            </Box>
          </SpecialEventDetail>
        </Container>
      </main>
    </>
  );
};

const Page: NextPage<props> = (props) => {
  return (
    <ClientLayout>
      <LoseAll {...props} />
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
  const [setupData] = await Promise.all([
    client.eventLoseAllSetup.findFirst({
      select: {
        LoseAllCheck: true,
        url: true,
        contents: true,
        img: true,
      },
    }),
    await client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "올미당첨이벤트",
      },
    }),
  ]);
  if (!setupData?.LoseAllCheck) return { notFound: true };
  return { props: { setupData: JSON.parse(JSON.stringify(setupData)) } };
});
