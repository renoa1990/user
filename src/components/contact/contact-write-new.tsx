import React, { FC, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Alert,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import {
  EditOutlined,
  SendOutlined,
  InfoOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

interface ContactForm {
  title: string;
  text: string;
}

interface Mut {
  ok: boolean;
  message?: string;
  contact?: boolean;
}

// 스타일드 컴포넌트들
const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(3),
  color: theme.palette.primary.contrastText,
}));

const InfoBox = styled(Alert)(({ theme }) => ({
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.info.main, 0.05),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  "& .MuiAlert-icon": {
    color: theme.palette.info.main,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 12,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}));

export const ContactWriteNew: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>();

  const [contact, { loading, data }] = useMutation<Mut>("/api/contact/write");

  const onValid = (formData: ContactForm) => {
    if (loading) return;
    contact(formData);
  };

  useEffect(() => {
    if (data) {
      if (data?.ok) {
        if (data.contact) {
          enqueueSnackbar("고객센터 문의를 완료하였습니다.", {
            variant: "success",
          });
          router.push("/contact");
        } else if (data.message) {
          enqueueSnackbar(`${data.message}`, {
            variant: "error",
          });
        }
      }
    }
  }, [data, router, enqueueSnackbar]);

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined />}
            onClick={() => router.push("/contact")}
            sx={{ borderRadius: 2 }}
          >
            목록으로
          </Button>
        </Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          문의하기
        </Typography>
        <Typography variant="body1" color="text.secondary">
          궁금하신 사항을 문의해주시면 신속하게 답변드리겠습니다
        </Typography>
      </Box>

      {/* 안내 사항 */}
      <InfoBox icon={<InfoOutlined />} severity="info" sx={{ mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight="600">
            문의 전 확인해주세요
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <li>
              <Typography variant="body2">
                사이트 이용에 관한 사항은 이용가이드를 먼저 확인해주세요.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                문의시 사이트 비방 또는 운영자에 대한 반말/욕설을 하는 경우 문의
                내용과 관계 없이 패널티가 부여될 수 있습니다.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                답변 대기중인 문의가 있으면 새로운 문의를 작성할 수 없습니다.
              </Typography>
            </li>
          </Box>
        </Stack>
      </InfoBox>

      {/* 문의 작성 폼 */}
      <form onSubmit={handleSubmit(onValid)}>
        <FormCard>
          <HeaderBox>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditOutlined sx={{ fontSize: 28 }} />
              <Typography variant="h6" fontWeight="bold">
                문의 내용 작성
              </Typography>
            </Box>
          </HeaderBox>

          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* 제목 입력 */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  제목{" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </Typography>
                <StyledTextField
                  placeholder="문의 제목을 입력해주세요"
                  variant="outlined"
                  fullWidth
                  {...register("title", {
                    required: "제목을 입력해주세요",
                  })}
                  error={!!errors?.title}
                  helperText={errors?.title?.message}
                  InputProps={{
                    startAdornment: (
                      <EditOutlined
                        sx={{
                          mr: 1,
                          fontSize: 20,
                          color: "text.secondary",
                        }}
                      />
                    ),
                  }}
                />
              </Box>

              {/* 내용 입력 */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight="600"
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  문의 내용{" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </Typography>
                <StyledTextField
                  placeholder="문의하실 내용을 자세히 작성해주세요&#10;&#10;상세한 내용을 작성해주시면 더 정확한 답변을 받으실 수 있습니다."
                  variant="outlined"
                  multiline
                  rows={12}
                  fullWidth
                  {...register("text", {
                    required: "문의 내용을 입력해주세요",
                  })}
                  error={!!errors?.text}
                  helperText={errors?.text?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      alignItems: "flex-start",
                    },
                  }}
                />
              </Box>

              {/* 제출 버튼 */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  pt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => router.push("/contact")}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  취소
                </Button>
                <LoadingButton
                  loading={loading}
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<SendOutlined />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                    "&:hover": {
                      boxShadow: `0 6px 16px ${alpha(
                        theme.palette.primary.main,
                        0.4
                      )}`,
                    },
                  }}
                >
                  문의하기
                </LoadingButton>
              </Box>
            </Stack>
          </CardContent>
        </FormCard>
      </form>

      {/* 추가 안내 */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: alpha(theme.palette.grey[500], 0.05),
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          💡 빠른 답변을 위한 팁
        </Typography>
        <Stack spacing={0.5} sx={{ pl: 2 }}>
          <Typography variant="body2" color="text.secondary">
            • 문의 제목은 간단명료하게 작성해주세요
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 문제 발생 시 상황을 구체적으로 설명해주세요
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • 계정 관련 문의 시 닉네임을 함께 작성해주세요
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default ContactWriteNew;
