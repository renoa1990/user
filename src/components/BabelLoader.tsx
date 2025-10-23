import * as React from "react";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { alpha } from "@mui/material/styles";

type Props = {
  fullscreen?: boolean;
  withBackground?: boolean;
  showCenterLogo?: boolean;
  /** 배경 색상 (기본 검정) */
  backdropColor?: string;
  /** 배경 투명도 0~1 (기본 0.92: 거의 불투명) */
  backdropOpacity?: number;
  /** 오버레이 z-index (기본 1301) */
  zIndex?: number;
  /** 배경 클릭 차단 여부 (기본 true) */
  blockPointer?: boolean;
};

const bob = keyframes({
  "0%": { transform: "translateY(0px) scale(1)" },
  "50%": { transform: "translateY(-24px) scale(1.06)" },
  "100%": { transform: "translateY(0px) scale(1)" },
});

export default function BabelLoader({
  fullscreen = true,
  withBackground = true,
  showCenterLogo = true,
  backdropColor = "#000",
  backdropOpacity = 0.92, // ← 여기만 조절해도 배경 농도 변경 가능
  zIndex = 1301,
  blockPointer = true,
}: Props) {
  const letters = ["B", "A", "B", "E", "L"];

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={(t) => ({
        position: fullscreen ? "fixed" : "relative",
        inset: fullscreen ? 0 : "auto",
        minHeight: fullscreen ? "100vh" : 240,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        zIndex,
        pointerEvents: blockPointer ? "auto" : "none",
        // ← 배경을 원하는 불투명도로
        bgcolor: withBackground
          ? alpha(backdropColor, backdropOpacity)
          : "transparent",
      })}
    >
      {showCenterLogo && (
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.75, md: 1.25 },
            alignItems: "center",
            justifyContent: "center",
            userSelect: "none",
          }}
        >
          {letters.map((ch, i) => (
            <Typography
              key={i}
              variant="h1"
              sx={(t) => ({
                fontSize: { xs: 84, sm: 108, md: 160, lg: 196 },
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: { xs: 2, md: 4 },
                background: `linear-gradient(180deg, ${t.palette.text.primary}, ${t.palette.primary.main})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow:
                  t.palette.mode === "dark"
                    ? "0 10px 28px rgba(0,0,0,.55)"
                    : "0 10px 28px rgba(0,0,0,.18)",
                animation: `${bob} 1.6s ease-in-out ${i * 0.08}s infinite`,
              })}
              aria-hidden
            >
              {ch}
            </Typography>
          ))}
        </Box>
      )}

      {/* 접근성용 숨김 텍스트 */}
      <Box
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        Loading…
      </Box>
    </Box>
  );
}
