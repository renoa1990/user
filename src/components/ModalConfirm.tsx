import { Close } from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ThemeProvider,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useRef } from "react";
import { create } from "zustand";

type ModalConfirmStore = {
  variant: string | null;
  title: string;
  message: string;
  onsubmit?: (id?: number, fee?: number) => void | string;
  id?: number;
  fee?: number;
  close: () => void;
};

const useModalConfirmStore = create<ModalConfirmStore>((set) => ({
  variant: null,
  title: "",
  message: "",
  onsubmit: undefined,
  id: undefined,
  fee: undefined,
  close: () => {
    set({
      variant: null,
    });
  },
}));

export const modalConfirm = (
  variant: string | null,
  title: string,
  message: string,
  onsubmit?: (id: number | undefined) => void | string,
  id?: number,
  fee?: number
) => {
  useModalConfirmStore.setState({
    variant,
    title,
    message,
    onsubmit,
    id,
    fee,
  });
};

const ModalConfirm: React.FC = () => {
  const { variant, title, message, onsubmit, id, fee, close } =
    useModalConfirmStore();
  const theme = useTheme();

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && buttonRef.current) {
      event.preventDefault(); // 기본 엔터 동작 방지
      buttonRef.current.click(); // 버튼 클릭 동작 수행
    }
  };
  useEffect(() => {
    // 팝업이 열릴 때, 엔터 키를 눌렀을 때 버튼 클릭 이벤트 수행
    if (variant) {
      document.addEventListener("keypress", handleKeyPress);
    } else {
      document.removeEventListener("keypress", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [variant]);

  const domain = () => {
    const clientSideDomain = window.location.hostname.replace(
      /^(https?|www\.)+/,
      ""
    );
    return clientSideDomain;
  };

  // 아이콘 선택
  const getIcon = () => {
    switch (variant) {
      case "success":
        return (
          <CheckCircleRoundedIcon
            sx={{ fontSize: 56, color: "success.main", mb: 2 }}
          />
        );
      case "confirm":
        return (
          <WarningRoundedIcon
            sx={{ fontSize: 56, color: "warning.main", mb: 2 }}
          />
        );
      default:
        return (
          <InfoRoundedIcon sx={{ fontSize: 56, color: "info.main", mb: 2 }} />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={Boolean(variant)}
        onClose={close}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.90)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "background.paper",
            background: (t) =>
              `linear-gradient(135deg, ${alpha(
                t.palette.background.paper,
                0.98
              )} 0%, ${alpha(t.palette.background.default, 0.98)} 100%)`,
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
            boxShadow: (t) =>
              `0 8px 32px ${alpha(
                t.palette.common.black,
                0.4
              )}, 0 0 0 1px ${alpha(t.palette.primary.main, 0.1)}`,
            overflow: "visible",
          },
        }}
      >
        {/* 닫기 버튼 */}
        <Box
          sx={{
            position: "absolute",
            top: -12,
            right: -12,
            zIndex: 1,
          }}
        >
          <IconButton
            onClick={close}
            sx={(t) => ({
              bgcolor: "background.paper",
              border: `2px solid ${alpha(t.palette.divider, 0.2)}`,
              boxShadow: `0 2px 8px ${alpha(t.palette.common.black, 0.3)}`,
              width: 36,
              height: 36,
              transition: "all .2s",
              "&:hover": {
                bgcolor: "error.main",
                borderColor: "error.main",
                transform: "rotate(90deg)",
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
              },
            })}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* 내용 */}
        <Box
          sx={{
            pt: 4,
            pb: 2,
            px: 3,
            textAlign: "center",
          }}
        >
          {/* 아이콘 */}
          {getIcon()}

          {/* 제목 */}
          <DialogTitle
            sx={{
              p: 0,
              mb: 1.5,
              fontSize: 22,
              fontWeight: 700,
              color: "text.primary",
            }}
          >
            {title}
          </DialogTitle>

          {/* 메시지 */}
          <DialogContent sx={{ p: 0, mb: 2 }}>
            <DialogContentText
              sx={{
                color: "text.secondary",
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              {variant === "soundCheck" ? (
                <>
                  아래 링크로 이동하여 url을 추가해주세요. <br />
                  이동할 주소:chrome://settings/content/sound <br />
                  추가할 링크:[*.]{domain()}{" "}
                </>
              ) : (
                message
              )}
            </DialogContentText>
          </DialogContent>
        </Box>
        {/* 버튼 */}
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 0,
            gap: 1.5,
            justifyContent: "center",
          }}
        >
          {variant === "confirm" ? (
            <>
              <Button
                variant="outlined"
                size="large"
                onClick={close}
                sx={(t) => ({
                  flex: 1,
                  py: 1.25,
                  fontSize: 15,
                  fontWeight: 700,
                  borderWidth: 2,
                  borderColor: alpha(t.palette.divider, 0.3),
                  color: "text.secondary",
                  textTransform: "none",
                  borderRadius: 2,
                  transition: "all .2s",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: alpha(t.palette.error.main, 0.5),
                    bgcolor: alpha(t.palette.error.main, 0.08),
                    color: "error.main",
                    transform: "translateY(-2px)",
                  },
                })}
              >
                취소
              </Button>
              <Button
                variant="contained"
                size="large"
                ref={buttonRef}
                onClick={() => {
                  if (onsubmit) {
                    if (id !== undefined) {
                      onsubmit(id, fee);
                    } else {
                      onsubmit(undefined);
                    }
                  }
                  close();
                }}
                sx={(t) => ({
                  flex: 1,
                  py: 1.25,
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                  boxShadow: `0 4px 12px ${alpha(t.palette.primary.main, 0.4)}`,
                  transition: "all .2s",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`,
                    boxShadow: `0 6px 20px ${alpha(
                      t.palette.primary.main,
                      0.6
                    )}`,
                    transform: "translateY(-2px)",
                  },
                })}
              >
                확인
              </Button>
            </>
          ) : variant === "success" ? (
            <>
              <Button
                variant="contained"
                size="large"
                ref={buttonRef}
                onClick={() => {
                  if (onsubmit) {
                    if (id !== undefined) {
                      onsubmit(id);
                    } else {
                      onsubmit(undefined);
                    }
                  }
                  close();
                }}
                sx={(t) => ({
                  flex: 1,
                  py: 1.25,
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${t.palette.success.main}, ${t.palette.success.dark})`,
                  boxShadow: `0 4px 12px ${alpha(t.palette.success.main, 0.4)}`,
                  transition: "all .2s",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${t.palette.success.light}, ${t.palette.success.main})`,
                    boxShadow: `0 6px 20px ${alpha(
                      t.palette.success.main,
                      0.6
                    )}`,
                    transform: "translateY(-2px)",
                  },
                })}
              >
                확인
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={close}
                ref={buttonRef}
                sx={(t) => ({
                  flex: 1,
                  py: 1.25,
                  fontSize: 15,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                  boxShadow: `0 4px 12px ${alpha(t.palette.primary.main, 0.4)}`,
                  transition: "all .2s",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${t.palette.primary.light}, ${t.palette.primary.main})`,
                    boxShadow: `0 6px 20px ${alpha(
                      t.palette.primary.main,
                      0.6
                    )}`,
                    transform: "translateY(-2px)",
                  },
                })}
              >
                확인
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ModalConfirm;
