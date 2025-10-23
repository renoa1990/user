import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { useRouter } from "next/router";
import { Controller, useForm, FormProvider } from "react-hook-form";
import { NextPage } from "next";
import useMutation from "@libs/useMutation";
import MenuItem from "@mui/material/MenuItem";
import { useSnackbar } from "notistack";
import { NumericFormat } from "react-number-format";
import Link from "next/link";
import Turnstile, { useTurnstile } from "react-turnstile";
import {
  Card,
  CardContent,
  Fade,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  InputAdornment,
  Collapse,
} from "@mui/material";
import {
  BasicInfoStep,
  BankInfoStep,
  PersonalInfoStep,
} from "./RegisterFormSteps";
import { ClientLoading } from "../client-loading";
import Image from "next/image";
import {
  authFormCardStyle,
  authLogoStyle,
  authTitleStyle,
  authSubtitleStyle,
  authTextFieldStyle,
  authButtonStyle,
  authLinkStyle,
  authStepIndicatorStyle,
  authFormSectionStyle,
  authLoadingOverlayStyle,
  glow,
} from "../auth/auth-styles";
import {
  Person,
  Lock,
  AccountBalance,
  Phone,
  CalendarToday,
  VpnKey,
  Visibility,
  VisibilityOff,
  CheckCircle,
  ArrowBack,
  ArrowForward,
  PersonOutline,
  AccountBalanceOutlined,
  PhoneAndroidOutlined,
  CheckCircleOutlined,
} from "@mui/icons-material";

interface RegisterForm {
  userId: string;
  nickName: string;
  password: string;
  rePassword: string;
  bankName: string;
  bankNumber: number;
  name: string;
  birth: number;
  phone: string;
  bankPassword: string;
  bankRePassword: string;
  joinCode: string;
  invite: string;
}
interface response {
  ok: boolean;
  valid?: {
    message: string;
    type: "userId" | "nickName" | "phone" | "bankNumber" | "invite";
  }[];
  create?: boolean;
}
interface PropsData {
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
  invite: boolean;
  code: string;
}

