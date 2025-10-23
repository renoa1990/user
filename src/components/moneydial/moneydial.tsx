import React, { Dispatch, FC, SetStateAction } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import { InputAdornment } from "@mui/material";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

import LabeledRow from "../LabelRow";
import QuickAmount from "../QuickAmount";

interface Props {
  type: "deposit" | "withdraw";
  amount: number;
  setAmount: Dispatch<SetStateAction<number>>;
  onSubmit: () => void;
  loading: boolean;
}

export const MoneyDial: FC<Props> = (props) => {
  const { type, amount, setAmount, onSubmit, loading } = props;
  const toNumber = (s: string) => Number((s || "").replace(/[^\d]/g, ""));
  const [amountText, setAmountText] = React.useState<string>("");
  const nf = new Intl.NumberFormat("ko-KR");
  const toComma = (n: number) => (n ? nf.format(n) : "");

  return (
    <>
      <LabeledRow label="신청금액" labelMd={2}>
        <Box sx={{ marginBottom: 3 }}>
          <TextField
            fullWidth
            size="medium"
            type="text"
            value={amountText}
            variant="outlined"
            onChange={(e) => {
              const raw = e.target.value;
              const n = toNumber(raw);
              setAmount(n);
              setAmountText(toComma(n));
            }}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">원</InputAdornment>,
            }}
          />
          <QuickAmount
            onAdd={(delta) => {
              const next = Math.max(0, amount + delta);
              setAmount(next);
              setAmountText(toComma(next));
            }}
            onReset={() => {
              setAmount(0);
              setAmountText("");
            }}
          />
        </Box>
      </LabeledRow>
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <LoadingButton
          variant="contained"
          size="large"
          color="error"
          startIcon={<PaidRoundedIcon />}
          onClick={() => onSubmit()}
          sx={{ px: 4, py: 1.5 }}
          loading={loading}
        >
          {type === "deposit" ? "충전" : "출금"} 신청
        </LoadingButton>
      </Box>
    </>
  );
};
