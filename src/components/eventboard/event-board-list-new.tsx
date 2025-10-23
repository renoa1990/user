import React, { FC } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  alpha,
  styled,
  useTheme,
  Stack,
} from "@mui/material";
import {
  eventBoard,
  eventCalendarSetup,
  eventLoseAllSetup,
} from "@prisma/client";
import {
  EventAvailableOutlined,
  CalendarMonthOutlined,
  EmojiEventsOutlined,
  CardGiftcardOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { imageURL, imageURL2 } from "@libs/cfimageURL";

interface Props {
  eventBoard?: eventBoard[];
  eventCalendar?: eventCalendarSetup | null;
  eventLoseAll?: eventLoseAllSetup | null;
}

// 스타일드 컴포넌트들
const EventCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  position: "relative",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.15)}`,
    "& .event-overlay": {
      opacity: 1,
    },
    "& .event-image": {
      transform: "scale(1.05)",
    },
  },
}));

const EventImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  paddingTop: "31.25%", // 1280x400 비율 (400/1280 = 0.3125)
  overflow: "hidden",
  backgroundColor: "#f5f5f5",
});

const EventImage = styled(Image)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
});

const EventOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(to bottom, ${alpha(
    theme.palette.common.black,
    0
  )} 0%, ${alpha(theme.palette.common.black, 0.7)} 100%)`,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
  padding: theme.spacing(2),
}));

const EventBadge = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: "0.75rem",
  height: 28,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}`,
  zIndex: 1,
  "& .MuiChip-icon": {
    color: theme.palette.primary.contrastText,
  },
}));

const SpecialEventCard = styled(EventCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.05
  )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  "&:hover": {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

const PlaceholderBox = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.1
  )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
  padding: theme.spacing(4),
  textAlign: "center",
}));

export const EventBoardListNew: FC<Props> = ({
  eventBoard,
  eventCalendar,
  eventLoseAll,
}) => {
  const theme = useTheme();

  const renderEventImage = (
    url: string | null,
    title: string,
    icon: React.ReactNode
  ) => {
    if (url) {
      return (
        <>
          <EventImage
            className="event-image"
            alt={title}
            src={imageURL + url + imageURL2}
            width={600}
            height={338}
            loading="lazy"
            placeholder="blur"
            blurDataURL={imageURL + url + imageURL2}
          />
          <EventOverlay className="event-overlay">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="white"
                sx={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                자세히 보기
              </Typography>
              <ArrowForwardOutlined sx={{ color: "white" }} />
            </Stack>
          </EventOverlay>
        </>
      );
    }

    return (
      <PlaceholderBox>
        {icon}
        <Typography
          variant="h5"
          fontWeight="bold"
          color="primary"
          sx={{ mt: 2 }}
        >
          {title}
        </Typography>
      </PlaceholderBox>
    );
  };

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          이벤트
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EventAvailableOutlined color="primary" />
          <Typography variant="body1" color="text.secondary">
            진행중인 다양한 이벤트를 확인하세요
          </Typography>
        </Box>
      </Box>

      {/* 이벤트 그리드 */}
      <Grid container spacing={3}>
        {/* 출석체크 이벤트 */}
        {eventCalendar && (
          <Grid item xs={12} sm={6} md={4}>
            <Link href="/event/calendar" style={{ textDecoration: "none" }}>
              <SpecialEventCard>
                <EventImageContainer>
                  <EventBadge
                    icon={<CalendarMonthOutlined />}
                    label="매일 참여"
                    color="primary"
                  />
                  {renderEventImage(
                    eventCalendar.url,
                    "출석체크 이벤트",
                    <CalendarMonthOutlined
                      sx={{ fontSize: 64, color: "primary.main" }}
                    />
                  )}
                </EventImageContainer>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CalendarMonthOutlined
                        color="primary"
                        sx={{ fontSize: 20 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        출석체크 이벤트
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      매일 출석하고 특별한 보상을 받아가세요!
                    </Typography>
                  </Stack>
                </CardContent>
              </SpecialEventCard>
            </Link>
          </Grid>
        )}

        {/* 올미당첨 이벤트 */}
        {eventLoseAll && (
          <Grid item xs={12} sm={6} md={4}>
            <Link href="/event/loseAll" style={{ textDecoration: "none" }}>
              <SpecialEventCard>
                <EventImageContainer>
                  <EventBadge
                    icon={<EmojiEventsOutlined />}
                    label="특별 이벤트"
                    color="secondary"
                  />
                  {renderEventImage(
                    eventLoseAll.url,
                    "올미당첨 이벤트",
                    <EmojiEventsOutlined
                      sx={{ fontSize: 64, color: "secondary.main" }}
                    />
                  )}
                </EventImageContainer>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EmojiEventsOutlined
                        color="secondary"
                        sx={{ fontSize: 20 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        올미당첨 이벤트
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      올미당첨 조건 달성시 특별 혜택을 드립니다!
                    </Typography>
                  </Stack>
                </CardContent>
              </SpecialEventCard>
            </Link>
          </Grid>
        )}

        {/* 일반 이벤트 게시판 */}
        {eventBoard?.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Link
              href={`/event/${event.id}`}
              style={{ textDecoration: "none" }}
            >
              <EventCard>
                <EventImageContainer>
                  <EventBadge
                    icon={<CardGiftcardOutlined />}
                    label="이벤트"
                    color="error"
                  />
                  {renderEventImage(
                    event.url,
                    event.title,
                    <CardGiftcardOutlined
                      sx={{ fontSize: 64, color: "error.main" }}
                    />
                  )}
                </EventImageContainer>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CardGiftcardOutlined
                        color="error"
                        sx={{ fontSize: 20 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="text.primary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.title}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      이벤트 상세 내용을 확인하시려면 클릭하세요!
                    </Typography>
                  </Stack>
                </CardContent>
              </EventCard>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* 이벤트가 없을 때 */}
      {!eventCalendar &&
        !eventLoseAll &&
        (!eventBoard || eventBoard.length === 0) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              textAlign: "center",
            }}
          >
            <EventAvailableOutlined
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              진행중인 이벤트가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              곧 새로운 이벤트가 시작될 예정입니다
            </Typography>
          </Box>
        )}
    </Box>
  );
};

export default EventBoardListNew;
