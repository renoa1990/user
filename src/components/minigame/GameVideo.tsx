import * as React from "react";
import { Box, Paper } from "@mui/material";

type Props = {
  src: string;
  srcMobile?: string;
  title?: string;
  /** 원본 고정 크기 */
  contentWidth?: number; // 기본 1024
  contentHeight?: number; // 기본 640
  /** 확대 금지(1이면 원본 이상 확대 안 함) */
  maxScale?: number; // 기본 1
  isMobile?: boolean;
};

export default function GameVideo({
  src,
  srcMobile,
  title = "game",
  contentWidth = 1024,
  contentHeight = 640,
  maxScale = 1,
  isMobile = false,
}: Props) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [wrapW, setWrapW] = React.useState<number>(contentWidth);

  React.useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setWrapW(e.contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [contentWidth]);

  // 축소 배율 계산(확대 금지)
  const scale = Math.min(maxScale, wrapW / contentWidth);
  const scaledW = Math.round(contentWidth * scale);
  const scaledH = Math.round(contentHeight * scale);

  // 모바일 URL이 있으면 사용
  const videoSrc = isMobile && srcMobile ? srcMobile : src;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {/* 가로폭 100% 영역 */}
      <Box ref={wrapRef} sx={{ width: "100%", bgcolor: "black" }}>
        {/* 스케일된 크기 박스를 가운데 정렬 */}
        <Box
          sx={{
            width: `${scaledW}px`,
            height: `${scaledH}px`,
            mx: "auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 원본 크기 박스를 scale(top-left 기준) */}
          <Box
            sx={{
              width: `${contentWidth}px`,
              height: `${contentHeight}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Box
              component="iframe"
              src={videoSrc}
              title={title}
              scrolling="no"
              allow="autoplay; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              sx={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
                background: "black",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}




