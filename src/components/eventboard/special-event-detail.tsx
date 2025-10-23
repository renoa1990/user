import React, { FC, ReactNode } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  EmojiEventsOutlined,
  ArrowBackOutlined,
} from "@mui/icons-material";
import Image from "next/image";
import { imageURL, imageURL2 } from "@libs/cfimageURL";
import { useRouter } from "next/router";

interface Props {
  title: string;
  type: "calendar" | "loseAll";
  url?: string | null;
  img?: string | null;
  contents?: string | null;
  children?: ReactNode; // 달력이나 이벤트 현황 같은 추가 콘텐츠
}

// 스타일드 컴포넌트들
const HeroSection = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "3.2 / 1", // 1280x400 비율
  minHeight: "250px",
  maxHeight: "500px",
  borderRadius: 24,
  overflow: "hidden",
  marginBottom: theme.spacing(4),
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
  [theme.breakpoints.down("md")]: {
    aspectRatio: "2.5 / 1",
    minHeight: "200px",
  },
  [theme.breakpoints.down("sm")]: {
    aspectRatio: "2 / 1",
    minHeight: "180px",
    borderRadius: 16,
  },
}));

const HeroOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: `linear-gradient(to top, ${alpha(
    theme.palette.common.black,
    0.8
  )} 0%, ${alpha(theme.palette.common.black, 0)} 100%)`,
  padding: theme.spacing(4),
  color: "white",
}));

const ContentCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
  overflow: "hidden",
  marginBottom: theme.spacing(3),
}));

const DetailImage = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: theme.spacing(3),
  boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
}));

const EventBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.875rem",
  height: 32,
  borderRadius: 16,
  "& .MuiChip-icon": {
    color: "inherit",
  },
}));

const PlaceholderBox = styled(Box)(({ theme }) => ({
  width: "100%",
  aspectRatio: "3.2 / 1", // 1280x400 비율
  minHeight: "250px",
  maxHeight: "500px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 24,
  padding: theme.spacing(6),
  textAlign: "center",
  [theme.breakpoints.down("md")]: {
    aspectRatio: "2.5 / 1",
    minHeight: "200px",
  },
  [theme.breakpoints.down("sm")]: {
    aspectRatio: "2 / 1",
    minHeight: "180px",
    borderRadius: 16,
    padding: theme.spacing(4),
  },
}));

export const SpecialEventDetail: FC<Props> = ({
  title,
  type,
  url,
  img,
  contents,
  children,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const eventConfig = {
    calendar: {
      icon: <CalendarMonthOutlined />,
      badge: "매일 참여",
      color: theme.palette.primary,
      gradient: `linear-gradient(135deg, ${alpha(
        theme.palette.primary.main,
        0.1
      )} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
    },
    loseAll: {
      icon: <EmojiEventsOutlined />,
      badge: "특별 이벤트",
      color: theme.palette.secondary,
      gradient: `linear-gradient(135deg, ${alpha(
        theme.palette.secondary.main,
        0.1
      )} 0%, ${alpha(theme.palette.warning.main, 0.1)} 100%)`,
    },
  };

  const config = eventConfig[type];

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined />}
            onClick={() => router.push("/event")}
            sx={{ borderRadius: 2 }}
          >
            목록으로
          </Button>
        </Box>
      </Box>

      {/* Hero 이미지 섹션 */}
      {url ? (
        <HeroSection>
          <Image
            src={imageURL + url + imageURL2}
            alt={title}
            width={1280}
            height={400}
            loading="lazy"
            placeholder="blur"
            blurDataURL={imageURL + url + imageURL2}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <HeroOverlay>
            <Stack spacing={2}>
              <EventBadge
                icon={config.icon}
                label={config.badge}
                sx={{
                  bgcolor: config.color.main,
                  color: config.color.contrastText,
                  boxShadow: `0 2px 8px ${alpha(config.color.main, 0.3)}`,
                }}
              />
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  [theme.breakpoints.down("md")]: {
                    fontSize: "2rem",
                  },
                }}
              >
                {title}
              </Typography>
            </Stack>
          </HeroOverlay>
        </HeroSection>
      ) : (
        <PlaceholderBox sx={{ background: config.gradient }}>
          <Box sx={{ fontSize: 80, color: config.color.main, mb: 2 }}>
            {config.icon}
          </Box>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ color: config.color.main }}
          >
            {title}
          </Typography>
        </PlaceholderBox>
      )}

      {/* 상세 이미지 */}
      {img && (
        <DetailImage>
          <Image
            src={imageURL + img + imageURL2}
            alt={`${title} 상세`}
            width={1920}
            height={2000}
            loading="lazy"
            placeholder="blur"
            quality={100}
            blurDataURL={imageURL + img + imageURL2}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </DetailImage>
      )}

      {/* 이벤트 내용 */}
      {contents && (
        <ContentCard>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                {config.icon}
                <Typography variant="h5" fontWeight="bold">
                  이벤트 상세 안내
                </Typography>
              </Stack>
              <Divider />
            </Box>

            <Box
              sx={{
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 2,
                  marginTop: 2,
                  marginBottom: 2,
                },
                "& p": {
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  marginBottom: 2,
                  color: theme.palette.text.primary,
                },
                "& h1, & h2, & h3, & h4, & h5, & h6": {
                  fontWeight: 700,
                  marginTop: 3,
                  marginBottom: 2,
                  color: theme.palette.text.primary,
                },
                "& ul, & ol": {
                  paddingLeft: 3,
                  marginBottom: 2,
                },
                "& li": {
                  marginBottom: 1,
                  lineHeight: 1.8,
                },
                "& a": {
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                },
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: contents }} />
            </Box>
          </CardContent>
        </ContentCard>
      )}

      {/* 추가 콘텐츠 (달력, 이벤트 현황 등) */}
      {children && (
        <ContentCard>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>{children}</CardContent>
        </ContentCard>
      )}

      {/* 하단 액션 버튼 */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          size="large"
          startIcon={<ArrowBackOutlined />}
          onClick={() => router.push("/event")}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 700,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            "&:hover": {
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          이벤트 목록으로
        </Button>
      </Box>

      {/* 추가 안내 */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: alpha(config.color.main, 0.05),
          border: `1px solid ${alpha(config.color.main, 0.2)}`,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: config.color.main }}
          fontWeight="600"
          gutterBottom
        >
          💡 이벤트 참여 안내
        </Typography>
        <Stack spacing={0.5} sx={{ pl: 2 }}>
          {type === "calendar" ? (
            <>
              <Typography variant="body2" color="text.secondary">
                • 매일 출석체크하고 포인트를 받아가세요
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 연속 출석일수가 많을수록 더 많은 혜택을 받으실 수 있습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 출석체크는 매일 자정에 초기화됩니다
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary">
                • 조건을 충족하신 분들께 자동으로 혜택이 지급됩니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 이벤트 참여 내역은 마이페이지에서 확인하실 수 있습니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 중복 참여 및 부정 행위 적발시 혜택이 회수될 수 있습니다
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SpecialEventDetail;
