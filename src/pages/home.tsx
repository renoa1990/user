import type { NextPage } from "next";
import Head from "next/head";
import { ClientLayout } from "@layouts/clientLayout";
import { withSsrSession } from "@libs/server/withSession";
import { NextPageContext } from "next/types";
import client from "@libs/server/client";
import { PopupBanner } from "@components/banner/popupbanner";
import { banner } from "@prisma/client";
import geoip from "fast-geoip";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";

type Feature = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
};

interface props {
  bannerData: banner[];
}
const FEATURES: Feature[] = [
  {
    title: "오늘의 경기",
    desc: "한판승부 제대로 붙어보자",
    icon: (
      <>
        <ShieldOutlinedIcon />
        <HandshakeOutlinedIcon
          sx={{ position: "absolute", right: 8, bottom: 12 }}
        />
      </>
    ),
    href: "/game/sports/cross",
  },
  {
    title: "경기결과",
    desc: "두근두근 내 게임의 결과는?",
    icon: (
      <>
        <ShieldOutlinedIcon />
        <TableChartOutlinedIcon
          sx={{ position: "absolute", right: 6, bottom: 8 }}
        />
      </>
    ),
    href: "/bettinglist",
  },
  {
    title: "공지사항",
    desc: "필독!! 공지를 꼭 확인하세요~",
    icon: <CampaignOutlinedIcon />,
    href: "/infomation",
  },
  {
    title: "문의하기",
    desc: "무엇을 도와드릴까요?",
    icon: <HeadsetMicOutlinedIcon />,
    href: "/contact",
  },
  {
    title: "충전",
    desc: "등급별 첫충,매충 보너스 지급",
    icon: <LocalAtmOutlinedIcon />,
    href: "/deposit",
  },
  {
    title: "환전",
    desc: "행운의 주인공은 바로 당신!",
    icon: <AccountBalanceWalletOutlinedIcon />,
    href: "/withdraw",
  },
];

const Home: NextPage<props> = (props) => {
  const { bannerData } = props;

  return (
    <>
      <Head>
        <title>홈</title>
      </Head>
      <main>
        <PopupBanner banner={bannerData} />

        <Box sx={{ pb: { xs: 6, md: 10 } }}>
          {/* ===== HERO ===== */}
          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              // ⬅︎ 모바일에서 높이 확 줄이고, 데스크탑은 기존 값 유지
              minHeight: { xs: 220, sm: 300, md: "clamp(380px, 55vh, 720px)" },
            }}
          >
            {/* 배경 이미지/비디오 자리 */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  // 필요 시 비디오로 교체
                  "url(/images/back-wide.jpg)", // 임시: 배경 이미지 경로
                backgroundSize: "cover",
                backgroundPosition: { xs: "center 32%", md: "center" },
                opacity: 0.55,
              }}
            />
            {/* 육각 패턴 느낌의 오버레이(간단 버전) */}

            <Container
              maxWidth="xl"
              sx={{
                position: "relative",
                zIndex: 1,
                minHeight: "inherit",
                display: "grid",
                gridTemplateColumns: { md: "1.2fr 1fr" },
                alignItems: "end",
                justifyItems: "start",
                gap: 4,
                // ⬅︎ 모바일 패딩도 더 얕게
                pt: { xs: 1, md: 3 },
                pb: { xs: 3, md: 8 },
              }}
            >
              {/* 좌측 브랜드/카피 */}
              <Box sx={{ maxWidth: 720, alignSelf: "end" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Image
                    src="/images/main_logo.png"
                    alt="GGBET"
                    width={160}
                    height={60}
                    style={{
                      width: "min(36vw, 180px)",
                      height: "auto",
                    }}
                    priority
                  />
                </Box>

                {/* 좌측 세로선 + 카피 */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      width: 6,
                      borderRadius: 1,
                      bgcolor: "primary.main",
                      flexShrink: 0,
                      alignSelf: "stretch",
                    }}
                  />
                  <Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      국내 업계 최대규모
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: 640 }}>
                      스포츠, 미니게임, 카지노, 바카라 등 믿을 수 있는 정품게임
                      정식 라이선스 제공! 최고의 만족도는 고객님들과의 소통에서
                      시작합니다. 지금 바로 이용해보세요~
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 우측 포스터/빈영역 */}
              <Box sx={{ display: { xs: "none", md: "block" } }} />
            </Container>
          </Box>

          {/* ===== FEATURE CARDS (6개) ===== */}
          <Container maxWidth="xl" sx={{ mt: 1 }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              {FEATURES.map((f) => (
                <Grid
                  item
                  xs={6}
                  sm={6}
                  md={2}
                  key={f.title}
                  component={Link}
                  href={f.href}
                  sx={{ textDecoration: "none" }}
                >
                  <Card
                    sx={(t) => ({
                      position: "relative",
                      height: { xs: 140, sm: 156, md: 164 },
                      borderRadius: 1,
                      // 스샷 느낌의 암회색 카드 + 아주 약한 테두리/인셋하이라이트
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
                      overflow: "hidden",
                      "&:hover": {
                        borderColor: "rgba(0,191,255,0.25)",
                        transform: "translateY(-2px)",
                        transition: "all .18s ease",
                      },
                    })}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 2.25 } }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, mb: 0.5, letterSpacing: -0.2 }}
                      >
                        {f.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {f.desc}
                      </Typography>
                    </CardContent>

                    {/* 우하단 그레이스케일 워터마크 아이콘 */}
                    <Box
                      sx={{
                        position: "absolute",
                        right: 10,
                        bottom: 6,
                        opacity: 0.28,
                        filter: "grayscale(100%)",
                        lineHeight: 0,
                        "& svg": { fontSize: 64 }, // 아이콘 기본 크기
                      }}
                    >
                      {f.icon}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </main>
    </>
  );
};

