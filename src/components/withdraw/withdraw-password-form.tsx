import { FC, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import useMutation from "@libs/useMutation";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";

interface CreateForm {
  bankPassword: string;
}
interface props {
  onsubmit?: (password: string) => void | string;
  close: () => void;
}

interface mut {
  ok: boolean;
  passwordCheck: boolean;
}

export const WithdrawPasswordForm: FC<props> = (props) => {
  const router = useRouter();
  const { onsubmit, close } = props;
  const {
    register,
    handleSubmit,
    setError,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateForm>({ mode: "onSubmit" });
  const [passwordCheck, { loading, data, error }] = useMutation<mut>(
    "/api/withdraw/password-check"
  );

  const onSubmit = (data: CreateForm) => {
    if (loading) return;
    passwordCheck({ data });
  };

  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (!data.passwordCheck) {
          setError("bankPassword", { message: "비밀번호가 일치하지 않습니다" });
        } else {
          if (onsubmit) {
            onsubmit(getValues("bankPassword"));
            close();
          }
        }
      }
    }
  }, [data]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="출금 비밀번호"
        fullWidth
        size="small"
        {...register("bankPassword", {
          required: "출금 비밀번호를 입력하세요",

          maxLength: {
            value: 12,
            message: "12자를 초과할수 없습니다",
          },
        })}
        error={!!errors?.bankPassword}
        helperText={errors?.bankPassword ? errors.bankPassword.message : null}
        inputProps={{ maxLength: 12 }}
      />
      <Box display={"flex"} justifyContent={"flex-end"} mt={1}>
        <Button
          variant="contained"
          size="large"
          color="inherit"
          onClick={close}
          sx={{
            width: { xs: "50%", md: "20%" },
            mx: 0.5,
          }}
        >
          취소
        </Button>
        <LoadingButton
          loading={loading}
          type="submit"
          color="success"
          variant="contained"
          size="medium"
          sx={{
            width: { xs: "50%", md: "20%" },
            mx: 0.5,
          }}
        >
          확인
        </LoadingButton>
      </Box>
    </form>
  );
};
