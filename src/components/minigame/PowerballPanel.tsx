import * as React from "react";
import {
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import type { PowerballOdds } from "@/types/minigame";

type Props = {
  odds: PowerballOdds;
  onSelect?: (code: string | null) => void;
  powerThresholdText?: string; // 예: "4.5"
  normalThresholdText?: string; // 예: "72.5"
  selectedCode?: string | null;
  disabled?: boolean;
};

const f2 = (n: number) => n.toFixed(2);

// 원형 그라데이션 배지 색
const bubble = (kind: "red" | "blue" | "green" | "yellow") => {
  switch (kind) {
    case "red":
      return "linear-gradient(160deg,#ff6a6a 0%,#ff3b3b 50%,#e01313 100%)";
    case "blue":
      return "linear-gradient(160deg,#66b7ff 0%,#2fa1ff 50%,#0e6fd8 100%)";
    case "green":
      return "linear-gradient(160deg,#7ae28e 0%,#3ecb63 55%,#1e9d40 100%)";
    case "yellow":
      return "linear-gradient(160deg,#ffd66b 0%,#ffc536 55%,#d6a200 100%)";
  }
};

type Item = {
  code: string;
  label: string;
  odds: string;
  color: "red" | "blue" | "green" | "yellow";
};

type GroupSpec = {
  title: string;
  items: Item[];
  middleText?: string;
};

export default function PowerballPanel({
  odds,
  onSelect,
  powerThresholdText,
  normalThresholdText,
  selectedCode,
  disabled = false,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  // 내부 상태 + 외부 동기화
  const [selected, setSelected] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (typeof selectedCode !== "undefined") setSelected(selectedCode ?? null);
  }, [selectedCode]);

  const handleChange = (_: unknown, next: string | null) => {
    if (disabled) return;
    const nextVal = next ?? null;
    if (typeof selectedCode === "undefined") setSelected(nextVal);
    onSelect?.(nextVal);
  };

  const groups: GroupSpec[] = [
    {
      title: "파워볼 홀짝",
      items: [
        {
          code: "P_ODD",
          label: "홀",
          odds: f2(odds.pbPowerOddOdds),
          color: "blue",
        },
        {
          code: "P_EVEN",
          label: "짝",
          odds: f2(odds.pbPowerEvenOdds),
          color: "red",
        },
      ],
    },
    {
      title: "파워볼 언더오버",
      middleText: powerThresholdText,
      items: [
        {
          code: "P_UNDER",
          label: "언더",
          odds: f2(odds.pbPowerUnderOdds),
          color: "blue",
        },
        {
          code: "P_OVER",
          label: "오버",
          odds: f2(odds.pbPowerOverOdds),
          color: "red",
        },
      ],
    },
    {
      title: "일반볼 홀짝",
      items: [
        {
          code: "N_ODD",
          label: "홀",
          odds: f2(odds.pbNormalOddOdds),
          color: "blue",
        },
        {
          code: "N_EVEN",
          label: "짝",
          odds: f2(odds.pbNormalEvenOdds),
          color: "red",
        },
      ],
    },
    {
      title: "일반볼 언더오버",
      middleText: normalThresholdText,
      items: [
        {
          code: "N_UNDER",
          label: "언더",
          odds: f2(odds.pbNormalUnderOdds),
          color: "blue",
        },
        {
          code: "N_OVER",
          label: "오버",
          odds: f2(odds.pbNormalOverOdds),
          color: "red",
        },
      ],
    },
    {
      title: "일반볼 대중소",
      items: [
        {
          code: "N_BIG",
          label: "대",
          odds: f2(odds.pbNormalBigOdds),
          color: "red",
        },
        {
          code: "N_MID",
          label: "중",
          odds: f2(odds.pbNormalMidOdds),
          color: "green",
        },
        {
          code: "N_SMALL",
          label: "소",
          odds: f2(odds.pbNormalSmallOdds),
          color: "blue",
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        alignItems: "stretch",
      }}
    >
      {groups.map((g) => (
        <GroupCard
          key={g.title}
          spec={g}
          selected={selected}
          onChange={handleChange}
          dense={isMdUp}
          disabled={disabled}
        />
      ))}

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

/* ----------------------- 내부 컴포넌트 ----------------------- */

function GroupCard({
  spec,
  selected,
  onChange,
  dense,
  disabled,
}: {
  spec: GroupSpec;
  selected: string | null;
  onChange: (e: unknown, next: string | null) => void;
  dense?: boolean;
  disabled?: boolean;
}) {
  const count = spec.items.length;
  const hasMiddle = !!spec.middleText && count === 2;

  const colsFixed = hasMiddle
    ? "1fr auto 1fr"
    : count === 2
    ? "repeat(2, 1fr)"
    : count === 3
    ? "repeat(3, 1fr)"
    : `repeat(${dense ? 4 : Math.min(4, count)}, 1fr)`;

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
        <Typography
          variant="subtitle2"
          sx={{
            opacity: 0.9,
          }}
        >
          {spec.title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: {
            xs: colsFixed,
            sm: colsFixed,
            md: colsFixed,
          },
          alignItems: "center",
        }}
      >
        {spec.items.slice(0, 1).map((o) => (
          <Tile
            key={o.code}
            item={o}
            selected={selected}
            onChange={onChange}
            disabled={disabled}
          />
        ))}

        {hasMiddle && (
          <Typography
            variant="subtitle2"
            sx={{ color: "info.main", textAlign: "center", fontWeight: 700 }}
          >
            {spec.middleText}
          </Typography>
        )}

        {spec.items.slice(1).map((o) => (
          <Tile
            key={o.code}
            item={o}
            selected={selected}
            onChange={onChange}
            disabled={disabled}
          />
        ))}
      </Box>
    </Paper>
  );
}

function Tile({
  item,
  selected,
  onChange,
  disabled,
}: {
  item: Item;
  selected: string | null;
  onChange: (e: unknown, next: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      value={selected}
      onChange={onChange}
      sx={{
        width: "100%",
        "& .MuiToggleButton-root": {
          borderRadius: 1,
          width: "100%",
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.03)",
          textTransform: "none",
          py: 1.25,
          px: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          transition:
            "background-color .15s ease, box-shadow .15s ease, border-color .15s",
          "&:hover": { background: "rgba(255,255,255,0.08)" },
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
      <ToggleButton value={item.code} disabled={disabled}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: bubble(item.color),
            boxShadow:
              "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.25)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "#fff", lineHeight: 1 }}>
            {item.label}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: "#fff",
            mt: 0.25,
            fontWeight: 600,
            textShadow: "0 1px 1px rgba(0,0,0,.35)",
          }}
        >
          {item.odds}
        </Typography>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
