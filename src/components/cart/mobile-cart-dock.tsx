import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "src/redux/store";
import { clearCart } from "src/redux/slices/cartSlice";
import { NewCart } from "./new-cart";

const BAR_HEIGHT = 56;
const BTN_WIDTH = 100;

interface Props {
  gameCode?: string;
  game_Event?: string;
  userMoney?: number;
  mutate?: () => void;
  bonus?: {
    bonus: string;
    count: number;
  } | null;
  autoOpen?: boolean; // 첫 선택 시 자동 열기 여부 (기본값: true)
}

export default function MobileCartDock({
  gameCode,
  game_Event,
  userMoney,
  mutate,
  bonus,
  autoOpen = true,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const cartList = useSelector((state: RootState) => state.cart.items);

  const [open, setOpen] = React.useState(false);

  // 선택 개수 및 배당
  const count = cartList.length;
  const effectiveOdds = React.useMemo(() => {
    if (count === 0) return 1;
    const baseOdds = cartList.reduce((acc, item) => acc * +item.pickOdds, 1);
    return bonus?.bonus ? baseOdds * +bonus.bonus : baseOdds;
  }, [cartList, bonus]);

  // 첫 선택 시 자동 열기 (autoOpen이 true일 때만)
  const prevCountRef = React.useRef(0);
  React.useEffect(() => {
    if (autoOpen && count > 0 && prevCountRef.current === 0) {
      setOpen(true);
    }
    prevCountRef.current = count;
  }, [count, autoOpen]);

  if (!isMobile) return null;

  const buttonSx = {
    width: BTN_WIDTH,
    minWidth: BTN_WIDTH,
    px: 0,
  };

  return (
    <>
      {/* 하단 바 */}
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          height: BAR_HEIGHT,
          borderRadius: 0,
          px: 1.25,
          bgcolor: "background.paper",
          background:
            "linear-gradient(180deg, rgba(18, 18, 18, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)",
          color: "text.primary",
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          zIndex: (theme.zIndex.modal ?? 1300) + 2,
          borderTop: `3px solid ${theme.palette.primary.main}`,
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* 중앙 탭 - 열기 화살표 (닫혔을 때만 표시) */}
        {!open && (
          <Box
            role="button"
            aria-label="카트 열기"
            onClick={() => setOpen(true)}
            sx={{
              position: "absolute",
              top: -12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 50,
              height: 24,
              background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 6,
              borderBottomRightRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 -2px 8px rgba(0,0,0,0.4), 0 0 0 1px ${theme.palette.primary.light}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:active": {
                transform: "translateX(-50%) scale(0.95)",
              },
            }}
          >
            <KeyboardArrowUpIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
        )}

        {/* 좌측 정보 */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "text.secondary",
              fontSize: 13,
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            선택경기:{" "}
            <Typography
              component="span"
              sx={{ color: "primary.main", fontSize: 14, fontWeight: 700 }}
            >
              [{count}]
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: "text.secondary",
              fontSize: 13,
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            합산배당:{" "}
            <Typography
              component="span"
              sx={{ color: "primary.main", fontSize: 14, fontWeight: 700 }}
            >
              {effectiveOdds.toFixed(2)}
            </Typography>
          </Typography>
        </Stack>

        {/* 우측 버튼 */}
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => dispatch(clearCart())}
            sx={{
              ...buttonSx,
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "text.secondary",
              "&:hover": {
                borderColor: "error.main",
                color: "error.main",
                bgcolor: "rgba(211, 47, 47, 0.08)",
              },
            }}
          >
            비우기
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => setOpen(!open)}
            sx={buttonSx}
          >
            {open ? "닫기" : "열기"}
          </Button>
        </Stack>
      </Paper>

      {/* Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        hideBackdrop
        disableBackdropTransition
        disableSwipeToOpen
        sx={{
          pointerEvents: "none",
          zIndex: (theme) => (theme.zIndex.modal ?? 1300) - 1,
          "& .MuiDrawer-paper": { pointerEvents: "auto" },
        }}
        PaperProps={{
          sx: {
            borderRadius: 0,
            bgcolor: "background.default",
            background:
              "linear-gradient(180deg, rgba(18, 18, 18, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)",
            color: "text.primary",
            borderTop: `3px solid ${theme.palette.primary.main}`,
            marginBottom: `calc(${BAR_HEIGHT}px + env(safe-area-inset-bottom))`,
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box sx={{ position: "relative", height: "65vh" }}>
          {/* 닫기 화살표 - 최상단 중앙 */}
          <Box
            role="button"
            aria-label="카트 닫기"
            onClick={() => setOpen(false)}
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 50,
              height: 22,
              background: `linear-gradient(180deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px ${theme.palette.primary.light}`,
              cursor: "pointer",
              zIndex: 10,
              transition: "all 0.2s ease",
              "&:active": {
                transform: "translateX(-50%) scale(0.95)",
              },
            }}
          >
            <KeyboardArrowDownIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>

          {/* 카트 내용 */}
          <Box sx={{ p: 1, pt: 3, height: "100%", overflow: "auto" }}>
            <NewCart
              gameCode={gameCode}
              game_Event={game_Event}
              userMoney={userMoney}
              onClose={() => setOpen(false)}
              mutate={mutate}
              bonus={bonus}
            />
          </Box>
        </Box>
      </SwipeableDrawer>
    </>
  );
}
