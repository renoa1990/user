import React, { FC } from "react";
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
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  InfoOutlined,
  CancelOutlined,
  DeleteOutlineOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import UserBettingListExact from "./user-bettinglist-exact";
import BettingTabs from "@components/tabs/bettingTabs";
import {
  SportsSetup,
  betDetail,
  bettinglist,
  gameMemo,
  Team,
  league,
} from "@prisma/client";

interface details extends betDetail {
  away_TeamName: Team;
  home_TeamName: Team;
  leagueName: league;
  gameMemo: gameMemo;
}

interface detail extends bettinglist {
  betDetail: details[];
}

interface Props {
  list?: detail[];
  page: number;
  count: number;
  handleChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  mutate: () => void;
  setup: SportsSetup;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.info.main, 0.03),
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
  marginBottom: theme.spacing(3),
}));

export const BettingListPageNew: FC<Props> = ({
  list,
  page,
  count,
  handleChange,
  mutate,
  setup,
  activeTab,
  onTabChange,
}) => {
  const theme = useTheme();

  return (
    <Box>
      {/* 탭 메뉴 */}
      <BettingTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* 안내 카드 */}
      <InfoCard>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <InfoOutlined sx={{ color: "info.main", fontSize: 24 }} />
            <Typography variant="h6" fontWeight="bold" color="info.main">
              배팅 취소 안내
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <CancelOutlined
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                배팅취소는 배팅시간으로부터 30분이내 경기시작시간 20분전까지,
                하루 최대 3회 가능합니다.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <DeleteOutlineOutlined
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                배팅취소후 취소된 내역은 복구가 불가능하며, 취소된 배팅금액은
                보유머니로 적립됩니다.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <DeleteOutlineOutlined
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                배팅내역 삭제는 모든 경기가 종료된 이후 가능하며, 삭제된 내역은
                복구가 불가능합니다.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <InfoOutlined
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                고객센터를 통한 배팅취소는 절대 불가하며 직접 취소만 인정됩니다.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <AccessTimeOutlined
                sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.6}
              >
                배팅내역은 최대 1주일치 확인가능합니다.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </InfoCard>

      {/* 배팅 리스트 - 새로운 UI 적용 */}
      <UserBettingListExact
        list={list}
        page={page}
        count={count}
        handleChange={handleChange}
        mutate={mutate}
        setup={setup}
      />
    </Box>
  );
};

export default BettingListPageNew;
