"use client";

import * as React from "react";
import { Tabs, Tab, Box, alpha } from "@mui/material";

const SPORTS_SUB_TABS = [
  { label: "전체", value: "all", emoji: "⭐" },
  { label: "축구", value: "soccer", emoji: "🥅" },
  { label: "농구", value: "basketball", emoji: "🏀" },
  { label: "야구", value: "baseball", emoji: "🥎" },
  { label: "배구", value: "volleyball", emoji: "🏐" },
  { label: "하키", value: "ice-hockey", emoji: "🏒" },
  { label: "E-스포츠", value: "e-sports", emoji: "🎮" },
  { label: "기타", value: "other", emoji: "🎯" },
];

interface SportsSubTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/** 서브탭 스타일 */
const subTabsSx = {
  mt: 0.75,
  px: 0,
  "& .MuiTabs-flexContainer": {
    gap: { xs: 0, sm: 0.5 },
  },
  "& .MuiTabs-indicator": { display: "none" },
  "& .MuiTabs-scrollButtons": {
    width: { xs: 24, sm: 32 },
    color: (t: any) => t.palette.primary.main,
    display: { xs: "flex", md: "none" }, // PC에서는 화살표 숨김
    "&:hover": {
      backgroundColor: (t: any) => alpha(t.palette.primary.main, 0.1),
    },
    "&.Mui-disabled": {
      opacity: 0.3,
    },
  },
  "& .MuiTab-root": {
    flex: { xs: "0 0 auto", sm: "1 1 0" },
    minWidth: { xs: 80, sm: 0 },
    maxWidth: "none",
    fontWeight: 600,
    fontSize: { xs: 11, sm: 13, md: 14 },
    lineHeight: 1.2,
    px: { xs: 1, sm: 1.5, md: 2 },
    py: { xs: 0.75, sm: 1, md: 1.25 },
    minHeight: { xs: 54, sm: 60, md: 66 },
    borderRadius: 1,
    textTransform: "none",
    border: (t: any) => `1px solid ${t.palette.divider}`,
    color: (t: any) => t.palette.text.secondary,
    backgroundColor: (t: any) => t.palette.background.default,
    transition: "all .2s ease",
    whiteSpace: "nowrap",
    gap: { xs: 0.5, md: 0.75 },
  },
  "& .MuiTab-root:hover": (t: any) => ({
    color: t.palette.text.primary,
    backgroundColor: t.palette.action.hover,
    borderColor: alpha(t.palette.primary.main, 0.3),
    transform: "translateY(-1px)",
    boxShadow: `0 2px 4px ${alpha(t.palette.common.black, 0.1)}`,
  }),
  "& .MuiTab-root.Mui-selected": {
    color: (t: any) => t.palette.getContrastText(t.palette.primary.main),
    background: (t: any) =>
      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
    borderColor: "transparent",
    boxShadow: (t: any) =>
      `0 3px 8px ${alpha(t.palette.primary.main, 0.4)}, 0 1px 3px ${alpha(
        t.palette.common.black,
        0.2
      )}`,
    transform: "translateY(-1px)",
  },
};

export default function SportsSubTabs({
  activeTab,
  onTabChange,
}: SportsSubTabsProps) {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ mb: { xs: 1.5, md: 2 } }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={subTabsSx}
      >
        {SPORTS_SUB_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: { xs: 0.5, md: 0.75 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: 20, sm: 24, md: 28 },
                    lineHeight: 1,
                  }}
                >
                  {tab.emoji}
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: 11, sm: 13, md: 14 },
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
