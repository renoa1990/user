import React, { FC, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import {
  DeleteOutline,
  CancelOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  AccessTimeOutlined,
  AccountBalanceWalletOutlined,
  CardGiftcardOutlined,
} from "@mui/icons-material";
import { Money } from "@prisma/client";
import moment from "moment";
import numeral from "numeral";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { modalConfirm } from "@components/ModalConfirm";

interface Props {
  list?: Money[];
  mutate: () => void;
}

interface DeleteItem {
  ok: boolean;
  deleteitem: boolean;
  nothing: boolean;
}

interface CancleItem {
  ok: boolean;
  cancleitem: boolean;
  nothing: boolean;
}

// 스타일드 컴포넌트들
const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(2),
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
    transform: "translateY(-2px)",
  },
  "&.completed": {
    borderColor: alpha(theme.palette.success.main, 0.3),
    backgroundColor: alpha(theme.palette.success.main, 0.02),
  },
  "&.pending": {
    borderColor: alpha(theme.palette.warning.main, 0.3),
    backgroundColor: alpha(theme.palette.warning.main, 0.02),
  },
  "&.cancelled": {
    borderColor: alpha(theme.palette.error.main, 0.3),
    backgroundColor: alpha(theme.palette.error.main, 0.02),
    opacity: 0.7,
  },
}));

const StatusChip = styled(Chip)<{
  status: "completed" | "pending" | "cancelled";
}>(({ theme, status }) => ({
  height: 28,
  fontSize: "0.75rem",
  fontWeight: 600,
  borderRadius: 8,
  ...(status === "completed" && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === "pending" && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(status === "cancelled" && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
  }),
}));

export const DepositListNew: FC<Props> = ({ list, mutate }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [DeleteItem, { loading: DeleteLoading, data: DeleteData }] =
    useMutation<DeleteItem>(`/api/deposit/delete`);

  const [CancleItem, { loading: CancleLoading, data: CancleData }] =
    useMutation<CancleItem>(`/api/deposit/cancel`);

  const onclick = (id: number) => {
    if (DeleteLoading) return;
    modalConfirm(
      "confirm",
      "삭제",
      "한번 삭제하면 되돌릴수 없습니다. 삭제하시겠습니까?",
      onDelete,
      id
    );
  };

  const onDelete = (id: number | undefined) => {
    if (DeleteLoading) return;
    DeleteItem({ id });
  };

  const onCancel = (id: number | undefined) => {
    if (CancleLoading) return;
    CancleItem({ id });
  };

  useEffect(() => {
    if (DeleteData) {
      if (DeleteData.ok) {
        if (DeleteData.deleteitem) {
          enqueueSnackbar("삭제가 완료되었습니다.", {
            variant: "success",
          });
        } else if (DeleteData.nothing) {
          enqueueSnackbar("이미 삭제된 데이터입니다", {
            variant: "warning",
          });
        } else {
          enqueueSnackbar("삭제할수 없습니다", {
            variant: "error",
          });
        }
        mutate();
      } else {
        enqueueSnackbar("오류가 발생하였습니다", {
          variant: "error",
        });
      }
    }
  }, [DeleteData, enqueueSnackbar, mutate]);

  useEffect(() => {
    if (CancleData) {
      if (CancleData.ok) {
        if (CancleData.cancleitem) {
          enqueueSnackbar("취소가 완료되었습니다.", {
            variant: "success",
          });
        } else if (CancleData.nothing) {
          enqueueSnackbar("이미 취소 되었거나 취소할수없는 상태입니다", {
            variant: "warning",
          });
        } else {
          enqueueSnackbar("취소할수 없습니다", {
            variant: "error",
          });
        }
        mutate();
      } else {
        enqueueSnackbar("오류가 발생하였습니다", {
          variant: "error",
        });
      }
    }
  }, [CancleData, enqueueSnackbar, mutate]);

  if (!list || list.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
        }}
      >
        <AccountBalanceWalletOutlined
          sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="body1" color="text.secondary">
          충전 내역이 없습니다
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ px: { xs: 1, md: 0 }, pb: 3 }}>
      {list.map((item) => {
        const status: "completed" | "pending" | "cancelled" =
          item.confirm === true
            ? "completed"
            : item.confirm === null
            ? "pending"
            : "cancelled";

        const statusIcon =
          status === "completed" ? (
            <CheckCircleOutlined sx={{ fontSize: 20 }} />
          ) : status === "pending" ? (
            <HourglassEmptyOutlined sx={{ fontSize: 20 }} />
          ) : (
            <CancelOutlined sx={{ fontSize: 20 }} />
          );

        return (
          <HistoryCard key={item.id} className={status}>
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                {/* 왼쪽: 금액 & 상태 */}
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h5" fontWeight="bold">
                        {numeral(item.Money).format("0,0")}
                        <Typography
                          component="span"
                          variant="body1"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          원
                        </Typography>
                      </Typography>
                    </Box>

                    {item.Point && +item.Point > 0 && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CardGiftcardOutlined
                          sx={{ fontSize: 16, color: "success.main" }}
                        />
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={600}
                        >
                          보너스: {numeral(item.Point).format("0,0")}원
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTimeOutlined
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        신청: {moment(item.createAt).format("MM/DD HH:mm:ss")}
                      </Typography>
                    </Box>

                    {item.updateAt && (
                      <Box
                        sx={{
                          display: { xs: "flex", md: "flex" },
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AccessTimeOutlined
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          처리: {moment(item.updateAt).format("MM/DD HH:mm:ss")}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* 오른쪽: 상태 & 액션 */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                  }}
                >
                  <StatusChip
                    icon={statusIcon}
                    label={
                      status === "completed"
                        ? "완료"
                        : status === "pending"
                        ? "대기중"
                        : "취소됨"
                    }
                    status={status}
                  />

                  {/* 액션 버튼 */}
                  <Box>
                    {item.confirm === true || item.confirm === false ? (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteOutline />}
                        onClick={() => onclick(item.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        삭제
                      </Button>
                    ) : item.admincheck === false ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        startIcon={<CancelOutlined />}
                        onClick={() => {
                          if (CancleLoading) return;
                          modalConfirm(
                            "confirm",
                            "취소",
                            "신청을 취소하시겠습니까?",
                            onCancel,
                            item.id
                          );
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        취소
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </HistoryCard>
        );
      })}
    </Stack>
  );
};

export default DepositListNew;





