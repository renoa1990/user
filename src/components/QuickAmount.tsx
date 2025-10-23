import * as React from "react";
import { Box, Button, SxProps, Theme } from "@mui/material";

export type QuickLabel =
  | "만원"
  | "삼만원"
  | "오만원"
  | "칠만원"
  | "십만원"
  | "이십만원"
  | "오십만원"
  | "백만원"
  | "정정";

const DEFAULT_LABELS: QuickLabel[] = [
  "만원",
  "삼만원",
  "오만원",
  "칠만원",
  "십만원",
  "이십만원",
  "오십만원",
  "백만원",
  "정정",
];

const MAP: Record<Exclude<QuickLabel, "정정">, number> = {
  만원: 1,
  삼만원: 3,
  오만원: 5,
  칠만원: 7,
  십만원: 10,
  이십만원: 20,
  오십만원: 50,
  백만원: 100,
};

const toDelta = (label: QuickLabel) =>
  label === "정정" ? 0 : MAP[label] * 10_000;

export default function QuickAmount({
  onAdd,
  onReset,
  labels = DEFAULT_LABELS,
  sx,
}: {
  onAdd: (delta: number) => void; // 누를 때마다 더할 금액
  onReset?: () => void; // "정정" 시 초기화(옵션)
  labels?: QuickLabel[];
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(3, 1fr)",
          sm: "repeat(4, 1fr)",
          md: "repeat(6, 1fr)",
        },
        gap: 1,
        mt: 1.25,
        ...sx,
      }}
    >
      {labels.map((label) => (
        <Button
          key={label}
          variant="outlined" // 이전 디자인 유지
          onClick={() => {
            if (label === "정정") onReset ? onReset() : onAdd(0);
            else onAdd(toDelta(label));
          }}
          sx={{ py: 1, fontSize: { xs: 13, md: 15 } }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
}
