// src/components/minigame/MinigameTabs.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab, Box } from "@mui/material";

type Vendor = "ntry" | "bosscore";

const PRIMARY_TABS: { key: Vendor; label: string; href: string }[] = [
  { key: "ntry", label: "엔트리", href: "/game/minigame/ntry/eos1" },
  {
    key: "bosscore",
    label: "보스코어",
    href: "/game/minigame/bosscore/starladder1",
  },
];

const SECONDARY_TABS: Record<Vendor, { label: string; href: string }[]> = {
  ntry: [
    { label: "EOS파워볼 1분", href: "/game/minigame/ntry/eos1" },
    { label: "EOS파워볼 2분", href: "/game/minigame/ntry/eos2" },
    { label: "EOS파워볼 3분", href: "/game/minigame/ntry/eos3" },
    { label: "EOS파워볼 4분", href: "/game/minigame/ntry/eos4" },
    { label: "EOS파워볼 5분", href: "/game/minigame/ntry/eos5" },
    { label: "키노사다리", href: "/game/minigame/ntry/kinoladder" },
    { label: "파워사다리", href: "/game/minigame/ntry/powerladder" },
    { label: "파워볼", href: "/game/minigame/ntry/powerball" },
  ],
  bosscore: [
    { label: "별다리 1분", href: "/game/minigame/bosscore/starladder1" },
    { label: "별다리 2분", href: "/game/minigame/bosscore/starladder2" },
    { label: "별다리 3분", href: "/game/minigame/bosscore/starladder3" },
  ],
};

/** 1단 탭 스타일(그대로) */
const primaryTabsSx = {
  "& .MuiTab-root": {
    minHeight: 44,
    fontWeight: 700,
    fontSize: "medium",
    borderRadius: "6px 6px 0 0",
    py: 1,
    borderBottom: (t: any) => `2px solid ${t.palette.divider}`,
    borderColor: (t: any) => t.palette.primary.main,
    transition: "background-color .2s",
  },
  "& .MuiTab-root:not(.Mui-selected)": {
    backgroundColor: (t: any) => t.palette.background.default,
  },
  "& .MuiTab-root.Mui-selected": {
    borderWidth: "2px 2px 0 2px",
    borderStyle: "solid",
    borderColor: (t: any) => t.palette.primary.main,
  },
  "& .MuiTabs-indicator": { display: "none" },
};

/** 2단 탭 스타일(원본 유지) */
const secondaryTabsSx = {
  mt: 0.75,
  px: 0,
  "& .MuiTabs-flexContainer": { gap: 0 },
  "& .MuiTabs-indicator": { display: "none" },
  "& .MuiTab-root": {
    flex: "1 1 0",
    minWidth: 0,
    maxWidth: "none",
    fontWeight: 600,
    fontSize: { xs: 14, sm: 14, md: 16 },
    lineHeight: { xs: 1.2, sm: 1.25 },
    px: { xs: 1, sm: 1.25 },
    py: { xs: 0.6, sm: 0.75 },
    minHeight: { xs: 34, sm: 38 },
    borderRadius: { xs: 0.2, sm: 0.2 },
    textTransform: "none",
    border: (t: any) => `1px solid ${t.palette.divider}`,
    color: (t: any) => t.palette.text.secondary,
    backgroundColor: (t: any) => t.palette.background.default,
    transition: "all .18s ease",
    whiteSpace: "nowrap",
  },
  "& .MuiTab-root:hover": (t: any) => ({
    color: t.palette.text.primary,
    backgroundColor: t.palette.action.hover,
  }),
  "& .MuiTab-root.Mui-selected": {
    color: (t: any) => t.palette.getContrastText(t.palette.primary.main),
    background: (t: any) =>
      `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
    borderColor: "transparent",
    boxShadow: "0 2px 8px rgba(0,0,0,.25)",
  },
};

export default function MinigameTabs() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const activeVendor: Vendor = React.useMemo(() => {
    if (pathname.startsWith("/game/minigame/bosscore")) return "bosscore";
    return "ntry";
  }, [pathname]);

  const secondary = SECONDARY_TABS[activeVendor];
  const secondaryValue =
    secondary.find((t) => pathname.startsWith(t.href))?.href ??
    secondary[0].href;

  // 진행바 + 라우팅
  const nav = (href: string, key: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      router.push(href);
    }
  };

  // 모바일 전용 단축 라벨 생성(EOS파워볼 → EOS)
  const labelResponsive = (label: string, short?: string) => (
    <>
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        {label}
      </Box>
      <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
        {short ?? label}
      </Box>
    </>
  );

  const shortEOS = (label: string) => label.replace(/^EOS파워볼\s*/, "EOS ");

  /** ⬇️ 보스코어 3등분, 엔트리는 2줄 4개씩 */
  const flexGridSx = {
    px: 0,
    "& .MuiTabs-flexContainer": {
      flexWrap: "wrap",
      gap: 0,
    },
    "& .MuiTab-root": {
      flex:
        activeVendor === "bosscore"
          ? "0 0 33.333%" // 보스코어는 3등분
          : "0 0 25%", // 엔트리는 4등분 (2줄)
      minWidth: 0,
      maxWidth: "none",
    },
  } as const;

  return (
    <Box>
      {/* 1단: 벤더 */}
      <Tabs
        value={`/game/minigame/${activeVendor}`}
        variant="fullWidth"
        sx={primaryTabsSx}
      >
        {PRIMARY_TABS.map((t) => (
          <Tab
            key={t.key}
            value={`/game/minigame/${t.key}`}
            label={t.label}
            component={Link}
            href={t.href}
            onClick={nav(t.href, "tab_vendor")}
          />
        ))}
      </Tabs>

      {/* 2단: 서브 — 보스코어는 3등분, 엔트리는 기존대로 */}
      <Tabs
        value={secondaryValue}
        variant="standard"
        sx={[secondaryTabsSx as any, flexGridSx]}
      >
        {secondary.map((t) => {
          const isEOS = activeVendor === "ntry" && /^EOS파워볼/.test(t.label);
          const labelNode = isEOS
            ? labelResponsive(t.label, shortEOS(t.label)) // 모바일: "EOS 1분"
            : labelResponsive(t.label);
          return (
            <Tab
              key={t.href}
              value={t.href}
              label={labelNode}
              aria-label={t.label}
              component={Link}
              href={t.href}
              onClick={nav(t.href, "tab_game")}
            />
          );
        })}
      </Tabs>
    </Box>
  );
}
