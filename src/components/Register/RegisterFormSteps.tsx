import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { authTextFieldStyle, authFormSectionStyle } from "../auth/auth-styles";
import { bankList } from "./bankList";

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

interface BasicInfoStepProps {
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showRePassword: boolean;
  setShowRePassword: (show: boolean) => void;
  checkUserid: string;
  checkUserNickname: string;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  showPassword,
  setShowPassword,
  showRePassword,
  setShowRePassword,
  checkUserid,
  checkUserNickname,
}) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<RegisterForm>();
  const passwordWatch = watch("password");

  return (
    <Box sx={authFormSectionStyle}>
      <Typography className="section-title">
        <Person className="icon" />
        기본 정보
      </Typography>

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
              validate: (value) =>
                value !== checkUserid || "사용할수 없는 아이디입니다.",
            })}
            error={!!errors?.userId}
            helperText={errors?.userId ? errors.userId.message : null}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="닉네임"
            variant="outlined"
            fullWidth
            sx={authTextFieldStyle}
            {...register("nickName", {
              required: "닉네임을 입력하세요",
              pattern: {
                value: /^[ㄱ-ㅎ가-힣0-9a-zA-Z]*$/,
                message: "특수문자는 입력이 불가능합니다",
              },
              minLength: {
                value: 2,
                message: "2글자 이상 입력하세요",
              },
              maxLength: {
                value: 8,
                message: "8자를 초과할수 없습니다",
              },
              validate: (value) =>
                value !== checkUserNickname || "사용할수 없는 닉네임 입니다.",
            })}
            error={!!errors?.nickName}
            helperText={errors?.nickName ? errors.nickName.message : null}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="비밀번호"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            fullWidth
            sx={authTextFieldStyle}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("password", {
              required: "비밀번호를 입력하세요",
              minLength: {
                value: 4,
                message: "4글자 이상 입력하세요",
              },
            })}
            error={!!errors?.password}
            helperText={errors?.password ? errors.password.message : null}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="비밀번호 확인"
            variant="outlined"
            type={showRePassword ? "text" : "password"}
            fullWidth
            sx={authTextFieldStyle}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowRePassword(!showRePassword)}
                    edge="end"
                    size="small"
                  >
                    {showRePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("rePassword", {
              required: "비밀번호 확인을 입력하세요",
              validate: (value) =>
                value === passwordWatch || "비밀번호가 일치하지 않습니다",
            })}
            error={!!errors?.rePassword}
            helperText={errors?.rePassword ? errors.rePassword.message : null}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

interface BankInfoStepProps {
  showBankPassword: boolean;
  setShowBankPassword: (show: boolean) => void;
  showBankRePassword: boolean;
  setShowBankRePassword: (show: boolean) => void;
}

