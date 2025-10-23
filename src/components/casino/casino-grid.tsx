import React, { FC } from "react";
import {
  Grid,
  Card,
  Typography,
  Box,
  alpha,
  styled,
  Chip,
} from "@mui/material";
import Image from "next/image";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarsIcon from "@mui/icons-material/Stars";
import CasinoIcon from "@mui/icons-material/Casino";

interface CasinoProvider {
  name: string;
  key: string;
  image: string;
  tag?: string;
}

// 11개 카지노 게임사 (샘플 데이터)
const CASINO_PROVIDERS: CasinoProvider[] = [
  {
    name: "에볼루션 카지노",
    key: "evolution",
    image: "/images/partners/logo-ev.png",
    tag: "인기",
  },
  {
    name: "프라그마틱 라이브",
    key: "pragmaticlive",
    image: "/images/partners/logo-pragmatic.png",
    tag: "추천",
  },
  {
    name: "마이크로게이밍",
    key: "microgaminglive",
    image: "/images/partners/logo-microgaming.png",
  },
  {
    name: "아시아게이밍",
    key: "asiagaming",
    image: "/images/partners/logo-ag.png",
  },
  {
    name: "플레이텍 라이브",
    key: "playtechlive",
    image: "/images/partners/logo-playtech.png",
  },
  {
    name: "올벳게이밍",
    key: "allbetgaming",
    image: "/images/partners/logo-oz.png",
  },
  {
    name: "원터치",
    key: "onetouch",
    image: "/images/partners/logo-onetouch.png",
  },
  {
    name: "비지게이밍",
    key: "biggaming",
    image: "/images/partners/logo-bg.png",
  },
  {
    name: "스카이윈드",
    key: "skywind",
    image: "/images/partners/logo-skywind_white.png",
  },
];

const CasinoCard = styled(Card)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    1
  )}, ${alpha(theme.palette.background.default, 0.8)})`,
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
    "& .play-overlay": {
      opacity: 1,
    },
    "& .casino-logo": {
      transform: "scale(1.05)",
    },
  },
}));

const PlayOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.85
  )}, ${alpha(theme.palette.secondary.main, 0.85)})`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
  zIndex: 2,
}));

const PlayButton = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: alpha(theme.palette.common.white, 0.98),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.4)}`,
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "scale(1.15)",
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 200,
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.background.paper,
    0.5
  )}, ${alpha(theme.palette.background.default, 0.5)})`,
  transition: "transform 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    minHeight: 150,
    padding: theme.spacing(3, 2),
  },
}));

const ProviderName = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: `linear-gradient(180deg, transparent 0%, ${alpha(
    theme.palette.common.black,
    0.7
  )} 100%)`,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

export const CasinoGrid: FC = () => {
  const handlePlay = (provider: CasinoProvider) => {
    // 샘플: 알림 메시지 표시
    alert(
      `${provider.name} 게임을 시작합니다.\n\n(API 연결 후 실제 게임이 실행됩니다)`
    );
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
      {CASINO_PROVIDERS.map((provider) => (
        <Grid item xs={6} sm={6} md={4} lg={3} key={provider.key}>
          <CasinoCard onClick={() => handlePlay(provider)}>
            {/* 태그 (인기/추천) */}
            {provider.tag && (
              <Box
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 3,
                }}
              >
                <Chip
                  label={provider.tag}
                  size="small"
                  icon={<CasinoIcon />}
                  sx={{
                    height: 28,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    bgcolor: (t) => alpha(t.palette.error.main, 0.9),
                    color: "white",
                    boxShadow: (t) =>
                      `0 2px 8px ${alpha(t.palette.common.black, 0.3)}`,
                    "& .MuiChip-icon": {
                      color: "white",
                    },
                  }}
                />
              </Box>
            )}

            {/* 로고 컨테이너 */}
            <LogoContainer>
              <Box
                className="casino-logo"
                sx={{
                  position: "relative",
                  width: "100%",
                  height: 120,
                  transition: "transform 0.3s ease",
                }}
              >
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                />
              </Box>
            </LogoContainer>

            {/* Play Overlay */}
            <PlayOverlay className="play-overlay">
              <PlayButton>
                <PlayArrowIcon
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                  }}
                />
              </PlayButton>
              <Typography
                variant="h6"
                fontWeight={700}
                color="white"
                mt={2}
                sx={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                게임 시작
              </Typography>
            </PlayOverlay>

            {/* 제공사 이름 */}
            <ProviderName>
              <Typography
                variant="body2"
                fontWeight={600}
                color="white"
                textAlign="center"
                sx={{
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {provider.name}
              </Typography>
            </ProviderName>
          </CasinoCard>
        </Grid>
      ))}
    </Grid>
  );
};
