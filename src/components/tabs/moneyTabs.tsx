import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Button, Divider, Tab, Tabs } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import useMutation from "@libs/useMutation";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export const MoneyTabs: FC = (props) => {
  const pathname = usePathname() || "";
  const router = useRouter();
  //   const { start } = useProgress();

  const value = pathname.startsWith("/deposit") ? "/deposit" : "/withdraw";

  // 프리패치
  React.useEffect(() => {
    router.prefetch?.("/deposit");
    router.prefetch?.("/withdraw");
  }, [router]);

  // 진행바 + 라우팅
  const nav = (href: string) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (href !== pathname) {
      //   start("tab_payment");
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
          value="/deposit"
          label="충전신청"
          component={Link}
          href="/deposit"
          onClick={nav("/deposit")}
        />
        <Tab
          value="/withdraw"
          label="환전신청"
          component={Link}
          href="/withdraw"
          onClick={nav("/withdraw")}
        />
      </Tabs>
    </Box>
  );
};
