import React, { FC, memo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  alpha,
  styled,
  useTheme,
  Grid,
} from "@mui/material";
import {
  CheckCircleOutlined,
  CancelOutlined,
  HourglassEmptyOutlined,
  AccessTimeOutlined,
  SportsEsportsOutlined,
} from "@mui/icons-material";
import moment from "moment";
import numeral from "numeral";
import chengeTitle from "@libs/changeTitle";

interface Props {
  list?: {
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
  }[];
}

// 스타일드 컴포넌트들
const BettingCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
  marginBottom: theme.spacing(3),
  transition: "all 0.2s ease-in-out",
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
  "&:hover": {
    boxShadow: `0 6px 16px ${alpha(theme.palette.common.black, 0.2)}`,
    transform: "translateY(-2px)",
  },
  "&.win": {
    borderColor: alpha(theme.palette.success.main, 0.6),
    backgroundColor: alpha(theme.palette.success.main, 0.05),
  },
  "&.lose": {
    borderColor: alpha(theme.palette.error.main, 0.5),
    backgroundColor: alpha(theme.palette.error.main, 0.03),
    opacity: 0.8,
  },
  "&.cancle": {
    borderColor: alpha(theme.palette.grey[500], 0.5),
    backgroundColor: alpha(theme.palette.grey[500], 0.03),
    opacity: 0.7,
  },
  "&.wait": {
    borderColor: alpha(theme.palette.warning.main, 0.5),
    backgroundColor: alpha(theme.palette.warning.main, 0.03),
  },
}));

const StatusChip = styled(Chip)<{ status: "win" | "lose" | "cancle" | "wait" }>(
  ({ theme, status }) => ({
    height: 32,
    fontSize: "0.9rem",
    fontWeight: 600,
    borderRadius: 8,
    ...(status === "win" && {
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
    }),
    ...(status === "lose" && {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
      border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
    }),
    ...(status === "cancle" && {
      backgroundColor: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[600],
      border: `1px solid ${alpha(theme.palette.grey[500], 0.3)}`,
    }),
    ...(status === "wait" && {
      backgroundColor: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
    }),
  })
);

const BetDetailChip = styled(Chip)(({ theme }) => ({
  height: 28,
  fontSize: "0.85rem",
  borderRadius: 6,
  fontWeight: 600,
}));

export const MinigameBettingListNew: FC<Props> = memo(
  ({ list }) => {
    const theme = useTheme();

    const resultColor = (result: string) => {
      switch (result) {
        case "win":
          return "success";
        case "cancle":
          return "grey";
        case "lose":
          return "error";
        default:
          return "warning";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "win":
          return <CheckCircleOutlined sx={{ fontSize: 20 }} />;
        case "lose":
          return <CancelOutlined sx={{ fontSize: 20 }} />;
        case "cancle":
          return <CancelOutlined sx={{ fontSize: 20 }} />;
        default:
          return <HourglassEmptyOutlined sx={{ fontSize: 20 }} />;
      }
    };

    const getStatusLabel = (status: string) => {
      return chengeTitle(status);
    };

    if (!list || list.length === 0) {
      return (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <SportsEsportsOutlined
            sx={{ fontSize: 56, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            베팅 내역이 없습니다
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2} sx={{ px: { xs: 0, md: 1 }, pb: 3 }}>
        {list.map((item) => {
          const status = item.status as "win" | "lose" | "cancle" | "wait";

          return (
            <BettingCard key={item.id} className={status}>
              <CardContent sx={{ p: { xs: 1, md: 2 } }}>
                {/* 상단: 회차 정보 & 상태 */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SportsEsportsOutlined
                      sx={{ fontSize: 24, color: "primary.main" }}
                    />
                    <Typography variant="h5" fontWeight="bold">
                      {item.betDetail[0]?.game_Event || "미니게임"}
                    </Typography>
                    <Chip
                      label={`${item.betDetail[0]?.game_Name || ""}`}
                      size="medium"
                      sx={{
                        height: 28,
                        fontSize: "0.85rem",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                      }}
                    />
                  </Box>
                  <StatusChip
                    icon={getStatusIcon(status)}
                    label={getStatusLabel(status)}
                    status={status}
                  />
                </Box>

                {/* 베팅 상세 */}
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.03),
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1}>
                    {item.betDetail.map((detail, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <BetDetailChip
                          label={chengeTitle(detail.game_Type)}
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "0.95rem" }}
                        />
                        <Typography variant="body1" fontWeight={600}>
                          {detail.Pick}
                        </Typography>
                        <Chip
                          label={`${detail.PickOdds || "1.00"}배`}
                          size="medium"
                          sx={{
                            height: 26,
                            fontSize: "0.85rem",
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: "info.main",
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* 하단: 금액 정보 */}
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        베팅금액
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {numeral(item.betPrice).format("0,0")}원
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        총배당
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="info.main"
                      >
                        {item.totalOdd}배
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        예상당첨금
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="success.main"
                      >
                        {numeral(item.winPrice).format("0,0")}원
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        display="block"
                        sx={{ mb: 0.5 }}
                      >
                        {status === "win" ? "당첨금" : "정산금"}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={
                          status === "win"
                            ? "success.main"
                            : status === "lose"
                            ? "error.main"
                            : "text.secondary"
                        }
                      >
                        {numeral(item.payment).format("0,0")}원
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 베팅 시간 */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <AccessTimeOutlined
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    베팅 시간:{" "}
                    {moment(item.betTime).format("YYYY-MM-DD HH:mm:ss")}
                  </Typography>
                </Box>
              </CardContent>
            </BettingCard>
          );
        })}
      </Stack>
    );
  },
  (prevProps, nextProps) => {
    // list가 실제로 변경되었는지 확인
    if (!prevProps.list && !nextProps.list) return true;
    if (!prevProps.list || !nextProps.list) return false;
    if (prevProps.list.length !== nextProps.list.length) return false;

    // 첫 번째 항목의 id가 다르면 새로운 베팅이 추가된 것
    if (prevProps.list[0]?.id !== nextProps.list[0]?.id) return false;

    return true;
  }
);

MinigameBettingListNew.displayName = "MinigameBettingListNew";

export default MinigameBettingListNew;
