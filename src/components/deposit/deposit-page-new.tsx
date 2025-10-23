import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  alpha,
  styled,
  useTheme,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { Money } from "@prisma/client";
import { DepositBank } from "./depositBank";
import { MoneyDial } from "@components/moneydial/moneydial";
import DepositListNew from "./deposit-list-new";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { modalConfirm } from "@components/ModalConfirm";
import numeral from "numeral";

interface Props {
  list?: Money[];
  bonusName?: string;
  sportsBonus?: number;
  casinoBonus?: number;
  depositUnit?: number;
  minDeposit?: number;
  mutate: () => void;
}

interface Deposit {
  ok: boolean;
  deposit: boolean;
  message?: string;
}

// 스타일드 컴포넌트들
const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  backgroundColor: alpha(theme.palette.info.main, 0.03),
  boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.08)}`,
  marginBottom: theme.spacing(3),
}));

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  marginBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(2.5),
  color: theme.palette.primary.contrastText,
  borderRadius: "16px 16px 0 0",
}));

const HistoryCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
}));

export const DepositPageNew: FC<Props> = ({
  list,
  bonusName,
  sportsBonus = 0,
  casinoBonus = 0,
  depositUnit = 0,
  minDeposit = 0,
  mutate,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const nf = new Intl.NumberFormat("ko-KR");

  const [bonusData, setBonusData] = useState<
    { type: string; name: string; bonus: number }[]
  >([]);
  const [amount, setAmount] = useState<number>(0);
  const [selectBonus, setSelectBonus] = useState<
    { type: string; name: string; bonus: number } | undefined
  >(undefined);
  const [deposit, { loading, data: mutData }] =
    useMutation<Deposit>("/api/deposit");

  const onClick = () => {
    if (!amount || amount < 0) {
      enqueueSnackbar("올바른 금액을 입력하세요", {
        variant: "error",
      });
      setAmount(0);
      return;
    }
    if (!isNumeric(amount)) {
      enqueueSnackbar("숫자만 입력해주세요", {
        variant: "error",
      });
      setAmount(0);
      return;
    }
    if (!selectBonus) {
      enqueueSnackbar("이용하실 게임을 선택해주세요", {
        variant: "error",
      });
      return;
    }

    modalConfirm(
      "confirm",
      `충전신청`,
      `${numeral(amount).format(`0,0`)}원 충전신청 하시겠습니까?`,
      onSubmit
    );
  };

  const isNumeric = (value: any) => {
    return /^[0-9]+$/.test(value);
  };

  const onSubmit = () => {
    if (loading) return;
    deposit({ amount, selectBonus });
  };

  useEffect(() => {
    if (bonusName && bonusName !== "") {
      setBonusData([
        { type: "스포츠", name: bonusName, bonus: sportsBonus },
        { type: "카지노", name: bonusName, bonus: casinoBonus },
      ]);
    } else {
      setBonusData([
        { type: "스포츠", name: "", bonus: 0 },
        { type: "카지노", name: "", bonus: 0 },
      ]);
    }
  }, [bonusName, sportsBonus, casinoBonus]);

  useEffect(() => {
    if (mutData) {
      if (mutData.ok) {
        if (mutData.deposit) {
          enqueueSnackbar("충전 신청이 완료되었습니다.", {
            variant: "success",
          });
          setAmount(0);
          setSelectBonus(undefined);
        } else if (mutData.message) {
          modalConfirm("error", `충전신청`, `${mutData.message}`);
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
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          충전신청
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceWalletOutlined color="primary" />
          <Typography variant="body1" color="text.secondary">
            빠르고 안전한 충전 서비스
          </Typography>
        </Box>
      </Box>

      {/* 안내 사항 */}
      <InfoCard>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoOutlined color="info" />
              <Typography variant="h6" fontWeight="bold">
                입금 안내
              </Typography>
            </Box>
            <Divider />
            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  충전 최소금액은{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {minDeposit ? (
                      nf.format(minDeposit)
                    ) : (
                      <CircularProgress size={12} />
                    )}
                    원
                  </Box>
                  이며,{" "}
                  <Box
                    component="span"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {depositUnit ? (
                      nf.format(depositUnit)
                    ) : (
                      <CircularProgress size={12} />
                    )}
                    원
                  </Box>{" "}
                  단위로 입금 가능합니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  입금자명은 수시로 변경되며, 입금 전 계좌확인은 필수
                  부탁드립니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  선입금 후 신청 부탁드리며, 허위정보 확인 시 이용이 제한될 수
                  있습니다.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  상품권 이용 시, 충전은 반드시 상품권 구매 후 신청해주세요.
                </Typography>
              </li>
            </Box>
          </Stack>
        </CardContent>
      </InfoCard>

      {/* 충전 신청 폼 */}
      <ActionCard>
        <HeaderBox>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceWalletOutlined sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold">
              충전 신청
            </Typography>
          </Box>
        </HeaderBox>
        <CardContent sx={{ p: { md: 4, xs: 0 } }}>
          <DepositBank
            selectBonus={selectBonus}
            setSelectBonus={setSelectBonus}
            mutate={mutate}
            bonusData={bonusData}
          />
          <MoneyDial
            type="deposit"
            amount={amount}
            setAmount={setAmount}
            onSubmit={onClick}
            loading={loading}
          />
        </CardContent>
      </ActionCard>

      {/* 충전 내역 */}
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
              bgcolor: "primary.main",
              borderRadius: 1,
            }}
          />
          <Typography variant="h6" fontWeight={600}>
            충전 내역
          </Typography>
          <Chip
            label="최근 10건"
            size="small"
            sx={{
              ml: 1,
              height: 24,
              fontSize: "0.75rem",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          />
        </Box>
        <DepositListNew list={list} mutate={mutate} />
      </Box>
    </Box>
  );
};

export default DepositPageNew;