const Page: NextPage<props> = (props) => {
  return (
    <ClientLayout>
      <Home {...props} />
    </ClientLayout>
  );
};

export default Page;

export const getServerSideProps = withSsrSession(async function ({
  req,
}: NextPageContext) {
  const user = req?.session.user;
  if (!user) {
    // 세션이 없으면 로그인 페이지로 리다이렉트
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 사용자 정보를 데이터베이스에서 확인하여 세션 유효성 검증
  const userFromDB = await client.parisuser.findFirst({
    where: {
      id: user.id,
      OR: [{ role: "user" }, { role: "test" }],
      activate: "true",
    },
    select: {
      id: true,
      session: true,
      activate: true,
    },
  });

  // 사용자가 존재하지 않거나 비활성화된 경우
  if (!userFromDB) {
    req.session.destroy();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // 세션 토큰이 일치하지 않는 경우 (중복 로그인 등)
  // 단, 세션이 비어있는 경우는 허용 (새로고침 등)
  if (userFromDB.session && userFromDB.session !== user.TTXD) {
    console.log("Session mismatch detected:", {
      dbSession: userFromDB.session,
      currentSession: user.TTXD,
    });
    req.session.destroy();
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // IP 체크와 배너 데이터를 병렬로 처리
  const ip =
    req?.headers["x-real-ip"] ||
    req?.headers["x-forwarded-for"] ||
    req?.connection.remoteAddress;

  const currentDate = new Date();
  const threeDaysAgo = new Date(
    currentDate.getTime() - 3 * 24 * 60 * 60 * 1000
  );

  // 병렬 처리로 성능 향상
  const [ipBlockCheck, bannerData] = await Promise.all([
    ip
      ? client.basicSetup.findFirst({
          select: {
            userIpBlock: true,
            serverDown: true,
            foreignBlock: true,
          },
        })
      : null,
    client.banner.findMany({
      where: {
        live: true,
        OR: [
          {
            allTime: true,
          },
          {
            startAt: {
              lte: currentDate,
            },
            endAt: {
              gte: currentDate,
            },
          },
        ],
        NOT: {
          bannerOff: {
            some: {
              offAt: {
                gte: threeDaysAgo,
              },
              parisuserId: user?.id,
            },
          },
        },
      },
      orderBy: { number: "asc" },
      select: { url: true, id: true, name: true },
    }),
  ]);

  // IP 차단 체크
  if (ip && ipBlockCheck) {
    if (!ipBlockCheck) return { notFound: true };
    if (ipBlockCheck?.serverDown) return { notFound: true };

    if (ipBlockCheck?.foreignBlock) {
      const geo = await geoip.lookup(ip as string);
      if (geo?.country !== "KR") return { notFound: true };
    }

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

  // 사용자 정보 업데이트 및 세션 갱신 (홈 페이지에서만)
  await Promise.all([
    req.session.save(), // 세션 갱신 (홈 페이지에서만)
    client.parisuser.update({
      where: {
        id: user?.id,
      },
      data: {
        lastPageAt: new Date(),
        lastPage: "홈",
        // 세션 토큰이 비어있거나 현재 세션과 다른 경우에만 업데이트
        ...(userFromDB.session !== user?.TTXD && {
          session: user?.TTXD,
        }),
      },
    }),
  ]);

  return {
    props: { bannerData: JSON.parse(JSON.stringify(bannerData)) },
  };
});
