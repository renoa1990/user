import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import {
  alpha,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

interface Props {
  onClose: () => void;
  open: boolean;
  variant: "permanent" | "persistent" | "temporary" | undefined;
}

// 메뉴 이모지 매핑
const MOBILE_MENU_EMOJI: Record<string, string> = {
  "/game/sports/cross": "⚽",
  "/game/sports/special": "🎯",
  "/game/sports/live": "🔴",
  "/game/slot": "🎰",
  "/game/casino": "🃏",
  "/minigame": "🎮",
  "/bettinglist": "📋",
  "/contact": "💬",
};

// 미니게임 서브메뉴 - NTRY
const MINIGAME_NTRY_SUBS = [
  { label: "EOS파워볼 1분", href: "/game/minigame/ntry/eos1" },
  { label: "EOS파워볼 2분", href: "/game/minigame/ntry/eos2" },
  { label: "EOS파워볼 3분", href: "/game/minigame/ntry/eos3" },
  { label: "EOS파워볼 4분", href: "/game/minigame/ntry/eos4" },
  { label: "EOS파워볼 5분", href: "/game/minigame/ntry/eos5" },
  { label: "키노사다리", href: "/game/minigame/ntry/kinoladder" },
  { label: "파워사다리", href: "/game/minigame/ntry/powerladder" },
  { label: "파워볼", href: "/game/minigame/ntry/powerball" },
];

// 미니게임 서브메뉴 - BOSSCORE
const MINIGAME_BOSSCORE_SUBS = [
  { label: "별다리 1분", href: "/game/minigame/bosscore/starladder1" },
  { label: "별다리 2분", href: "/game/minigame/bosscore/starladder2" },
  { label: "별다리 3분", href: "/game/minigame/bosscore/starladder3" },
];

// 고객센터 서브메뉴
const SUPPORT_SUBS = [
  { label: "공지사항", href: "/infomation" },
  { label: "이벤트", href: "/event" },
  { label: "고객센터", href: "/contact" },
];

// 서브리스트 컴포넌트
const SubList = ({
  items,
  pathname,
  onSelect,
}: {
  items: { label: string; href: string }[];
  pathname: string;
  onSelect: (href: string) => void;
}) => (
  <List dense sx={{ py: 0.5 }}>
    {items.map((item) => (
      <ListItemButton
        key={item.href}
        onClick={() => onSelect(item.href)}
        selected={pathname === item.href}
        sx={(t) => ({
          py: 1,
          pl: 3,
          "&.Mui-selected": {
            color: t.palette.primary.main,
            bgcolor: alpha(t.palette.primary.main, 0.08),
          },
        })}
      >
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
        />
      </ListItemButton>
    ))}
  </List>
);

const ClientMobileSidebar = ({
  open,
  variant,
  onClose,
}: Props): JSX.Element => {
  const router = useRouter();
  const [subPanel, setSubPanel] = useState<"mini" | "support" | null>(null);

  const pathname = router.pathname;

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  const openSub = (panel: "mini" | "support") => {
    setSubPanel(panel);
  };

  const closeSub = () => {
    setSubPanel(null);
  };

  const isActive = (href: string) => pathname.includes(href);

  // 현재 URL이 서브메뉴에 해당하면 자동으로 서브패널 열기
  useEffect(() => {
    if (!open) {
      setSubPanel(null);
      return;
    }

    // 미니게임 서브메뉴 체크
    const isMinigameSubPage = [
      ...MINIGAME_NTRY_SUBS,
      ...MINIGAME_BOSSCORE_SUBS,
    ].some((item) => pathname.includes(item.href));
    if (isMinigameSubPage) {
      setSubPanel("mini");
      return;
    }

    // 고객센터 서브메뉴 체크
    const isSupportSubPage = SUPPORT_SUBS.some((item) =>
      pathname.includes(item.href)
    );
    if (isSupportSubPage) {
      setSubPanel("support");
      return;
    }

    // 해당 없으면 닫기
    setSubPanel(null);
  }, [open, pathname]);

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      variant={variant}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: { xs: 320, sm: 360 },
          bgcolor: "background.default",
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)",
        },
      }}
    >
      {/* 2-Column 레이아웃 */}
      <Box sx={{ display: subPanel ? "flex" : "block", minHeight: "100%" }}>
        {/* 왼쪽: 메인 메뉴 리스트 */}
        <Box
          sx={(t) => ({
            width: subPanel ? "44%" : "100%",
            borderRight: subPanel
              ? `1px solid ${alpha(t.palette.divider, 0.24)}`
              : "none",
          })}
        >
          <List>
            {[
              { label: "크로스", href: "/game/sports/cross" },
              { label: "스페셜", href: "/game/sports/special" },
              { label: "라이브", href: "/game/sports/live" },
              { label: "카지노", href: "/game/casino" },
              { label: "슬롯", href: "/game/slot" },
              { label: "미니게임", href: "/minigame" },
              { label: "배팅내역", href: "/bettinglist" },
              { label: "고객센터", href: "/contact" },
            ].map((m) => {
              const active =
                isActive(m.href) ||
                (m.href === "/minigame" && subPanel === "mini") ||
                (m.href === "/contact" && subPanel === "support");

              const handleClick = () => {
                if (m.href === "/minigame") return openSub("mini");
                if (m.href === "/contact") return openSub("support");
                closeSub();
                go(m.href);
              };

              return (
                <ListItemButton
                  key={m.href}
                  onClick={handleClick}
                  selected={active}
                  sx={(t) => ({
                    "&.Mui-selected": {
                      color: t.palette.primary.main,
                      background: alpha(t.palette.primary.main, 0.06),
                    },
                    "&:hover": { color: t.palette.primary.main },
                  })}
                >
                  <ListItemIcon
                    sx={{ minWidth: 34, fontSize: 18, lineHeight: 1 }}
                  >
                    {MOBILE_MENU_EMOJI[m.href] ?? "•"}
                  </ListItemIcon>
                  <ListItemText
                    primary={m.label}
                    primaryTypographyProps={{ fontSize: 16, fontWeight: 700 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* 오른쪽: 서브패널(미니/고객센터) */}
        <Box
          sx={{
            display: subPanel ? "flex" : "none",
            flexDirection: "column",
            width: "56%",
            bgcolor: "rgba(18,18,18,0.96)",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              pt: 1.25,
              pb: 0.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton onClick={closeSub} size="small" aria-label="뒤로">
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, ml: 0.5 }}>
              {subPanel === "mini" ? "미니게임" : "고객센터"}
            </Typography>
          </Box>
          <Divider />
          {subPanel === "mini" && (
            <>
              {/* NTRY 섹션 */}
              <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  NTRY
                </Typography>
              </Box>
              <SubList
                items={MINIGAME_NTRY_SUBS}
                pathname={pathname}
                onSelect={(href) => {
                  go(href);
                  closeSub();
                }}
              />

              {/* 구분선 */}
              <Divider sx={{ my: 1 }} />

              {/* BOSSCORE 섹션 */}
              <Box sx={{ px: 2, pt: 0.5, pb: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  BOSSCORE
                </Typography>
              </Box>
              <SubList
                items={MINIGAME_BOSSCORE_SUBS}
                pathname={pathname}
                onSelect={(href) => {
                  go(href);
                  closeSub();
                }}
              />
            </>
          )}
          {subPanel === "support" && (
            <SubList
              items={SUPPORT_SUBS}
              pathname={pathname}
              onSelect={(href) => {
                go(href);
                closeSub();
              }}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default ClientMobileSidebar;
