// src/components/common/LabelRow.tsx

"use client";

import * as React from "react";
import { Grid, SxProps, Theme } from "@mui/material";

type Props = {
  label: React.ReactNode;
  children: React.ReactNode;
  /** md 기준 라벨 칼럼(기본 3 → 내용 9) */
  labelMd?: 2 | 3 | 4 | 5 | 6;
  /** 컨테이너 margin-bottom (기본 1) */
  mb?: number;
  /** 라벨/내용 개별 스타일 오버라이드 */
  labelSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

export default function LabeledRow({
  label,
  children,
  labelMd = 3,
  mb = 1,
  labelSx,
  contentSx,
}: Props) {
  const contentMd = (12 - labelMd) as 6 | 7 | 8 | 9 | 10;

  return (
    <Grid container sx={{ mb }}>
      {/* 라벨 영역: 직접 폰트 크기 지정 */}
      <Grid
        item
        xs={13}
        md={labelMd}
        sx={{
          bgcolor: (t) => t.palette.background.default,
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRight: { md: 0 },
          borderRadius: { xs: "6px 6px 0 0", md: "6px 0 0 6px" },
          px: 2,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          minHeight: 44,
          fontWeight: 400,
          fontSize: { xs: 13, md: 15 }, // ✅ 모바일 12 / 데스크탑 14
          ...labelSx,
        }}
      >
        {label}
      </Grid>

      {/* 컨텐츠 영역: 입력 컴포넌트는 건드리지 않고 텍스트만 대응 */}
      <Grid
        item
        xs={13}
        md={contentMd}
        sx={{
          bgcolor: (t) => t.palette.background.paper,
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: { xs: "0 0 6px 6px", md: "0 6px 6px 0" },
          px: 2,
          py: 1.25,

          // ✅ Typography/일반 텍스트만 반응형 폰트 적용
          "& .MuiTypography-root, & p, & span, & li, & small": {
            fontSize: { xs: 13, md: 15 },
          },

          // (선택) 캡션류 살짝 더 작게 쓰고 싶다면 아래 주석 해제
          // "& .MuiTypography-caption": { fontSize: { xs: 11, md: 13 } },

          ...contentSx,
        }}
      >
        {children}
      </Grid>
    </Grid>
  );
}
