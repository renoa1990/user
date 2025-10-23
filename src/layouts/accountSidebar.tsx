import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useRouter } from "next/router";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import LocalParkingRoundedIcon from "@mui/icons-material/LocalParkingRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import Badge from "@mui/material/Badge";
import TelegramBanner from "@components/TelegramBanner";

interface Props {
  open: boolean;
  onClose: () => void;
  nickname?: string;
  money?: number;
  point?: string;
  lv?: string;
  message?: number;
  contact?: number;
}

const AccountSidebar = ({
  open,
  onClose,
  nickname,
  money,
  point,
  lv,
  message,
  contact,
}: Props): JSX.Element => {
  const router = useRouter();
  const [logout, { data, loading }] = useMutation("/api/users/logout");
  const [pointChange, { data: pointData, loading: pointLoading }] = useMutation(
    "/api/sidebar/userdata/pointchange"
  );
  const { enqueueSnackbar } = useSnackbar();

  const showSpinner = false;
  const pathname = router.pathname;

  const onLogout = () => {
    if (loading) return;
    logout({});
  };

  React.useEffect(() => {
    if (data && data.ok) {
      enqueueSnackbar("로그아웃 되었습니다", {
        variant: "success",
      });
      router.replace("/");
      onClose();
    }
  }, [data]);

  const handlePointChange = () => {
    if (pointLoading) return;
    pointChange({});
  };

  React.useEffect(() => {
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

  const closeAccountAndGo = (path: string) => {
    onClose();
    router.push(path);
  };

  const isActive = (path: string) =>
    pathname === path || pathname.includes(path);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
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
      {/* 헤더 */}
      <Paper elevation={0} sx={{ borderRadius: 0 }}>
        <Box
          sx={{
            px: 1.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* 레벨 Chip */}
          <Chip
            label={`LV.${lv || 1}`}
            size="small"
            color="primary"
            sx={{
              height: 24,
              fontSize: 12,
              fontWeight: 700,
              mr: 1,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
          <Typography variant="subtitle1" fontWeight={600}>
            {showSpinner ? "로딩중..." : `${nickname ?? "회원"} 님`}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ ml: "auto" }}
            aria-label="닫기"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={(t) => ({ height: 2, bgcolor: t.palette.primary.main })} />
      </Paper>

      {/* 잔액 카드 */}
      <Paper
        elevation={1}
        sx={(t) => ({
          mx: 1,
          my: 1,
          p: 2,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${alpha(
            t.palette.background.paper,
            1
          )}, ${alpha(t.palette.background.default, 0.8)})`,
          border: `1px solid ${alpha(t.palette.divider, 0.1)}`,
        })}
      >
        {/* 보유머니 - 한 줄 전체 */}
        <Stack direction="column" spacing={1} mb={1.5}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <MonetizationOnRoundedIcon fontSize="small" color="primary" />
            <Typography variant="body2" color="inherit" fontWeight={600}>
              보유머니
            </Typography>
          </Stack>
          <Box
            sx={(t) => ({
              width: "100%",
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.primary.main,
                0.12
              )}, ${alpha(t.palette.primary.main, 0.08)})`,
              border: `1px solid ${alpha(t.palette.primary.main, 0.25)}`,
              boxShadow: `0 2px 6px ${alpha(t.palette.primary.main, 0.15)}`,
            })}
          >
            <Typography
              variant="h4"
              color="primary"
              fontWeight={700}
              textAlign="center"
              sx={(t) => ({
                textShadow: `0 2px 4px ${alpha(t.palette.primary.main, 0.3)}`,
                letterSpacing: 0.5,
              })}
            >
              {showSpinner ? "…" : `${money?.toLocaleString()} 원`}
            </Typography>
          </Box>
        </Stack>

        {/* 포인트 - 한 줄 전체 */}
        <Stack direction="column" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <LocalParkingRoundedIcon
              fontSize="small"
              sx={{ color: "error.main" }}
            />
            <Typography variant="body2" color="inherit" fontWeight={600}>
              보유포인트
            </Typography>
            <Chip
              label="클릭하여 전환"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.625rem",
                fontWeight: 600,
                bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                color: "error.main",
              }}
            />
          </Stack>
          <Box
            onClick={handlePointChange}
            sx={(t) => ({
              width: "100%",
              cursor: "pointer",
              transition: "all .2s",
              px: 2,
              py: 1.5,
              borderRadius: 2,
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.error.main,
                0.12
              )}, ${alpha(t.palette.error.main, 0.08)})`,
              border: `1px solid ${alpha(t.palette.error.main, 0.25)}`,
              boxShadow: `0 2px 6px ${alpha(t.palette.error.main, 0.15)}`,
              "&:hover": {
                bgcolor: alpha(t.palette.error.main, 0.18),
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${alpha(t.palette.error.main, 0.25)}`,
              },
            })}
            title="클릭하여 포인트를 머니로 전환"
          >
            <Typography
              variant="h5"
              color="error"
              fontWeight={700}
              textAlign="center"
              sx={(t) => ({
                textShadow: `0 2px 4px ${alpha(t.palette.error.main, 0.3)}`,
                letterSpacing: 0.5,
              })}
            >
              {showSpinner || pointLoading
                ? "처리중..."
                : `${point?.toLocaleString()} 포인트`}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* 빠른 메뉴 - 충전/환전 */}
      <Paper elevation={1} sx={{ mx: 1, mb: 1, pt: 2, pb: 2 }}>
        <Stack direction="row" spacing={2} px={2}>
          <Box
            sx={(t) => ({
              flex: 1,
              cursor: "pointer",
              textAlign: "center",
              py: 2,
              borderRadius: 2,
              transition: "all 0.2s ease",
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.error.main,
                0.1
              )}, ${alpha(t.palette.error.main, 0.05)})`,
              border: `1px solid ${alpha(t.palette.error.main, 0.2)}`,
              "&:hover": {
                bgcolor: alpha(t.palette.error.main, 0.15),
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${alpha(t.palette.error.main, 0.2)}`,
              },
            })}
            onClick={() => closeAccountAndGo("/deposit")}
          >
            <CreditCardRoundedIcon
              color="error"
              sx={{ fontSize: 32, mb: 0.5 }}
            />
            <Typography color="error" fontWeight={700} fontSize="0.95rem">
              충전
            </Typography>
          </Box>
          <Box
            sx={(t) => ({
              flex: 1,
              cursor: "pointer",
              textAlign: "center",
              py: 2,
              borderRadius: 2,
              transition: "all 0.2s ease",
              bgcolor: `linear-gradient(135deg, ${alpha(
                t.palette.primary.main,
                0.1
              )}, ${alpha(t.palette.primary.main, 0.05)})`,
              border: `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              "&:hover": {
                bgcolor: alpha(t.palette.primary.main, 0.15),
                transform: "translateY(-2px)",
                boxShadow: `0 4px 12px ${alpha(t.palette.primary.main, 0.2)}`,
              },
            })}
            onClick={() => closeAccountAndGo("/withdraw")}
          >
            <SwapHorizRoundedIcon
              color="primary"
              sx={{ fontSize: 32, mb: 0.5 }}
            />
            <Typography color="primary" fontWeight={700} fontSize="0.95rem">
              환전
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* 링크 리스트 */}
      <Paper elevation={1} sx={{ mx: 1, mb: 1, py: 1, overflow: "hidden" }}>
        <List dense sx={{ py: 0 }}>
          {/* 공지사항 */}
          <ListItemButton
            onClick={() => closeAccountAndGo("/infomation")}
            selected={isActive("/infomation")}
            sx={(t) => ({
              "&.Mui-selected": {
                bgcolor: `${t.palette.primary.main}22`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                "& .MuiSvgIcon-root": {
                  color: t.palette.primary.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.primary.main,
                },
              },
            })}
          >
            <CampaignRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="공지사항"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
          </ListItemButton>

          {/* 고객센터 */}
          <ListItemButton
            onClick={() => closeAccountAndGo("/contact")}
            selected={isActive("/contact")}
            sx={(t) => ({
              position: "relative",
              "&.Mui-selected": {
                bgcolor: `${t.palette.primary.main}22`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                "& .MuiSvgIcon-root": {
                  color: t.palette.primary.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.primary.main,
                },
              },
            })}
          >
            <HeadsetMicRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="고객센터"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            {contact && Number(contact) > 0 && (
              <Chip
                label={Number(contact) > 99 ? "99+" : Number(contact)}
                size="small"
                sx={(t) => ({
                  height: 22,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  bgcolor: t.palette.error.main,
                  color: "white",
                  boxShadow: `0 2px 4px ${alpha(t.palette.error.main, 0.4)}`,
                  animation: "pulse 2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                    "50%": {
                      transform: "scale(1.08)",
                      opacity: 0.95,
                    },
                  },
                })}
              />
            )}
          </ListItemButton>

          {/* 쪽지 */}
          <ListItemButton
            onClick={() => closeAccountAndGo("/message")}
            selected={isActive("/message")}
            sx={(t) => ({
              position: "relative",
              "&.Mui-selected": {
                bgcolor: `${t.palette.primary.main}22`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                "& .MuiSvgIcon-root": {
                  color: t.palette.primary.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.primary.main,
                },
              },
            })}
          >
            <MailOutlineRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="쪽지"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
            {message && Number(message) > 0 && (
              <Chip
                label={Number(message) > 99 ? "99+" : Number(message)}
                size="small"
                sx={(t) => ({
                  height: 22,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  bgcolor: t.palette.error.main,
                  color: "white",
                  boxShadow: `0 2px 4px ${alpha(t.palette.error.main, 0.4)}`,
                  animation: "pulse 2s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      transform: "scale(1)",
                      opacity: 1,
                    },
                    "50%": {
                      transform: "scale(1.08)",
                      opacity: 0.95,
                    },
                  },
                })}
              />
            )}
          </ListItemButton>

          {/* 베팅내역 */}
          <ListItemButton
            onClick={() => closeAccountAndGo("/bettinglist")}
            selected={isActive("/bettinglist")}
            sx={(t) => ({
              "&.Mui-selected": {
                bgcolor: `${t.palette.primary.main}22`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                "& .MuiSvgIcon-root": {
                  color: t.palette.primary.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.primary.main,
                },
              },
            })}
          >
            <ReceiptLongRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="베팅내역"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
          </ListItemButton>

          {/* 이벤트 */}
          <ListItemButton
            onClick={() => closeAccountAndGo("/event")}
            selected={isActive("/event")}
            sx={(t) => ({
              "&.Mui-selected": {
                bgcolor: `${t.palette.primary.main}22`,
                borderLeft: `3px solid ${t.palette.primary.main}`,
                "& .MuiSvgIcon-root": {
                  color: t.palette.primary.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.primary.main,
                },
              },
            })}
          >
            <CardGiftcardRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="이벤트"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
          </ListItemButton>

          {/* 로그아웃 */}
          <ListItemButton
            onClick={onLogout}
            sx={(t) => ({
              mt: 1,
              pt: 1.5,
              borderTop: `1px solid ${alpha(t.palette.divider, 0.2)}`,
              "&:hover": {
                bgcolor: alpha(t.palette.error.main, 0.08),
                "& .MuiSvgIcon-root": {
                  color: t.palette.error.main,
                },
                "& .MuiListItemText-primary": {
                  color: t.palette.error.main,
                },
              },
            })}
          >
            <LogoutRoundedIcon sx={{ mr: 1, fontSize: 22 }} />
            <ListItemText
              primary="로그아웃"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600 }}
            />
          </ListItemButton>
        </List>
      </Paper>

      {/* 텔레그램 배너 */}
      <Paper elevation={1} sx={{ mx: 1, mb: 1, p: 1 }}>
        <Box sx={{ mx: 0 }}>
          <TelegramBanner />
        </Box>
      </Paper>
    </Drawer>
  );
};

export default AccountSidebar;
