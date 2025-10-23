import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Grid,
  alpha,
  styled,
  useTheme,
  Divider,
  CircularProgress,
} from "@mui/material";
import { AccountBalanceOutlined, InfoOutlined } from "@mui/icons-material";
import { Money, MoneySetup } from "@prisma/client";
import { MoneyDial } from "@components/moneydial/moneydial";
import WithdrawListNew from "./withdraw-list-new";
import WithdrawModal, { SetModal } from "./withdraw-modal.tsx";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { modalConfirm } from "@components/ModalConfirm";
import LabeledRow from "@/components/LabelRow";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import CasinoIcon from "@mui/icons-material/Casino";

interface Props {
  setup: MoneySetup;
  bank: string;
  money: number;
  list?: Money[];
  rolling?: {
    sportsRolling: number;
    minigameRolling: number;
    casinoRolling: number;
    slotRolling: number;
  };
  mutate: () => void;
}

interface Mut {
  ok: boolean;
  withdraw: boolean;
  message?: string;
}

// 스타일드 컴포넌트들
const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.warning.main, 0.03),
  boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.08)}`,
  marginBottom: theme.spacing(3),
}));

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  marginBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
  padding: theme.spacing(2.5),
  color: theme.palette.error.contrastText,
  borderRadius: "16px 16px 0 0",
}));

const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
}));

const RollingChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  height: 32,
}));

export const WithdrawPageNew: FC<Props> = ({
  setup,
  bank,
  money,
  list,
  rolling,
  mutate,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [amount, setAmount] = useState<number>(0);
  const [withdraw, { loading, data: mutData }] =
    useMutation<Mut>("/api/withdraw");
  const nf = new Intl.NumberFormat("ko-KR");
  const [isLoading, setIsLoading] = useState(false);

  const isNumeric = (value: any) => {
    return /^[0-9]+$/.test(value);
  };

  const onClick = () => {
    if (!amount || amount < 0) {
      modalConfirm("error", `출금신청`, "올바른 금액을 입력하세요");
      setAmount(0);
      return;
    }
    if (money < amount) {
      modalConfirm(
        "error",
        `출금신청`,
        "보유머니보다 많은금액을 신청할수 없습니다"
      );
      setAmount(0);
      return;
    }
    if (!isNumeric(amount)) {
      modalConfirm("error", `출금신청`, "숫자만 입력해주세요");
      setAmount(0);
      return;
    }

    SetModal("withrawPassword", `출금신청`, amount, onSubmit);
  };

  const onSubmit = (password: string) => {
    if (loading) return;
    withdraw({ amount, password });
  };

  useEffect(() => {
    if (mutData) {
      if (mutData.ok) {
        if (mutData.withdraw) {
          enqueueSnackbar("출금 신청이 완료되었습니다.", {
            variant: "success",
          });
          setAmount(0);
        } else if (mutData.message) {
          modalConfirm("error", `출금신청`, `${mutData.message}`);
        } else {
          enqueueSnackbar(`오류가 발생하였습니다`, {
            variant: "error",
          });
        }
        mutate();
      }
    }
  }, [mutData, enqueueSnackbar, mutate]);

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      <WithdrawModal />

      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          환전신청
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceOutlined color="error" />
          <Typography variant="body1" color="text.secondary">
            빠르고 안전한 환전 서비스
          </Typography>
        </Box>
      </Box>

      {/* 안내 사항 */}
      <InfoCard>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoOutlined color="warning" />
              <Typography variant="h6" fontWeight="bold">
                환전 안내
              </Typography>
            </Box>
            <Divider />
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  환전 최소금액은{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    {setup ? (
                      nf.format(setup.minWithdraw)
                    ) : (
                      <CircularProgress size={12} />
                    )}
                    원
                  </Box>
                  이며,{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    10,000원
                  </Box>{" "}
                  단위로 출금 가능합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  1회 최대 환전 가능금액은{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    {setup ? (
                      nf.format(setup.maxWithdraw)
                    ) : (
                      <CircularProgress size={12} />
                    )}
                    원
                  </Box>
                  이며, 1일 최대 환전금액은{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "error.main" }}
                  >
                    {setup ? (
                      nf.format(setup.withdrawLimitPrice)
                    ) : (
                      <CircularProgress size={12} />
                    )}
                    원
                  </Box>
                  이며 1일 총 {nf.format(setup.withdrawLimitNum)}회 이용
                  가능합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  환전은 마지막 환전 시간으로부터{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    {nf.format(setup.withdrawTime)}시간
                  </Box>{" "}
                  마다 이용 가능합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  24시간 자유롭게 환전이 가능하며 소요시간은 약 5분~10분 가량
                  소요됩니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  게시판{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    환전규정
                  </Box>
                  을 준수하며, 최대한 빠른 환전 도와드리고 있습니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  본인명의 계좌가 아닐경우 환전은{" "}
                  <Box
                    component="span"
                    sx={{ color: "error.main", fontWeight: 700 }}
                  >
                    절대불가
                  </Box>{" "}
                  합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  환전계좌는 반드시 가입하신{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    본인명의 계좌
                  </Box>
                  여야 합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  환전계좌 변경은{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    고객센터
                  </Box>
                  로 문의바라며 본인명의 계좌만 가능합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  환전지연은{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    인터넷 및 계좌입력오류
                  </Box>{" "}
                  일 수 있으며, 쪽지로 안내드립니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  각 은행 점검시간으로 인해 출금이 제한될 수 있으니, 점검시간을
                  피해 신청해 주시기 바랍니다.
                </Typography>
              </li>
            </Box>
          </Stack>
        </CardContent>
      </InfoCard>

      {/* 환전 신청 폼 */}
      <ActionCard>
        <HeaderBox>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceOutlined sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              환전 신청
            </Typography>
          </Box>
        </HeaderBox>
        <CardContent sx={{ p: { md: 4, xs: 0 } }}>
          <Stack spacing={3}>
            {/* 환전 계좌 */}
            <LabeledRow label="환전계좌" labelMd={2}>
              <Box
                sx={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1.5,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.grey[500], 0.05),
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={18} thickness={5} />
                ) : (
                  bank
                )}
              </Box>
            </LabeledRow>

            {/* 롤링 상태 */}
            <LabeledRow label="롤링상태" labelMd={2}>
              <Grid container spacing={1.5}>
                <Grid item xs={6} md={3}>
                  <RollingChip
                    icon={<SportsBaseballIcon />}
                    label={`스포츠 ${
                      rolling ? nf.format(rolling.sportsRolling) : 0
                    }%`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <RollingChip
                    icon={<SportsEsportsIcon />}
                    label={`미니게임 ${
                      rolling ? nf.format(rolling.minigameRolling) : 0
                    }%`}
                    color="secondary"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <RollingChip
                    icon={<CasinoIcon />}
                    label={`카지노 ${
                      rolling ? nf.format(rolling.casinoRolling) : 0
                    }%`}
                    color="success"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <RollingChip
                    icon={<CasinoIcon />}
                    label={`슬롯 ${
                      rolling ? nf.format(rolling.slotRolling) : 0
                    }%`}
                    color="info"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </LabeledRow>

            {/* 신청 금액 */}
            <MoneyDial
              type="withdraw"
              amount={amount}
              setAmount={setAmount}
              onSubmit={onClick}
              loading={loading}
            />
          </Stack>
        </CardContent>
      </ActionCard>

      {/* 환전 내역 */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            px: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 24,
              bgcolor: "error.main",
              borderRadius: 1,
            }}
          />
          <Typography variant="h6" fontWeight={600}>
            출금 내역
          </Typography>
          <Chip
            label="최근 10건"
            size="small"
            sx={{
              ml: 1,
              height: 24,
              fontSize: "0.75rem",
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
            }}
          />
        </Box>
        <WithdrawListNew list={list} mutate={mutate} />
      </Box>
    </Box>
  );
};

export default WithdrawPageNew;
