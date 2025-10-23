import React, { FC, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { eventPoint } from "@prisma/client";
import moment from "moment";
import numeral from "numeral";
import { LoadingButton } from "@mui/lab";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

interface props {
  list?: eventPoint[];
  mutate: () => void;
}

interface mutate {
  ok: boolean;
  application: boolean;
}

export const CalendarEventPointList: FC<props> = (props) => {
  const { list, mutate } = props;
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [Application, { data, loading }] = useMutation<mutate>(
    `/api/event/calendar/application`
  );

  const onclick = (id: number) => {
    if (loading) return;
    Application({ id });
  };

  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (data.application) {
          enqueueSnackbar("신청이 완료되었습니다.", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("이미 신청되었거나 신청할수 없습니다", {
            variant: "warning",
          });
        }
      } else {
        enqueueSnackbar("오류가 발생하였습니다", {
          variant: "error",
        });
      }
      mutate();
    }
  }, [data, mutate, enqueueSnackbar]);

  const getStatusChip = (item: eventPoint) => {
    if (!item.application) {
      return (
        <Chip
          icon={<HourglassEmptyIcon />}
          label="미신청"
          size="small"
          color="default"
        />
      );
    }
    if (item.application && item.confirm === null) {
      return (
        <Chip
          icon={<HourglassEmptyIcon />}
          label="신청완료"
          size="small"
          color="info"
        />
      );
    }
    if (item.application && item.confirm === false) {
      return (
        <Chip icon={<CancelIcon />} label="취소됨" size="small" color="error" />
      );
    }
    return (
      <Chip
        icon={<CheckCircleIcon />}
        label="지급완료"
        size="small"
        color="success"
      />
    );
  };

  if (!list || list.length === 0) {
    return (
      <Box
        py={8}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography color="text.secondary">이벤트 현황이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {list.map((item) => (
        <Paper
          key={item.id}
          elevation={0}
          sx={{
            p: 2,
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: 2,
              borderColor: "primary.main",
            },
          }}
        >
          {isMobile ? (
            // 모바일 레이아웃
            <Stack spacing={1.5}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {item.eventname}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    ml={0.5}
                  >
                    ({item.memo})
                  </Typography>
                </Typography>
                {getStatusChip(item)}
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <MonetizationOnIcon fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  {numeral(item.point).format("0,0")} P
                </Typography>
              </Box>

              {item.confirmDate && (
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {moment(item.confirmDate).format("YYYY.MM.DD HH:mm")}
                  </Typography>
                </Box>
              )}

              {!item.application && (
                <LoadingButton
                  fullWidth
                  loading={loading}
                  variant="contained"
                  color="primary"
                  onClick={() => onclick(item.id)}
                >
                  신청하기
                </LoadingButton>
              )}
            </Stack>
          ) : (
            // 데스크톱 레이아웃
            <Box display="flex" alignItems="center" gap={2}>
              <Box flex={1} minWidth={0}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {item.eventname}
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    ml={0.5}
                  >
                    ({item.memo})
                  </Typography>
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5} minWidth={100}>
                <MonetizationOnIcon fontSize="small" color="primary" />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="primary.main"
                >
                  {numeral(item.point).format("0,0")} P
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5} minWidth={180}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {item.confirmDate
                    ? moment(item.confirmDate).format("YYYY.MM.DD HH:mm")
                    : "-"}
                </Typography>
              </Box>

              <Box minWidth={120}>
                {!item.application ? (
                  <LoadingButton
                    loading={loading}
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => onclick(item.id)}
                    fullWidth
                  >
                    신청하기
                  </LoadingButton>
                ) : (
                  getStatusChip(item)
                )}
              </Box>
            </Box>
          )}
        </Paper>
      ))}
    </Stack>
  );
};
