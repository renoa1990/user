import { FC, useEffect, useState } from "react";
import Link from "next/link";
import {
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useRouter } from "next/router";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import Badge from "@mui/material/Badge";
import { alpha } from "@mui/material/styles";
import Image from "next/image";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LocalParkingRoundedIcon from "@mui/icons-material/LocalParkingRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";

interface props {
  message?: number;
  contact?: number;
  onSidebarOpen: () => void;
  onAccountSidebarOpen: () => void;
  money?: number;
  point?: string;
  lv?: string;
  nickname?: string;
}

export const ClientNavbar: FC<props> = (props) => {
  const {
    message,
    contact,
    onSidebarOpen,
    onAccountSidebarOpen,
    money,
    point,
    lv,
    nickname,
  } = props;
  const showSpinner = false;
  const router = useRouter();
  const [logout, { data, loading }] = useMutation("/api/users/logout");
  const [pointChange, { data: pointData, loading: pointLoading }] = useMutation(
    "/api/sidebar/userdata/pointchange"
  );
  const { enqueueSnackbar } = useSnackbar();

  // 고객센터 서브메뉴 상태
  const [customerMenuAnchor, setCustomerMenuAnchor] =
    useState<null | HTMLElement>(null);
  const isCustomerMenuOpen = Boolean(customerMenuAnchor);

  const handleCustomerMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setCustomerMenuAnchor(event.currentTarget);
  };

  const handleCustomerMenuClose = () => {
    setCustomerMenuAnchor(null);
  };

  // 미니게임 서브메뉴 상태
  const [minigameMenuAnchor, setMinigameMenuAnchor] =
    useState<null | HTMLElement>(null);
  const isMinigameMenuOpen = Boolean(minigameMenuAnchor);

  const handleMinigameMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMinigameMenuAnchor(event.currentTarget);
  };

  const handleMinigameMenuClose = () => {
    setMinigameMenuAnchor(null);
  };

  const onLogout = () => {
    if (loading) return;
    logout({});
  };
  useEffect(() => {
    if (data && data.ok) {
      enqueueSnackbar("로그아웃 되었습니다", {
        variant: "success",
      });
      router.replace("/");
    }
  }, [data]);

  useEffect(() => {
    if (pointData && pointData.ok) {
      if (pointData.change) {
        enqueueSnackbar("포인트가 머니로 전환되었습니다", {
          variant: "success",
        });
        // 페이지 새로고침하여 업데이트된 데이터 표시
        router.replace(router.asPath);
      } else if (pointData.notChange) {
        enqueueSnackbar(pointData.notChange.message, {
          variant: "warning",
        });
      } else if (pointData.nothing) {
        enqueueSnackbar("전환 가능한 포인트가 없습니다", {
          variant: "info",
        });
      }
    }
  }, [pointData]);

  const handlePointChange = () => {
    if (pointLoading) return;
    pointChange({});
  };

  return (
    <>
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          bgcolor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(223,227,228,0.14)",
        }}
      >
        {/* Top bar */}
        <Toolbar
          sx={{
            minHeight: 60,
            px: { xs: 1.25, md: 2 },
            gap: 1.25,
            position: "relative",
          }}
        >
          {/* 모바일: 햄버거 */}
          <IconButton
            onClick={onSidebarOpen}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            aria-label="메뉴 열기"
            size="large"
          >
            <MenuRoundedIcon sx={{ fontSize: 30 }} />
          </IconButton>

          {/* 데스크탑: 좌측 로고 */}
          <Box
            sx={{
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
            }}
          >
            <Link
              href="/home"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src="/images/main_logo.png"
                alt="mainLogo"
                width={110}
                height={42}
                priority={false}
              />
            </Link>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
              ml: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Link
              href={"/game/sports/cross"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/sports/cross")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                크로스
              </Typography>
            </Link>
            <Link
              href={"/game/sports/special"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/sports/special")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                스페셜
              </Typography>
            </Link>
            <Link
              href={"/game/sports/live"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/sports/live")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                라이브
              </Typography>
            </Link>
            <Link
              href={"/game/slot"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/slot")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                슬롯
              </Typography>
            </Link>
            <Link
              href={"/game/casino"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/casino")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                카지노
              </Typography>
            </Link>
            <Box
              id="minigame-menu-button"
              onClick={handleMinigameMenuClick}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/game/minigame")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                미니게임
              </Typography>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 20,
                  transform: isMinigameMenuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </Box>
            <Link
              href={"/bettinglist"}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/bettinglist")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                베팅내역
              </Typography>
            </Link>
            <Box
              id="customer-menu-button"
              onClick={handleCustomerMenuClick}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                fontSize={"large"}
                fontWeight={"700"}
                color={
                  router.pathname.match("/contact|/infomation|/event")
                    ? "primary"
                    : "text.primary"
                }
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                }}
              >
                고객센터
              </Typography>
              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 20,
                  transform: isCustomerMenuOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </Box>

            {/* 고객센터 서브메뉴 */}
            <Menu
              anchorEl={customerMenuAnchor}
              open={isCustomerMenuOpen}
              onClose={handleCustomerMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              // aria-hidden 문제 해결을 위한 속성 추가
              disableAutoFocusItem
              aria-hidden={false}
              MenuListProps={{
                "aria-labelledby": "customer-menu-button",
                "aria-hidden": false,
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 160,
                  bgcolor: "background.default",
                  border: (t) => `1px solid ${t.palette.divider}`,
                },
              }}
            >
              <MenuItem
                component={Link}
                href="/contact"
                onClick={handleCustomerMenuClose}
                selected={router.pathname.includes("/contact")}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  고객센터
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/infomation"
                onClick={handleCustomerMenuClose}
                selected={router.pathname.includes("/infomation")}
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  공지사항
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/event"
                onClick={handleCustomerMenuClose}
                selected={router.pathname.includes("/event")}
                sx={{
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  이벤트
                </Typography>
              </MenuItem>
            </Menu>

            {/* 미니게임 서브메뉴 */}
            <Menu
              anchorEl={minigameMenuAnchor}
              open={isMinigameMenuOpen}
              onClose={handleMinigameMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              // aria-hidden 문제 해결을 위한 속성 추가
              disableAutoFocusItem
              aria-hidden={false}
              MenuListProps={{
                "aria-labelledby": "minigame-menu-button",
                "aria-hidden": false,
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  bgcolor: "background.default",
                  border: (t) => `1px solid ${t.palette.divider}`,
                },
              }}
            >
              {/* 엔트리 섹션 */}
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  NTRY
                </Typography>
              </Box>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/eos1"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/eos1"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  EOS파워볼 1분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/eos2"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/eos2"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  EOS파워볼 2분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/eos3"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/eos3"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  EOS파워볼 3분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/eos4"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/eos4"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  EOS파워볼 4분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/eos5"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/eos5"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  EOS파워볼 5분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/kinoladder"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/kinoladder"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  키노사다리
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/powerladder"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/powerladder"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  파워사다리
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/ntry/powerball"
                onClick={handleMinigameMenuClose}
                selected={router.pathname === "/game/minigame/ntry/powerball"}
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  파워볼
                </Typography>
              </MenuItem>

              {/* 구분선 */}
              <Divider sx={{ my: 1 }} />

              {/* 보스코어 섹션 */}
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
              <MenuItem
                component={Link}
                href="/game/minigame/bosscore/starladder1"
                onClick={handleMinigameMenuClose}
                selected={
                  router.pathname === "/game/minigame/bosscore/starladder1"
                }
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  별다리 1분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/bosscore/starladder2"
                onClick={handleMinigameMenuClose}
                selected={
                  router.pathname === "/game/minigame/bosscore/starladder2"
                }
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  별다리 2분
                </Typography>
              </MenuItem>
              <MenuItem
                component={Link}
                href="/game/minigame/bosscore/starladder3"
                onClick={handleMinigameMenuClose}
                selected={
                  router.pathname === "/game/minigame/bosscore/starladder3"
                }
                sx={{
                  pl: 3,
                  "&:hover": {
                    color: "primary.main",
                  },
                  "&.Mui-selected": {
                    color: "primary.main",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography fontSize="small" fontWeight={600}>
                  별다리 3분
                </Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* 우측: 데스크탑 액션 */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ ml: "auto", display: { xs: "none", md: "flex" } }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={(t) => ({
                p: 0.5,
                borderRadius: 1,
                "&:hover": { bgcolor: alpha(t.palette.primary.main, 0.08) },
              })}
            >
              <Box
                sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center" }}
                gap={1}
              >
                {/* 레벨 Chip */}
                <Chip
                  label={`LV.${lv || 1}`}
                  size="small"
                  color="primary"
                  sx={{
                    height: 22,
                    fontSize: 12,
                    fontWeight: 700,
                    "& .MuiChip-label": {
                      px: 1,
                    },
                  }}
                />

                <Typography color="primary">
                  {showSpinner ? "로딩중..." : `${nickname ?? "회원"} 님`}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={(t) => ({
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                transition: "all .2s",
                bgcolor: `linear-gradient(135deg, ${alpha(
                  t.palette.primary.main,
                  0.1
                )}, ${alpha(t.palette.primary.main, 0.05)})`,
                border: `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                boxShadow: `0 2px 4px ${alpha(t.palette.primary.main, 0.1)}`,
                "&:hover": {
                  bgcolor: alpha(t.palette.primary.main, 0.15),
                  transform: "translateY(-1px)",
                  boxShadow: `0 4px 8px ${alpha(t.palette.primary.main, 0.15)}`,
                },
              })}
            >
              <MonetizationOnRoundedIcon sx={{ color: "primary.main" }} />
              <Typography fontWeight={600} fontSize="0.875rem">
                보유머니:
              </Typography>
              {showSpinner ? (
                <CircularProgress size={12} thickness={5} sx={{ ml: 0.5 }} />
              ) : (
                <Typography
                  color="primary"
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={(t) => ({
                    textShadow: `0 1px 2px ${alpha(
                      t.palette.primary.main,
                      0.3
                    )}`,
                  })}
                >
                  {money?.toLocaleString()}
                </Typography>
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              onClick={handlePointChange}
              sx={(t) => ({
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all .2s",
                bgcolor: `linear-gradient(135deg, ${alpha(
                  t.palette.error.main,
                  0.1
                )}, ${alpha(t.palette.error.main, 0.05)})`,
                border: `1px solid ${alpha(t.palette.error.main, 0.2)}`,
                boxShadow: `0 2px 4px ${alpha(t.palette.error.main, 0.1)}`,
                "&:hover": {
                  bgcolor: alpha(t.palette.error.main, 0.15),
                  transform: "translateY(-1px) scale(1.02)",
                  boxShadow: `0 4px 8px ${alpha(t.palette.error.main, 0.2)}`,
                },
              })}
              title="클릭하여 포인트를 머니로 전환"
            >
              <LocalParkingRoundedIcon sx={{ color: "error.main" }} />
              <Typography fontWeight={600} fontSize="0.875rem">
                보유포인트:
              </Typography>
              {showSpinner || pointLoading ? (
                <CircularProgress size={12} thickness={5} sx={{ ml: 0.5 }} />
              ) : (
                <Typography
                  color="error"
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={(t) => ({
                    textShadow: `0 1px 2px ${alpha(t.palette.error.main, 0.3)}`,
                  })}
                >
                  {point?.toLocaleString()}
                </Typography>
              )}
            </Stack>
            <Box
              sx={(t) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                transition: "color .2s, background-color .2s",
                "&:hover": {
                  color: t.palette.primary.light,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              })}
              onClick={() => router.push("/message")}
            >
              <Badge
                badgeContent={message}
                color="error"
                max={99}
                overlap="circular"
                invisible={!message}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }}
              >
                <MailOutlineRoundedIcon />
              </Badge>
              <Typography>쪽지</Typography>
            </Box>
            <Box
              sx={(t) => ({
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.5,
                borderRadius: 1,
                cursor: "pointer",
                transition: "color .2s, background-color .2s",
                "&:hover": {
                  color: t.palette.primary.light,
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              })}
              onClick={() => router.push("/event")}
            >
              <CardGiftcardRoundedIcon />
              <Typography> 이벤트</Typography>
            </Box>

            {/* 충전/환전 버튼 */}
            <Button
              component={Link}
              href={"/deposit"}
              variant="outlined"
              color="error"
            >
              충전
            </Button>
            <Button component={Link} href="/withdraw" variant="outlined">
              환전
            </Button>

            <IconButton
              size="large"
              onClick={onAccountSidebarOpen}
              aria-label="계정 패널 열기"
            >
              <AccountCircleRoundedIcon />
            </IconButton>
            <IconButton size="large" onClick={onLogout}>
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>

          {/* 모바일: 중앙 로고 */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              height: "100%",
              alignItems: "center",
              zIndex: 1,
            }}
          >
            <Link
              href="/home"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              <Image
                src="/images/main_logo.png"
                alt="mainLogo"
                width={92}
                height={35}
                priority={false}
                style={{ height: 35, width: "auto" }}
              />
            </Link>
          </Box>

          {/* 모바일: 아바타 → 우측 드로어 */}
          <IconButton
            size="large"
            sx={{ display: { xs: "inline-flex", md: "none" }, ml: "auto" }}
            onClick={onAccountSidebarOpen}
            aria-label="계정 패널 열기"
          >
            <AccountCircleRoundedIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>

        {/* 모바일 전용 얇은 레드 라인 */}
        <Box
          sx={(t) => ({
            display: { xs: "block", md: "none" },
            height: 2,
            backgroundColor: t.palette.primary.main,
          })}
        />

        {/* 모바일 전용 정보 바 */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={3}
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "center",
            px: 1.25,
            py: 0.75,
            bgcolor: "rgba(255,255,255,0.04)",
            borderTop: "1px solid rgba(223,227,228,0.14)",
            borderBottom: "1px solid rgba(223,227,228,0.14)",
          }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            minWidth={0}
          >
            {/* 레벨 Chip */}
            <Chip
              label={`LV.${lv || 1}`}
              size="small"
              color="primary"
              sx={{
                height: 18,
                fontSize: 10,
                fontWeight: 700,
                "& .MuiChip-label": {
                  px: 0.75,
                },
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              {showSpinner ? (
                <CircularProgress size={12} thickness={5} sx={{ ml: 0.5 }} />
              ) : (
                nickname
              )}{" "}
              님
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => router.push("/message")}
          >
            <Badge
              badgeContent={message}
              color="error"
              max={99}
              overlap="circular"
              invisible={!message}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }}
            >
              <MailOutlineRoundedIcon />
            </Badge>
            <Typography sx={{ fontWeight: 700 }}>쪽지</Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => router.push("/event")}
          >
            <CardGiftcardRoundedIcon />
            <Typography sx={{ fontWeight: 700 }}>이벤트</Typography>
          </Stack>
        </Stack>

        {/* 모바일: 머니/포인트 바 */}
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            display: { xs: "flex", md: "none" },
            justifyContent: "center",
            px: 1.5,
            py: 1,
            gap: 1.5,
            bgcolor: "rgba(0,0,0,0.3)",
            borderTop: "1px solid rgba(223,227,228,0.14)",
            borderBottom: "1px solid rgba(223,227,228,0.14)",
          }}
        >
          <Box
            sx={(t) => ({
              flex: 1,
              display: "flex",
              justifyContent: "center",
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.primary.main,
                0.12
              )}, ${alpha(t.palette.primary.main, 0.08)})`,
              border: `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
              boxShadow: `0 2px 6px ${alpha(t.palette.primary.main, 0.15)}`,
            })}
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              minWidth={0}
            >
              <MonetizationOnRoundedIcon
                sx={{ color: "primary.main", fontSize: "1.1rem" }}
              />
              {showSpinner ? (
                <CircularProgress size={12} thickness={5} sx={{ ml: 0.5 }} />
              ) : (
                <Typography
                  color="primary"
                  variant="body2"
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={(t) => ({
                    textShadow: `0 1px 3px ${alpha(
                      t.palette.primary.main,
                      0.4
                    )}`,
                  })}
                >
                  {money?.toLocaleString()}
                </Typography>
              )}
            </Stack>
          </Box>

          <Box
            onClick={handlePointChange}
            sx={(t) => ({
              flex: 1,
              display: "flex",
              justifyContent: "center",
              px: 1.5,
              py: 0.75,
              borderRadius: 2,
              cursor: "pointer",
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.error.main,
                0.12
              )}, ${alpha(t.palette.error.main, 0.08)})`,
              border: `1px solid ${alpha(t.palette.error.main, 0.25)}`,
              boxShadow: `0 2px 6px ${alpha(t.palette.error.main, 0.15)}`,
              transition: "all .2s",
              "&:hover": {
                bgcolor: alpha(t.palette.error.main, 0.18),
                transform: "scale(1.03)",
                boxShadow: `0 4px 10px ${alpha(t.palette.error.main, 0.25)}`,
              },
            })}
            title="클릭하여 포인트를 머니로 전환"
          >
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              minWidth={0}
            >
              <LocalParkingRoundedIcon
                sx={{ color: "error.main", fontSize: "1.1rem" }}
              />
              {showSpinner || pointLoading ? (
                <CircularProgress size={12} thickness={5} sx={{ ml: 0.5 }} />
              ) : (
                <Typography
                  color="error"
                  variant="body2"
                  fontWeight={700}
                  fontSize="0.95rem"
                  sx={(t) => ({
                    textShadow: `0 1px 3px ${alpha(t.palette.error.main, 0.4)}`,
                  })}
                >
                  {point?.toLocaleString()}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* 데스크탑 전용 하단 라인/그라데이션 */}
        <Box
          sx={(t) => ({
            display: { xs: "none", md: "block" },
            position: "relative",
            height: 18,
            pointerEvents: "none",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 2,
              backgroundColor: t.palette.primary.main,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              right: 0,
              top: 2,
              height: 16,
              background: `linear-gradient(to bottom, ${alpha(
                t.palette.primary.main,
                0.45
              )} 0%, ${alpha(t.palette.primary.main, 0.18)} 55%, ${alpha(
                t.palette.primary.main,
                0.0
              )} 100%)`,
            },
          })}
        />
      </AppBar>
    </>
  );
};