export const RegisterForm: NextPage<PropsData> = (Props) => {
  const { devicedata, invite, code } = Props;
  const { enqueueSnackbar } = useSnackbar();
  const turnstile = useTurnstile();
  const [isOk, setIsOk] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showBankPassword, setShowBankPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [showBankRePassword, setShowBankRePassword] = useState(false);

  const methods = useForm<RegisterForm>({
    defaultValues: { joinCode: code },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    control,
    setValue,
    formState: { errors },
  } = methods;

  const [registerForm, { loading, data, error }] = useMutation<response>(
    "/api/users/register/register"
  );

  const router = useRouter();

  const passwordWatch = watch("password");
  const exPasswordWatch = watch("bankPassword");

  const [checkUserid, setCheckUserid] = useState<string>("");
  const [checkUserNickname, setcheckUserNickname] = useState<string>("");

  const steps = [
    { label: "기본정보", icon: <PersonOutline />, color: "#00BFFF" },
    { label: "계좌정보", icon: <AccountBalanceOutlined />, color: "#00BFFF" },
    { label: "개인정보", icon: <PhoneAndroidOutlined />, color: "#00BFFF" },
    { label: "완료", icon: <CheckCircleOutlined />, color: "#00BFFF" },
  ];

  const onValidRegister = async (data: RegisterForm) => {
    if (loading) return;
    registerForm({ data, devicedata });
  };

  const handleNext = async () => {
    const currentStepData = methods.getValues();
    let isValid = true;

    // 각 단계별 validation
    if (activeStep === 0) {
      // 기본정보 단계: 아이디, 닉네임, 비밀번호 validation
      await methods.trigger(["userId", "nickName", "password", "rePassword"]);
      const errors = methods.formState.errors;
      if (
        errors.userId ||
        errors.nickName ||
        errors.password ||
        errors.rePassword
      ) {
        isValid = false;
      }

      // 아이디와 닉네임 중복 검사
      if (isValid && currentStepData.userId && currentStepData.nickName) {
        try {
          // 아이디 중복 검사
          const userIdResponse = await fetch("/api/users/check-duplicate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "userId",
              value: currentStepData.userId,
            }),
          });
          const userIdResult = await userIdResponse.json();

          // 닉네임 중복 검사
          const nickNameResponse = await fetch("/api/users/check-duplicate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "nickName",
              value: currentStepData.nickName,
            }),
          });
          const nickNameResult = await nickNameResponse.json();

          if (userIdResult?.isDuplicate) {
            methods.setError("userId", {
              type: "manual",
              message: "이미 사용중인 아이디입니다",
            });
            isValid = false;
          }

          if (nickNameResult?.isDuplicate) {
            methods.setError("nickName", {
              type: "manual",
              message: "이미 사용중인 닉네임입니다",
            });
            isValid = false;
          }
        } catch (error) {
          console.error("중복 검사 중 오류:", error);
          enqueueSnackbar("중복 검사 중 오류가 발생했습니다", {
            variant: "error",
          });
          isValid = false;
        }
      }
    } else if (activeStep === 1) {
      // 계좌정보 단계: 은행명, 계좌번호, 출금비밀번호 validation
      await methods.trigger([
        "bankName",
        "bankNumber",
        "bankPassword",
        "bankRePassword",
      ]);
      const errors = methods.formState.errors;
      if (
        errors.bankName ||
        errors.bankNumber ||
        errors.bankPassword ||
        errors.bankRePassword
      ) {
        isValid = false;
      }

      // 계좌번호 중복 검사 (API에서 설정에 따라 자동으로 처리됨)
      if (isValid && currentStepData.bankName && currentStepData.bankNumber) {
        try {
          const bankResponse = await fetch("/api/users/check-duplicate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "bankAccount",
              bankName: currentStepData.bankName,
              bankNumber: currentStepData.bankNumber,
            }),
          });
          const bankResult = await bankResponse.json();

          if (bankResult?.isDuplicate) {
            methods.setError("bankNumber", {
              type: "manual",
              message: "이미 사용중인 계좌번호입니다",
            });
            isValid = false;
          }
        } catch (error) {
          console.error("계좌번호 중복 검사 중 오류:", error);
          enqueueSnackbar("계좌번호 중복 검사 중 오류가 발생했습니다", {
            variant: "error",
          });
          isValid = false;
        }
      }
    } else if (activeStep === 2) {
      // 개인정보 단계: 이름, 생년월일, 전화번호 validation
      await methods.trigger(["name", "birth", "phone"]);
      const errors = methods.formState.errors;
      if (errors.name || errors.birth || errors.phone) {
        isValid = false;
      }

      // 휴대폰 번호 중복 검사 (API에서 설정에 따라 자동으로 처리됨)
      if (isValid && currentStepData.phone) {
        try {
          const phoneResponse = await fetch("/api/users/check-duplicate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "phone",
              value: currentStepData.phone,
            }),
          });
          const phoneResult = await phoneResponse.json();

          if (phoneResult?.isDuplicate) {
            methods.setError("phone", {
              type: "manual",
              message: "이미 사용중인 휴대폰 번호입니다",
            });
            isValid = false;
          }
        } catch (error) {
          console.error("휴대폰 번호 중복 검사 중 오류:", error);
          enqueueSnackbar("휴대폰 번호 중복 검사 중 오류가 발생했습니다", {
            variant: "error",
          });
          isValid = false;
        }
      }
    }

    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (data.valid) {
          data.valid.map((item) => {
            setError(`${item.type}`, { message: `${item.message}` });
          });
        }
        if (data.create) {
          enqueueSnackbar("회원가입이 완료되었습니다", {
            variant: "success",
          });
          // 회원가입 완료 후 완료 단계로 이동
          setActiveStep(3);
        }
      }
    }
  }, [data, router]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showRePassword={showRePassword}
            setShowRePassword={setShowRePassword}
            checkUserid={checkUserid}
            checkUserNickname={checkUserNickname}
          />
        );
      case 1:
        return (
          <BankInfoStep
            showBankPassword={showBankPassword}
            setShowBankPassword={setShowBankPassword}
            showBankRePassword={showBankRePassword}
            setShowBankRePassword={setShowBankRePassword}
          />
        );
      case 2:
        return <PersonalInfoStep invite={invite} />;
      case 3:
        return (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              회원가입 완료!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              회원가입이 성공적으로 완료되었습니다.
            </Typography>
            <LoadingButton
              variant="contained"
              size="large"
              onClick={() => router.push("/")}
              sx={authButtonStyle}
              startIcon={<CheckCircle />}
            >
              로그인 페이지로 이동
            </LoadingButton>
          </Box>
        );
      default:
        return null;
    }
  };

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

            <Typography sx={authTitleStyle}>회원가입</Typography>
            <Typography sx={authSubtitleStyle}>
              정보를 입력하여 회원가입을 완료하세요
            </Typography>

            {/* 단계 표시기 */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      icon={
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            fontWeight: 600,
                            backgroundColor:
                              activeStep === index
                                ? step.color
                                : "rgba(255, 255, 255, 0.1)",
                            color: activeStep === index ? "white" : "#AEB0B4",
                            border: `2px solid ${
                              activeStep === index
                                ? step.color
                                : "rgba(255, 255, 255, 0.2)"
                            }`,
                            boxShadow:
                              activeStep === index
                                ? `0 0 10px ${step.color}40`
                                : "none",
                            transition: "all 0.3s ease",
                            animation:
                              activeStep === index
                                ? `${glow} 2s infinite`
                                : "none",
                          }}
                        >
                          {step.icon}
                        </Box>
                      }
                      sx={{
                        "& .MuiStepLabel-label": {
                          fontSize: "0.875rem",
                          fontWeight: activeStep === index ? 600 : 400,
                          color: activeStep === index ? step.color : "#AEB0B4",
                        },
                        "& .MuiStepLabel-labelContainer": {
                          "& .MuiStepLabel-label": {
                            color:
                              activeStep === index ? step.color : "#AEB0B4",
                          },
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onValidRegister)}>
                <Fade in key={activeStep} timeout={300}>
                  <Box>{renderStepContent(activeStep)}</Box>
                </Fade>

                <Divider sx={{ my: 3 }} />

                {activeStep < 3 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 3,
                    }}
                  >
                    <LoadingButton
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBack />}
                      sx={authButtonStyle}
                    >
                      이전
                    </LoadingButton>

                    {activeStep < 2 ? (
                      <LoadingButton
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForward />}
                        sx={authButtonStyle}
                      >
                        다음
                      </LoadingButton>
                    ) : activeStep === 2 ? (
                      <LoadingButton
                        variant="contained"
                        type="submit"
                        loading={loading}
                        disabled={isOk}
                        sx={authButtonStyle}
                        startIcon={<CheckCircle />}
                      >
                        회원가입
                      </LoadingButton>
                    ) : null}
                  </Box>
                )}
              </form>
            </FormProvider>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                이미 계정이 있으신가요?
              </Typography>
              <Link href="/" style={{ textDecoration: "none" }}>
                <LoadingButton variant="text" size="small" sx={authLinkStyle}>
                  로그인하기
                </LoadingButton>
              </Link>
            </Box>
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
};
