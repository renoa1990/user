import * as React from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";

type Props = {
  gameTitle: string; // 예: "EOS파워볼 1분"
  roundNo: number; // 예: 1041
  timeLeft?: { minutes: number; seconds: number }; // 남은 시간
};

export default function RoundInfoBar({ gameTitle, roundNo, timeLeft }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mt: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: "background.default",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Chip
          label={gameTitle}
          color="primary"
          size="medium"
          sx={{ fontWeight: 700 }}
        />
        <Typography fontWeight={700} color="text.primary">
          [ 제{" "}
          <Box component="span" color="primary.main">
            {roundNo}
          </Box>{" "}
          회차 ]
        </Typography>
      </Box>

      {timeLeft && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 2,
            py: 0.75,
            borderRadius: 1,
            bgcolor: "error.main",
            color: "white",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}




