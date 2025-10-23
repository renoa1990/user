import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { clearCart, removeItem } from "src/redux/slices/cartSlice";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { modalConfirm } from "@components/ModalConfirm";
import numeral from "numeral";

interface Props {
  gameCode?: string;
  userMoney?: number;
  game_Event?: string;
  onClose: () => void;
  mutate?: () => void;
  activeTab?: string;
  bonus?: {
    bonus: string;
    count: number;
  } | null;
}

interface BetResponse {
  ok: boolean;
  betting: boolean;
  message?: string;
}

const money = (n = 0) => numeral(n).format("0,0") + " 원";

export const NewCart: FC<Props> = (props) => {
  const { gameCode, userMoney, game_Event, onClose, mutate, activeTab, bonus } =
    props;
  const theme = useTheme();
  const dispatch = useDispatch();
  const cartList = useSelector((state: RootState) => state.cart.items);
  const cartSetup = useSelector((state: RootState) => state.cart.setup);
  const { enqueueSnackbar } = useSnackbar();

  const [betPrice, setBetPrice] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [betting, { data, error, loading }] =
    useMutation<BetResponse>("/api/cart/betting");

  // 총 배당 계산
  const calculatedOdds = useMemo(() => {
    if (!cartList || cartList.length === 0) return 1;
    return cartList.reduce(
      (accumulator, item) => accumulator * +item.pickOdds,
      1
    );
  }, [cartList]);

  // 보너스 포함 배당
  const effectiveOdds = useMemo(() => {
    return bonus?.bonus ? calculatedOdds * +bonus.bonus : calculatedOdds;
  }, [calculatedOdds, bonus]);

  // 예상 당첨금
  const expectedPayout = useMemo(() => {
    return betPrice * effectiveOdds;
  }, [betPrice, effectiveOdds]);

  // 제한 계산
  const minBet = +(cartSetup?.minBet || 0);
  const baseMaxBet = +(cartSetup?.maxBet || 0);
  const maxPayout = +(cartSetup?.maxResult || 0);
  const maxByPayout =
    maxPayout > 0
      ? Math.floor(maxPayout / effectiveOdds)
      : Number.MAX_SAFE_INTEGER;
  const allowedMaxBet = Math.min(baseMaxBet, maxByPayout);

  // 유효성 검사
  const withinMin = betPrice === 0 || betPrice >= minBet;
  const withinMax = betPrice <= allowedMaxBet;
  const withinBalance = betPrice <= (userMoney || 0) || (userMoney || 0) <= 0;
  const isValid =
    cartList.length > 0 &&
    betPrice > 0 &&
    withinMin &&
    withinMax &&
    withinBalance;

  // 핸들러
  const clamp = (v: number) =>
    Math.max(0, Math.min(allowedMaxBet, Math.floor(v)));

  const updateBetPrice = (v: number) => {
    const clamped = clamp(v);
    setBetPrice(clamped);
    setDisplayValue(clamped.toLocaleString("ko-KR"));
  };

  const add = (v: number) => updateBetPrice(betPrice + v);
  const resetAmount = () => updateBetPrice(0);
  const maxAmount = () => {
    const m =
      (userMoney || 0) > 0
        ? Math.min(userMoney || 0, allowedMaxBet)
        : allowedMaxBet;
    updateBetPrice(m);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 쉼표 제거하고 숫자만 추출
    const numericValue = inputValue.replace(/[^0-9]/g, "");
    const number = numericValue === "" ? 0 : parseInt(numericValue, 10);
    updateBetPrice(number);
  };

  // 배팅 실행
  const handleBet = useCallback(() => {
    if (!isValid) return;
    modalConfirm("confirm", "betting", "배팅하시겠습니까?", () => {
      if (loading) return;
      betting({
        game_Event,
        gameCode,
        cartList,
        betPrice,
        winPrice: expectedPayout,
        totalOdd: +effectiveOdds.toFixed(2),
        bonus,
      });
    });
  }, [
    isValid,
    loading,
    betting,
    game_Event,
    gameCode,
    cartList,
    betPrice,
    expectedPayout,
    effectiveOdds,
    bonus,
  ]);

  // 베팅 결과 처리
  useEffect(() => {
    if (!data) return;
    if (data.ok) {
      if (data.betting) {
        enqueueSnackbar("베팅이 완료되었습니다", { variant: "success" });
        dispatch(clearCart());
        setBetPrice(0);
        setDisplayValue("0");

        // 베팅 리스트 즉시 갱신
        if (mutate) {
          mutate();
        }

        onClose();
      } else if (data.message) {
        enqueueSnackbar(data.message, { variant: "error" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // pick을 한글로 변환 (스포츠용)
  const convertPickToKorean = (gameType: string, pick: string) => {
    // 이미 한글인 경우 그대로 반환
    if (!["home", "away", "tie"].includes(pick)) return pick;

    switch (gameType) {
      case "match":
        if (pick === "home") return "홈";
        if (pick === "away") return "원정";
        if (pick === "tie") return "무";
        break;
      case "unover":
        if (pick === "home") return "오버";
        if (pick === "away") return "언더";
        break;
      case "handicap":
        if (pick === "home") return "홈";
        if (pick === "away") return "원정";
        break;
    }
    return pick;
  };

  // 픽 색상
  const pickColor = (gameType: string, pick: string) => {
    // 스포츠
    if (gameType === "match") {
      if (pick === "home" || pick === "홈") return theme.palette.primary.main;
      if (pick === "away" || pick === "원정") return theme.palette.error.main;
      return theme.palette.text.primary;
    }
    if (gameType === "unover") {
      if (pick === "home" || pick === "오버") return theme.palette.error.main;
      if (pick === "away" || pick === "언더") return theme.palette.info.main;
    }
    if (gameType === "handicap") {
      if (pick === "home" || pick === "홈") return theme.palette.info.main;
      if (pick === "away" || pick === "원정") return theme.palette.error.main;
    }

    // 미니게임 - 홀짝
    if (gameType.includes("_oe")) {
      return pick === "홀"
        ? theme.palette.primary.main
        : theme.palette.error.main;
    }
    // 미니게임 - 언더오버
    if (gameType.includes("unover")) {
      return pick === "언더"
        ? theme.palette.primary.main
        : theme.palette.error.main;
    }
    // 미니게임 - 좌우
    if (gameType.includes("_rl")) {
      return pick === "좌"
        ? theme.palette.primary.main
        : theme.palette.error.main;
    }
    // 미니게임 - 줄수
    if (gameType.includes("_line")) {
      return pick === "3줄"
        ? theme.palette.primary.main
        : theme.palette.error.main;
    }
    // 미니게임 - 대중소
    if (gameType.includes("_size")) {
      if (pick === "대") return theme.palette.error.main;
      if (pick === "중") return theme.palette.warning.main;
      if (pick === "소") return theme.palette.primary.main;
    }
    return theme.palette.text.primary;
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Paper
        variant="outlined"
        sx={{
          p: 1.25,
          borderRadius: 1,
          bgcolor: "background.paper",
          borderColor: "divider",
          "& .MuiTypography-root": {
            fontSize: { xs: "0.88rem", sm: "0.9rem" },
          },
          "& .MuiButton-root": {
            fontSize: { xs: "0.82rem", sm: "0.84rem" },
            py: 0.5,
          },
          "& .MuiTextField-root .MuiInputBase-input": {
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
          },
        }}
      >
        {/* 헤더 */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            베팅카트
            <Typography
              component="span"
              variant="caption"
              color="primary.main"
              sx={{ ml: 0.5, fontWeight: 600 }}
            >
              [{cartList.length}]
            </Typography>
          </Typography>
        </Stack>

        {/* 선택 요약 */}
        <Box sx={{ mt: 1, px: 0.5 }}>
          {cartList.length > 0 ? (
            <Stack spacing={0.5}>
              {cartList.map((item) => {
                // 스포츠인 경우 팀 이름 표시
                const isSports = gameCode === "스포츠";
                const displayName = isSports
                  ? `${item.team_home_change || item.team_home} vs ${
                      item.team_away_change || item.team_away
                    }`
                  : item.game_Event;

                return (
                  <Stack
                    key={item.id}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          fontSize: "0.7rem",
                          mb: 0.25,
                        }}
                      >
                        {item.game_Name_Change || item.game_Name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: "0.85rem",
                        }}
                      >
                        {displayName}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: pickColor(item.game_Type, item.pick),
                            fontWeight: 700,
                            fontSize: "0.88rem",
                          }}
                        >
                          {convertPickToKorean(item.game_Type, item.pick)}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            color: "primary.main",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                          }}
                        >
                          @ {(+item.pickOdds).toFixed(2)}
                        </Typography>
                      </Stack>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => dispatch(removeItem(item.id as number))}
                      aria-label="remove"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                );
              })}
              {cartList.length > 1 && (
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => dispatch(clearCart())}
                    sx={{ mt: 0.5 }}
                  >
                    전체삭제
                  </Button>
                </Stack>
              )}
            </Stack>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 2 }}
            >
              선택된 항목이 없습니다
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 설정 */}
        {cartSetup && (
          <>
            <Stack spacing={0.5} sx={{ px: 0.5 }}>
              {minBet > 0 && <Row label="최소배팅" value={money(minBet)} />}
              {baseMaxBet > 0 && (
                <Row label="최대배팅" value={money(baseMaxBet)} />
              )}
              {maxPayout > 0 && (
                <Row label="최대당첨금" value={money(maxPayout)} />
              )}
            </Stack>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* 요약 */}
        <Stack spacing={0.5} sx={{ px: 0.5 }}>
          <Row
            label="보유머니"
            value={money(userMoney || 0)}
            valueColor="primary"
          />
          <Row
            label="배당률"
            value={`${effectiveOdds.toFixed(2)} 배`}
            valueColor="error"
          />
          <Row label="적중금" value={money(expectedPayout)} />
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* 금액 입력 */}
        <Box>
          <TextField
            size="small"
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            fullWidth
            disabled={loading}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9,]*",
              style: { textAlign: "right" },
            }}
            placeholder="0"
            error={!withinMin || !withinMax || !withinBalance}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 0.5, minHeight: 20, px: 0.5 }}
          >
            {/* 왼쪽: 에러 메시지 */}
            <Typography
              variant="caption"
              sx={{
                color:
                  !withinMin || !withinMax || !withinBalance
                    ? "error.main"
                    : "transparent",
                fontSize: "0.75rem",
              }}
            >
              {!withinMin
                ? `최소배팅 ${money(minBet)} 이상`
                : !withinMax
                ? `최대 ${money(allowedMaxBet)}`
                : !withinBalance
                ? `보유머니 부족`
                : "-"}
            </Typography>

            {/* 오른쪽: 한글 금액 */}
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {numberToKorean(betPrice)}
            </Typography>
          </Stack>
        </Box>

        {/* 프리셋 버튼 3x3 */}
        <Box
          sx={{
            mt: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0.75,
          }}
        >
          {[5_000, 10_000, 30_000, 50_000, 100_000, 300_000, 500_000].map(
            (v) => (
              <Button
                key={`preset-${v}`}
                onClick={() => add(v)}
                variant="outlined"
                fullWidth
                disabled={loading}
              >
                {formatKR(v)}
              </Button>
            )
          )}
          <Button
            onClick={resetAmount}
            variant="outlined"
            color="warning"
            fullWidth
            disabled={loading}
          >
            RESET
          </Button>
          <Button
            onClick={maxAmount}
            variant="outlined"
            color="secondary"
            fullWidth
            disabled={loading}
          >
            MAX
          </Button>
        </Box>

        {/* 베팅 버튼 */}
        <LoadingButton
          fullWidth
          sx={{ mt: 1.25 }}
          variant="contained"
          color="primary"
          disabled={!isValid}
          loading={loading}
          onClick={handleBet}
        >
          베팅하기
        </LoadingButton>
      </Paper>

      {/* 로딩 오버레이 */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 1,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={48} thickness={4} />
            <Typography variant="body1" color="white" fontWeight={600}>
              베팅 처리중...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: "primary" | "error";
}) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        color={valueColor ? `${valueColor}.main` : undefined}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function formatKR(n: number) {
  if (n >= 100_000_000) return `${n / 100_000_000}억`;
  if (n >= 10_000) return `${n / 10_000}만`;
  if (n >= 1_000) return `${n / 1_000}천`;
  return n.toLocaleString("ko-KR");
}

// 숫자를 한글로 변환
function numberToKorean(num: number): string {
  if (num === 0) return "";

  const units = ["", "만", "억", "조"];
  const smallUnits = ["", "십", "백", "천"];

  let result = "";
  let unitIndex = 0;

  while (num > 0) {
    const part = num % 10000;
    if (part > 0) {
      let partStr = "";
      let tempPart = part;

      for (let i = 0; i < 4; i++) {
        const digit = tempPart % 10;
        if (digit > 0) {
          if (digit === 1 && i > 0) {
            partStr = smallUnits[i] + partStr;
          } else {
            const koreanDigit = [
              "",
              "일",
              "이",
              "삼",
              "사",
              "오",
              "육",
              "칠",
              "팔",
              "구",
            ][digit];
            partStr = koreanDigit + smallUnits[i] + partStr;
          }
        }
        tempPart = Math.floor(tempPart / 10);
      }

      result = partStr + units[unitIndex] + result;
    }

    num = Math.floor(num / 10000);
    unitIndex++;
  }

  return result ? result + "원" : "";
}
