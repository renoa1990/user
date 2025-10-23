import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm } from "react-hook-form";
import { NextPage } from "next";
import Link from "next/link";
import Turnstile, { useTurnstile } from "react-turnstile";
import { Fade, IconButton, InputAdornment } from "@mui/material";
import {
  authTextFieldStyle,
  authButtonStyle,
  authLinkStyle,
  authStepIndicatorStyle,
} from "../auth/auth-styles";
import { VpnKey, ArrowForward, Login as LoginIcon } from "@mui/icons-material";

interface CodeForm {
  code: String;
}

interface props {
  onSubmit: (data: CodeForm) => void;
  loading: boolean;
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
}
export const CodeForm: NextPage<props> = (props) => {
  const { onSubmit, loading, devicedata } = props;
  const {
    register,
    handleSubmit,
    formState: { errors: errorsCode },
    reset,
  } = useForm<CodeForm>();
  const turnstile = useTurnstile();
  const [isOk, setIsOk] = useState(false);

  return (
    <Fade in timeout={800}>
      <Box>
        {/* 단계 표시기 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            "& .step": {
              display: "flex",
              alignItems: "center",
              "& .step-number": {
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#AEB0B4",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
              "&.active .step-number": {
                backgroundColor: "#00BFFF",
                color: "white",
                borderColor: "#00BFFF",
                boxShadow: "0 0 10px rgba(0, 191, 255, 0.3)",
              },
              "&.completed .step-number": {
                backgroundColor: "#2e7d32",
                color: "white",
                borderColor: "#2e7d32",
              },
            },
            "& .step-line": {
              width: 120,
              height: 2,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              margin: "0 24px",
              transition: "all 0.3s ease",
            },
            "& .completed .step-line": {
              backgroundColor: "#2e7d32",
            },
          }}
        >
          <Box className="step active">
            <Box className="step-number">1</Box>
            <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
              가입코드 입력
            </Typography>
          </Box>
          <Box className="step-line"></Box>
          <Box className="step">
            <Box className="step-number">2</Box>
            <Typography
              variant="caption"
              sx={{ ml: 1, color: "text.secondary" }}
            >
              정보 입력
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: "center", mb: 6, mt: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "2rem",
              }}
            >
              <VpnKey />
            </Box>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "#00BFFF",
              textShadow: "0 0 10px rgba(0, 191, 255, 0.3)",
            }}
          >
            가입코드 입력
          </Typography>
          <Typography
            sx={{ fontSize: "1rem", lineHeight: 1.6, color: "#AEB0B4" }}
          >
            안내받은 가입코드를 입력하여 회원가입을 시작하세요
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                label="회원 가입 코드"
                variant="outlined"
                fullWidth
                sx={authTextFieldStyle}
                placeholder="가입코드를 입력하세요"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKey color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register("code", {
                  required: "코드를 입력하세요.",
                  minLength: {
                    value: 1,
                    message: "코드를 입력해주세요",
                  },
                })}
                error={!!errorsCode?.code}
                helperText={
                  errorsCode?.code
                    ? errorsCode.code.message
                    : "유효한 가입코드를 입력해주세요"
                }
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <LoadingButton
                size="large"
                variant="contained"
                type="submit"
                loading={loading}
                disabled={isOk}
                fullWidth
                sx={authButtonStyle}
                endIcon={<ArrowForward />}
              >
                다음 단계로
              </LoadingButton>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  이미 계정이 있으신가요?
                </Typography>
                <Link href="/" style={{ textDecoration: "none" }}>
                  <LoadingButton
                    variant="outlined"
                    size="small"
                    startIcon={<LoginIcon />}
                    sx={{
                      ...authButtonStyle,
                      color: "primary.main",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    로그인하기
                  </LoadingButton>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Fade>
  );
};
