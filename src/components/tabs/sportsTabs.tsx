"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab, Box } from "@mui/material";

const SPORTS_TABS: { label: string; value: string; href: string }[] = [
  { label: "크로스", value: "cross", href: "/game/sports/cross" },
  { label: "스페셜", value: "special", href: "/game/sports/special" },
  { label: "라이브", value: "live", href: "/game/sports/live" },
];

/** 스포츠 탭 스타일 */
const sportsTabsSx = {
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

export default function SportsTabs() {
  const pathname = usePathname() || "";
  const router = useRouter();

  // 현재 활성 탭 결정
  const activeTab = React.useMemo(() => {
    const currentTab = SPORTS_TABS.find((tab) => pathname === tab.href);
    return currentTab?.href || SPORTS_TABS[0].href;
  }, [pathname]);

  // 프리패치
  React.useEffect(() => {
    SPORTS_TABS.forEach((tab) => {
      router.prefetch?.(tab.href);
    });
  }, [router]);

  // 진행바 + 라우팅
  const nav = (href: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      router.push(href);
    }
  };

  return (
    <Box sx={{ mb: { xs: 1, md: 2 } }}>
      <Tabs value={activeTab} variant="fullWidth" sx={sportsTabsSx}>
        {SPORTS_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.href}
            label={tab.label}
            component={Link}
            href={tab.href}
            onClick={nav(tab.href)}
          />
        ))}
      </Tabs>
    </Box>
  );
}






