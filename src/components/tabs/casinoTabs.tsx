"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab, Box } from "@mui/material";

const CASINO_TABS: { label: string; value: string; href: string }[] = [
  { label: "카지노", value: "casino", href: "/game/casino" },
  { label: "슬롯", value: "slot", href: "/game/slot" },
];

/** 카지노 탭 스타일 */
const casinoTabsSx = {
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

export default function CasinoTabs() {
  const pathname = usePathname() || "";
  const router = useRouter();

  // 현재 활성 탭 결정
  const activeTab = React.useMemo(() => {
    const currentTab = CASINO_TABS.find((tab) => pathname === tab.href);
    return currentTab?.href || CASINO_TABS[0].href;
  }, [pathname]);

  // 프리패치
  React.useEffect(() => {
    CASINO_TABS.forEach((tab) => {
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
    <Box>
      <Tabs value={activeTab} variant="fullWidth" sx={casinoTabsSx}>
        {CASINO_TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.href}
            component={Link}
            href={tab.href}
            onClick={nav(tab.href)}
          />
        ))}
      </Tabs>
    </Box>
  );
}






