import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab, Box } from "@mui/material";

export default function BoardTabs() {
  const pathname = usePathname() || "";
  const router = useRouter();

  const TABS = ["/contact", "/event", "/infomation"] as const;
  const value = TABS.find((base) => pathname.startsWith(base)) ?? "/infomation";

  // 체감속도 향상
  React.useEffect(() => {
    TABS.forEach((href) => router.prefetch?.(href));
  }, [router]);

  // 진행바 + 전환
  const nav = (href: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      router.push(href);
    }
  };

  return (
    <Box sx={{ mb: { xs: 1, md: 2 } }}>
      <Tabs
        value={value}
        variant="fullWidth"
        TabIndicatorProps={{ sx: { display: "none" } }} // 기본 밑줄 제거
        sx={{
          "& .MuiTab-root": {
            fontSize: "medium",
            minHeight: 44,
            fontWeight: 700,
            borderRadius: "6px 6px 0 0",
            border: "0 solid transparent",
            py: 1,
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
        <Tab
          value="/infomation"
          label="공지사항"
          component={Link}
          href="/infomation"
          onClick={nav("/infomation")}
        />
        <Tab
          value="/event"
          label="이벤트"
          component={Link}
          href="/event"
          onClick={nav("/event")}
        />
        <Tab
          value="/contact"
          label="고객센터"
          component={Link}
          href="/contact"
          onClick={nav("/contact")}
        />
      </Tabs>
    </Box>
  );
}
