import * as React from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";

interface BettingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// 탭 데이터 - 모바일 메뉴와 동일한 이모지 사용
const BETTING_TABS = [
  { label: "전체", value: "전체", emoji: "📋" },
  { label: "크로스", value: "크로스", emoji: "⚽" },
  { label: "스페셜", value: "스페셜", emoji: "🎯" },
  { label: "실시간", value: "실시간", emoji: "🔴" },
  { label: "미니게임", value: "미니게임", emoji: "🎮" },
];

export default function BettingTabs({
  activeTab,
  onTabChange,
}: BettingTabsProps) {
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue);
  };

  return (
    <Box sx={{ mb: { xs: 1, md: 2 } }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="fullWidth"
        TabIndicatorProps={{ sx: { display: "none" } }} // 기본 밑줄 제거
        sx={{
          "& .MuiTab-root": {
            fontSize: { xs: 10, sm: "small", md: "medium" },
            minHeight: { xs: 40, md: 44 },
            fontWeight: 700,
            borderRadius: "6px 6px 0 0",
            border: "0 solid transparent",
            py: { xs: 0.5, md: 1 },
            px: { xs: 0.5, sm: 1, md: 2 },
            minWidth: 0,
            borderBottom: (t) => `2px solid ${t.palette.divider}`,
            borderColor: (t) => t.palette.primary.main,
            transition: "background-color .2s",
          },
          "& .MuiTab-root:not(.Mui-selected)": {
            backgroundColor: (t) => t.palette.background.default,
          },
          "& .MuiTab-root.Mui-selected": {
            borderWidth: "2px 2px 0px 2px",
            borderStyle: "solid",
            borderColor: (t) => t.palette.primary.main,
          },
        }}
      >
        {BETTING_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.3, sm: 0.5, md: 1 },
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Typography
                  component="span"
                  fontSize={{ xs: 14, sm: 16, md: 18 }}
                  sx={{ lineHeight: 1 }}
                >
                  {tab.emoji}
                </Typography>
                <Typography
                  component="span"
                  fontSize={{ xs: 10, sm: "small", md: "medium" }}
                  fontWeight={700}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {tab.label}
                </Typography>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
}
