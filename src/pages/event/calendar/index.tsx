import type { NextPage } from "next";
import Head from "next/head";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { ClientLayout } from "@layouts/clientLayout";
import Container from "@components/Container";
import {
  calendarEventData,
  eventCalendarSetup,
  eventPoint,
} from "@prisma/client";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import { CalendarEvent } from "@components/eventboard/calendar/calendar-event";
import { CalendarEventPointList } from "@components/eventboard/calendar/calendar-event-point-list";
import SpecialEventDetail from "@components/eventboard/special-event-detail";
import useSWR from "swr";
import { useState } from "react";
import { ClientLoading } from "@components/client-loading";
import geoip from "fast-geoip";
import BoardTabs from "@/components/tabs/contactTabs";

interface props {
  setupData: eventCalendarSetup;
}
interface swr {
  ok: boolean;
  eventPoint: eventPoint[];
  calendarDay: calendarEventData[];
}

const Calendar: NextPage<props> = (props) => {
  const { setupData } = props;
  const [month, setMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const theme = useTheme();
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
  };

  const { data, mutate } = useSWR<swr>(
    `/api/event/calendar/list/${month}?year=${year}`,
    {
      refreshInterval: 0,
    }
  );

  return (
    <>
      <Head>
        <title>출석부</title>
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
            title="출석체크 이벤트"
            type="calendar"
            url={setupData?.url}
            img={setupData?.img}
            contents={setupData?.contents}
          >
            <Box>
              {/* 달력 섹션 */}
              <Box sx={{ mb: 3 }}>
                <CalendarEvent
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                  month={month}
                  year={year}
                  calendarDay={data?.calendarDay}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* 이벤트 현황 */}
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    이벤트 현황
                  </Typography>
                </Box>
                <CalendarEventPointList
                  list={data?.eventPoint}
                  mutate={mutate}
                />
              </Box>
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
      <Calendar {...props} />
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
    client.eventCalendarSetup.findFirst({
      select: {
        calendarCheck: true,
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
        lastPage: "출석부",
      },
    }),
  ]);
  if (!setupData?.calendarCheck) return { notFound: true };
  return { props: { setupData: JSON.parse(JSON.stringify(setupData)) } };
});
