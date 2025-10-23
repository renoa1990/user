import MinigameBettingListNew from "@/components/minigame/betting-list-new";
import GameVideo from "@/components/minigame/GameVideo";
import MinigameTabs from "@/components/tabs/minigameTabs";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import React, { FC, ReactNode } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import RightCartShell from "@/components/cart/right-cart-shell";
import Container from "@/components/Container";

interface MinigameLayoutProps {
  children?: ReactNode;
  src: string;
  title: string;
  contentWidth: number;
  contentHeight: number;
  roundNo?: number;
  timeLeft?: { minutes: number; seconds: number };
  list:
    | {
        betDetail: {
          game_Event: string;
          game_Name: string;
          game_Type: string;
          PickOdds: string | null;
          Pick: string;
        }[];
        id: number;
        betTime: Date;
        totalOdd: string;
        betPrice: number;
        winPrice: number;
        payment: number;
        status: string;
      }[]
    | undefined;
  // 카트 관련
  gameCode?: string;
  game_Event?: string;
  userMoney?: number;
  mutate?: () => void;
  bonus?: {
    bonus: string;
    count: number;
  } | null;
}

// 스타일드 컴포넌트들
const LayoutWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  justifyContent: "center",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    gap: 0,
  },
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  overflow: "visible",
  border: "none",
  boxShadow: "none",
  width: "100%",
  background: "transparent",
  [theme.breakpoints.up("md")]: {
    width: "calc(100% - 376px)",
    flex: "0 0 auto",
  },
}));

const GameInfoBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.05
  )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  marginBottom: 0,
  [theme.breakpoints.down("md")]: {
    borderRadius: 8,
    padding: theme.spacing(1.5),
    marginBottom: 0,
  },
}));

const TimerChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "1rem",
  height: 36,
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  "& .MuiChip-icon": {
    color: theme.palette.error.main,
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "0.875rem",
    height: 32,
  },
}));

const RoundChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.875rem",
  height: 32,
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  "& .MuiChip-icon": {
    color: theme.palette.primary.main,
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "0.75rem",
    height: 28,
  },
}));

const VideoContainer = styled(Paper)(({ theme }) => ({
  overflow: "hidden",
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
  marginBottom: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.down("md")]: {
    borderRadius: 0,
    border: "none",
    boxShadow: "none",
    marginBottom: theme.spacing(1),
  },
}));

const BettingSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
  width: "100%",
}));

export const MinigameLayoutNew: FC<MinigameLayoutProps> = (props) => {
  const {
    list,
    src,
    title,
    contentWidth,
    contentHeight,
    roundNo,
    timeLeft,
    children,
    gameCode,
    game_Event,
    userMoney,
    mutate,
    bonus,
  } = props;

  const theme = useTheme();

  return (
    <Container
      sx={{
        pt: 0,
        pb: 0,
        px: { xs: 0, sm: 3, md: 4 },
        maxWidth: { md: "1600px !important" },
      }}
    >
      <LayoutWrapper>
        <ContentPaper>
          {/* 탭 */}
          <MinigameTabs />

          {/* 컨텐츠 영역 */}
          <Box sx={{ pt: 0, px: { xs: 0, sm: 0 } }}>
            {/* 게임 정보 바 */}
            <GameInfoBar>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{ flex: 1 }}
              >
                <RoundChip
                  icon={<SportsEsportsIcon />}
                  label={`${roundNo || 0}회차`}
                  size="medium"
                />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: "1rem", md: "1.25rem" },
                    color: "primary.main",
                  }}
                >
                  {title}
                </Typography>
              </Stack>

              {/* 타이머 */}
              <TimerChip
                icon={<AccessTimeIcon />}
                label={`${String(timeLeft?.minutes || 0).padStart(
                  2,
                  "0"
                )}:${String(timeLeft?.seconds || 0).padStart(2, "0")}`}
              />
            </GameInfoBar>

            {/* 게임 비디오 */}
            <VideoContainer elevation={0}>
              <GameVideo
                src={src}
                title={title}
                contentWidth={contentWidth}
                contentHeight={contentHeight}
              />
            </VideoContainer>

            {/* 베팅 패널 */}
            <BettingSection>{children}</BettingSection>

            {/* 베팅 내역 */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 24,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                  }}
                />
                <Typography variant="h6" fontWeight={600}>
                  베팅 내역
                </Typography>
                <Chip
                  label="최근 10건"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 24,
                    fontSize: "0.75rem",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                />
              </Box>
              <MinigameBettingListNew list={list} />
            </Box>
          </Box>
        </ContentPaper>

        {/* 우측 카트 (데스크톱만) */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 360,
            flexShrink: 0,
            position: "sticky",
            top: 16,
            alignSelf: "flex-start",
          }}
        >
          <RightCartShell
            gameCode={gameCode}
            game_Event={game_Event}
            userMoney={userMoney}
            mutate={mutate}
            bonus={bonus}
          />
        </Box>
      </LayoutWrapper>
    </Container>
  );
};

MinigameLayoutNew.displayName = "MinigameLayoutNew";

export default MinigameLayoutNew;
