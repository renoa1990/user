import React, { FC, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { useTurnstile } from "react-turnstile";
import Link from "next/link";
import {
  Card,
  CardContent,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import TelegramBanner from "../TelegramBanner";
import { ClientLoading } from "../client-loading";
import {
  authFormCardStyle,
  authLogoStyle,
  authTitleStyle,
  authSubtitleStyle,
  authTextFieldStyle,
  authButtonStyle,
  authLinkStyle,
  authDividerStyle,
  authLoadingOverlayStyle,
} from "../auth/auth-styles";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";

interface LoginForm {
  userId: string;
  password: string;
}

interface PropsData {
  onValid: (ValidForm: LoginForm) => void;
  onRegister: boolean;
  loading: boolean;
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
}

export const LoginForm: FC<PropsData> = (Props) => {
  const { onValid, onRegister, loading, devicedata } = Props;
  const turnstile = useTurnstile();
  const [isOk, setIsOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  return (
    <Card sx={authFormCardStyle}>
      {loading && (
        <Box sx={authLoadingOverlayStyle}>
          <ClientLoading loading={loading} />
        </Box>
      )}
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Fade in timeout={600}>
          <Box>
            <Box sx={authLogoStyle}>
              <Image
                src="/images/main_logo.png"
                alt="BABEL"
                width={200}
                height={76}
                style={{ width: 160, height: "auto" }}
                priority
              />
            </Box>

            <Typography sx={authTitleStyle}>로그인</Typography>
            <Typography sx={authSubtitleStyle}>
              계정에 로그인하여 서비스를 이용하세요
            </Typography>

            <form onSubmit={handleSubmit(onValid)} name={"userLogin"}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="아이디"
                    variant="outlined"
                    fullWidth
                    sx={authTextFieldStyle}
                    {...register("userId", {
                      required: "아이디를 입력하세요",
                      pattern: {
                        value: /^[0-9a-zA-Z]*$/,
                        message: "특수문자는 입력이 불가능합니다",
                      },
                      minLength: {
                        value: 3,
                        message: "3글자 이상 입력하세요",
                      },
                      maxLength: {
                        value: 15,
                        message: "15자를 초과할수 없습니다",
                      },
                      setValueAs: (value) => value?.toLowerCase(),
                    })}
                    error={!!errors?.userId}
                    helperText={errors?.userId ? errors.userId.message : null}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="비밀번호"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    sx={authTextFieldStyle}
                    inputProps={{ maxLength: 20 }}
                    InputProps={{
                      endAdornment: mounted ? (
                        <InputAdornment
                          position="end"
                          sx={{
                            // 서버와 클라이언트 간 일관성을 위한 명시적 스타일
                            "&.MuiInputAdornment-root": {
                              margin: 0,
                            },
                          }}
                        >
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    {...register("password", {
                      required: "비밀번호를 입력하세요",
                    })}
                    error={!!errors?.password}
                    helperText={
                      errors?.password ? errors.password.message : null
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <LoadingButton
                    size="large"
                    variant="contained"
                    type="submit"
                    loading={loading}
                    disabled={isOk}
                    fullWidth
                    sx={authButtonStyle}
                    startIcon={<LoginIcon />}
                  >
                    로그인
                  </LoadingButton>
                </Grid>

                {onRegister && (
                  <Grid item xs={12}>
                    <LoadingButton
                      size="large"
                      variant="outlined"
                      loading={loading}
                      disabled={isOk}
                      fullWidth
                      sx={{
                        ...authButtonStyle,
                        color: "primary.main",
                        borderColor: "primary.main",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                      onClick={() => router.push("/code")}
                    >
                      회원가입
                    </LoadingButton>
                  </Grid>
                )}
              </Grid>
            </form>

            <Divider sx={authDividerStyle}>
              <Typography variant="body2" color="text.secondary">
                또는
              </Typography>
            </Divider>

            <TelegramBanner />
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};