export const BankInfoStep: React.FC<BankInfoStepProps> = ({
  showBankPassword,
  setShowBankPassword,
  showBankRePassword,
  setShowBankRePassword,
}) => {
  const {
    register,
    formState: { errors },
    watch,
    control,
  } = useFormContext<RegisterForm>();
  const bankPasswordWatch = watch("bankPassword");

  return (
    <Box sx={authFormSectionStyle}>
      <Typography className="section-title">
        <Lock className="icon" />
        계좌 정보
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors?.bankName}>
            <InputLabel
              sx={{ color: "#AEB0B4", "&.Mui-focused": { color: "#00BFFF" } }}
            >
              은행명
            </InputLabel>
            <Controller
              name="bankName"
              control={control}
              rules={{
                required: "은행을 선택하세요",
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  sx={{
                    ...authTextFieldStyle,
                    "& .MuiSelect-select": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      color: "#EEEEEF",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(22, 22, 22, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0, 191, 255, 0.2)",
                        boxShadow: "0 8px 32px rgba(0, 191, 255, 0.1)",
                        "& .MuiMenuItem-root": {
                          backgroundColor: "transparent",
                          color: "#EEEEEF",
                          "&:hover": {
                            backgroundColor: "rgba(0, 191, 255, 0.1)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "rgba(0, 191, 255, 0.2)",
                            "&:hover": {
                              backgroundColor: "rgba(0, 191, 255, 0.3)",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {bankList.map((bank) => (
                    <MenuItem
                      key={bank}
                      value={bank === "선택하세요" ? "" : bank}
                    >
                      {bank}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors?.bankName && (
              <Typography
                sx={{ color: "#d32f2f", fontSize: "0.75rem", mt: 0.5 }}
              >
                {errors.bankName.message}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="bankNumber"
            control={control}
            rules={{
              required: "계좌번호를 입력하세요",
              minLength: {
                value: 10,
                message: "올바른 계좌번호를 입력하세요",
              },
            }}
            render={({ field }) => (
              <NumericFormat
                customInput={TextField}
                label="계좌번호"
                variant="outlined"
                fullWidth
                sx={authTextFieldStyle}
                thousandSeparator=""
                {...field}
                error={!!errors?.bankNumber}
                helperText={
                  errors?.bankNumber ? errors.bankNumber.message : null
                }
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="출금 비밀번호"
            variant="outlined"
            type={showBankPassword ? "text" : "password"}
            fullWidth
            sx={authTextFieldStyle}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowBankPassword(!showBankPassword)}
                    edge="end"
                    size="small"
                  >
                    {showBankPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("bankPassword", {
              required: "출금 비밀번호를 입력하세요",
              minLength: {
                value: 4,
                message: "4자리 이상 입력하세요",
              },
            })}
            error={!!errors?.bankPassword}
            helperText={
              errors?.bankPassword ? errors.bankPassword.message : null
            }
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="출금 비밀번호 확인"
            variant="outlined"
            type={showBankRePassword ? "text" : "password"}
            fullWidth
            sx={authTextFieldStyle}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowBankRePassword(!showBankRePassword)}
                    edge="end"
                    size="small"
                  >
                    {showBankRePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register("bankRePassword", {
              required: "출금 비밀번호 확인을 입력하세요",
              validate: (value) =>
                value === bankPasswordWatch ||
                "출금 비밀번호가 일치하지 않습니다",
            })}
            error={!!errors?.bankRePassword}
            helperText={
              errors?.bankRePassword ? errors.bankRePassword.message : null
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

interface PersonalInfoStepProps {
  invite: boolean;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  invite,
}) => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<RegisterForm>();

  return (
    <Box sx={authFormSectionStyle}>
      <Typography className="section-title">
        <Person className="icon" />
        개인 정보
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="이름"
            variant="outlined"
            fullWidth
            sx={authTextFieldStyle}
            {...register("name", {
              required: "이름을 입력하세요",
              pattern: {
                value: /^[가-힣]*$/,
                message: "한글만 입력 가능합니다",
              },
            })}
            error={!!errors?.name}
            helperText={errors?.name ? errors.name.message : null}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="birth"
            control={control}
            rules={{
              required: "생년월일을 입력하세요",
              pattern: {
                value: /^\d{8}$/,
                message: "YYYYMMDD 형식으로 입력하세요",
              },
            }}
            render={({ field }) => (
              <NumericFormat
                customInput={TextField}
                label="생년월일 (YYYYMMDD)"
                variant="outlined"
                fullWidth
                sx={authTextFieldStyle}
                {...field}
                error={!!errors?.birth}
                helperText={errors?.birth ? errors.birth.message : null}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="휴대폰 번호"
            variant="outlined"
            fullWidth
            sx={authTextFieldStyle}
            inputProps={{
              maxLength: 11,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            {...register("phone", {
              required: "휴대폰 번호를 입력하세요",
              pattern: {
                value: /^0\d{10}$/,
                message:
                  "올바른 휴대폰 번호를 입력하세요 (010으로 시작하는 11자리)",
              },
              minLength: {
                value: 11,
                message: "휴대폰 번호는 11자리여야 합니다",
              },
              maxLength: {
                value: 11,
                message: "휴대폰 번호는 11자리여야 합니다",
              },
            })}
            error={!!errors?.phone}
            helperText={errors?.phone ? errors.phone.message : null}
          />
        </Grid>

        {invite && (
          <Grid item xs={12}>
            <TextField
              label="추천인 아이디 (선택사항)"
              variant="outlined"
              fullWidth
              sx={authTextFieldStyle}
              {...register("invite")}
              error={!!errors?.invite}
              helperText={errors?.invite ? errors.invite.message : null}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
