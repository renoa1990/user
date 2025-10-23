import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import type { LadderOdds } from "@/types/minigame";
import { alpha } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";

type Props = {
  odds: LadderOdds;
  onSelect?: (code: string | null) => void;
  selectedCode?: string | null;
  disabled?: boolean;
  hideOddEven?: boolean; // 홀/짝 숨김 옵션 (키노사다리용)
};

const f2 = (n: number) => n.toFixed(2);

// 원형 배지 그라데이션
const bubble = (kind: "red" | "blue" | "yellow" | "green") => {
  switch (kind) {
    case "red":
      return "linear-gradient(160deg,#ff6a6a 0%,#ff3b3b 50%,#e01313 100%)";
    case "blue":
      return "linear-gradient(160deg,#66b7ff 0%,#2fa1ff 50%,#0e6fd8 100%)";
    case "yellow":
      return "linear-gradient(160deg,#ffd66b 0%,#ffc536 55%,#d6a200 100%)";
    case "green":
      return "linear-gradient(160deg,#7ae28e 0%,#3ecb63 55%,#1e9d40 100%)";
  }
};

export default function LadderPanel({
  odds,
  onSelect,
  selectedCode,
  disabled,
  hideOddEven = false,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // 전 그룹 통틀어 1개만 선택 (내부 상태)
  const [selected, setSelected] = React.useState<string | null>(null);

  // 외부(selectedCode) 값과 동기화
  React.useEffect(() => {
    if (typeof selectedCode !== "undefined") {
      setSelected(selectedCode ?? null);
    }
  }, [selectedCode]);

  // 토글 변경: 같은 버튼 다시 클릭 시 해제(null) 처리
  const handleChange = (_: unknown, next: string | null) => {
    if (disabled) return;

    const nextVal = next ?? null;

    // 비컨트롤드에서도 즉시 UI 반영
    if (typeof selectedCode === "undefined") {
      setSelected(nextVal);
    }
    onSelect?.(nextVal);
  };

  const allGroups: {
    title: string;
    items: Array<{
      code: string;
      label: string;
      odds: string;
      color: "red" | "blue" | "yellow" | "green";
    }>;
  }[] = [
    {
      title: "홀/짝",
      items: [
        { code: "ODD", label: "홀", odds: f2(odds.ldOddOdds), color: "blue" },
        { code: "EVEN", label: "짝", odds: f2(odds.ldEvenOdds), color: "red" },
      ],
    },
    {
      title: "좌/우",
      items: [
        { code: "LEFT", label: "좌", odds: f2(odds.ldLeftOdds), color: "blue" },
        {
          code: "RIGHT",
          label: "우",
          odds: f2(odds.ldRightOdds),
          color: "red",
        },
      ],
    },
    {
      title: "줄수",
      items: [
        {
          code: "LINES3",
          label: "3줄",
          odds: f2(odds.ld3LineOdds),
          color: "blue",
        },
        {
          code: "LINES4",
          label: "4줄",
          odds: f2(odds.ld4LineOdds),
          color: "red",
        },
      ],
    },
  ];

  // 홀/짝 숨김 옵션 적용 (키노사다리용)
  const groups = hideOddEven
    ? allGroups.filter((g) => g.title !== "홀/짝")
    : allGroups;

  return (
    <Box sx={{ position: "relative" }}>
      {/* 그룹 카드들을 반응형 그리드로 배치 */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          alignItems: "stretch",
        }}
      >
        {groups.map((g) => (
          <GroupCard
            key={g.title}
            title={g.title}
            items={g.items}
            selected={selected}
            onChange={handleChange}
            dense={isMdUp}
            disabled={disabled}
          />
        ))}
      </Box>

      {/* 비활성화 오버레이 */}
      {disabled && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(2px)",
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
              gap: 1,
            }}
          >
            <LockIcon sx={{ fontSize: 48, color: "grey.400" }} />
            <Typography variant="h6" color="grey.400" fontWeight={600}>
              베팅 시간이 아닙니다
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/** 개별 그룹 카드 */
function GroupCard({
  title,
  items,
  selected,
  onChange,
  dense,
  disabled,
}: {
  title: string;
  items: Array<{
    code: string;
    label: string;
    odds: string;
    color: "red" | "blue" | "yellow" | "green";
  }>;
  selected: string | null;
  onChange: (e: unknown, next: string | null) => void;
  dense?: boolean;
  disabled?: boolean;
}) {
  const count = items.length;
  const colsXS = Math.min(2, count);
  const colsSM = count === 2 ? 2 : count >= 4 ? 4 : count;
  const colsMD = colsSM;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 1.2,
        bgcolor: "background.default",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 타이틀 바 */}
      <Box
        sx={{
          mb: 1,
          borderRadius: 1,
          bgcolor: "rgba(255,255,255,0.05)",
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.15)",
          px: 1.5,
          py: 0.75,
          display: "inline-flex",
          minWidth: 120,
          justifyContent: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
          {title}
        </Typography>
      </Box>

      {/* 옵션 타일 */}
      <ToggleButtonGroup
        exclusive
        value={selected}
        onChange={onChange}
        sx={{
          mt: 0.5,
          width: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: `repeat(${colsXS}, 1fr)`,
            sm: `repeat(${colsSM}, 1fr)`,
            md: `repeat(${colsMD}, 1fr)`,
          },
          gap: 1,
          "& .MuiToggleButton-root": {
            borderRadius: 1,
            border: "1px solid",
            borderColor: "rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.03)",
            textTransform: "none",
            py: 1.25,
            px: 1,
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            transition:
              "background-color .15s ease, box-shadow .15s ease, border-color .15s",
            "&:hover": {
              background: disabled
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.08)",
            },

            "&.Mui-selected": (t) => ({
              borderColor: t.palette.primary.main,
              boxShadow: `inset 0 0 0 1px ${
                t.palette.primary.main
              }, 0 0 0 2px ${alpha(t.palette.primary.main, 0.25)}`,
              background: alpha(t.palette.primary.light, 0.22),
            }),
            "&.Mui-selected:hover": (t) => ({
              background: alpha(t.palette.primary.light, 0.3),
            }),
            "&.Mui-disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          },
        }}
      >
        {items.map((o) => (
          <ToggleButton key={o.code} value={o.code} disabled={disabled}>
            {/* 원형 배지 */}
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: bubble(o.color),
                boxShadow:
                  "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#fff", lineHeight: 1 }}
              >
                {o.label}
              </Typography>
            </Box>

            {/* 배당 */}
            <Typography
              variant="body2"
              sx={{
                color: "#fff",
                mt: 0.25,
                textShadow: "0 1px 1px rgba(0,0,0,.35)",
              }}
            >
              {o.odds}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
}
