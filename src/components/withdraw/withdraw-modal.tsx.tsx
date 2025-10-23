import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useRef } from "react";
import { create } from "zustand";
import { WithdrawPasswordForm } from "./withdraw-password-form";
import numeral from "numeral";

type ModalConfirmStore = {
  variant: string | null;
  title: string;
  amount: number;
  onsubmit?: (password: string) => void | string;
  id?: number;
  close: () => void;
};

const useModalConfirmStore = create<ModalConfirmStore>((set) => ({
  variant: null,
  title: "",
  amount: 0,
  onsubmit: undefined,
  id: undefined,
  close: () => {
    set({
      variant: null,
    });
  },
}));

export const SetModal = (
  variant: string | null,
  title: string,
  amount: number,
  onsubmit?: (password: string) => void | string,
  id?: number
) => {
  useModalConfirmStore.setState({
    variant,
    title,
    amount,
    onsubmit,
    id,
  });
};

const WithdrawModal: React.FC = () => {
  const { variant, title, amount, onsubmit, id, close } =
    useModalConfirmStore();

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && buttonRef.current) {
      event.preventDefault(); // 기본 엔터 동작 방지
      buttonRef.current.click(); // 버튼 클릭 동작 수행
    }
  };
  useEffect(() => {
    // 팝업이 열릴 때, 엔터 키를 눌렀을 때 버튼 클릭 이벤트 수행
    if (variant) {
      document.addEventListener("keypress", handleKeyPress);
    } else {
      document.removeEventListener("keypress", handleKeyPress);
    }

    return () => {
      document.removeEventListener("keypress", handleKeyPress);
    };
  }, [variant]);

  return (
    <Dialog open={Boolean(variant)} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton onClick={close}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent>
        <Box display={"flex"} justifyContent={"flex-end"}>
          금액 :
          <Typography fontWeight={"bold"} ml={1}>
            {numeral(amount).format("0,0")}
          </Typography>
          원
        </Box>
        <WithdrawPasswordForm onsubmit={onsubmit} close={close} />
      </DialogContent>

      <DialogActions></DialogActions>
    </Dialog>
  );
};

export default WithdrawModal;
