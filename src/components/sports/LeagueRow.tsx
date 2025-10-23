import React, { memo } from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";
import moment from "moment";
import { SportsMatch } from "./sports-types";
import { sportEmoji, getImageUrl } from "./sports-table-utils";

interface LeagueRowProps {
  item: SportsMatch;
  isMobile: boolean;
}

export const LeagueRow = memo<LeagueRowProps>(
  ({ item, isMobile }) => {
    return (
      <>
        <Box pt={{ xs: 1.5, md: 2 }} />
        <Box
          display="flex"
          alignItems="center"
          width="100%"
          sx={{
            position: "relative",
            px: { xs: 1.5, md: 2 },
            py: { xs: 1, md: 1.25 },
            borderRadius: { xs: 1, md: 1.25 },
            background: (t) =>
              `linear-gradient(90deg, ${alpha(
                t.palette.primary.main,
                0.06
              )} 0%, ${alpha(t.palette.background.default, 0.95)} 100%)`,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
            boxShadow: (t) =>
              `0 1px 4px ${alpha(t.palette.common.black, 0.05)}`,
            mb: 1,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: "primary.main",
              borderTopLeftRadius: { xs: 8, md: 10 },
              borderBottomLeftRadius: { xs: 8, md: 10 },
            },
          }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            {/* 스포츠 이모지 */}
            <Typography fontSize={{ xs: 20, md: 24 }}>
              {sportEmoji[item.game_Event] || "🏆"}
            </Typography>

            {/* 리그 플래그 */}
            <Box
              component="img"
              src={getImageUrl(item.league?.flegImg)}
              alt={item.league?.name}
              sx={{
                width: { xs: 24, md: 28 },
                height: { xs: 24, md: 28 },
                objectFit: "contain",
              }}
            />

            {/* 리그 이름 */}
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: 13, md: 15 },
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              {item.league?.changeName || item.league.name}
            </Typography>
          </Stack>

          {/* 모바일에서만 시간 표시 */}
          {isMobile && (
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {moment(item.playTime).format("MM/DD HH:mm")}
            </Typography>
          )}
        </Box>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isMobile === nextProps.isMobile
    );
  }
);

LeagueRow.displayName = "LeagueRow";
