import * as React from "react";
import { Box } from "@mui/material";
import { NewCart } from "./new-cart";

interface Props {
  width?: number;
  offset?: number;
  gameCode?: string;
  game_Event?: string;
  userMoney?: number;
  mutate?: () => void;
  bonus?: {
    bonus: string;
    count: number;
  } | null;
}

/**
 * PC 전용 우측 카트 컨테이너
 * - 모바일(xs, sm) 숨김
 * - width 고정(최소 사이즈 보장)
 * - 스크롤 시 상단에 sticky
 */
export default function RightCartShell({
  width = 320,
  offset = 8,
  gameCode,
  game_Event,
  userMoney,
  mutate,
  bonus,
}: Props) {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: "none", md: "block" }, // 모바일 숨김
        width,
        minWidth: width,
        flexShrink: 0,
        boxSizing: "border-box",
        position: "sticky",
        top: offset,
        alignSelf: "flex-start", // sticky 작동을 위해 필수
        maxHeight: `calc(100vh - ${offset * 2}px)`,
        overflowY: "auto",
        bgcolor: "transparent",
        border: "none",
        // 스크롤 스타일
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.3)",
          },
        },
      }}
    >
      <NewCart
        gameCode={gameCode}
        game_Event={game_Event}
        userMoney={userMoney}
        onClose={() => {}}
        mutate={mutate}
        bonus={bonus}
      />
    </Box>
  );
}
