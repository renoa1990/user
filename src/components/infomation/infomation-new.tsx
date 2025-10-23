import React, { FC, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Pagination,
  Chip,
  Avatar,
  alpha,
  styled,
  useTheme,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  CampaignOutlined,
  ExpandMore,
  AccessTimeOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { infomation } from "@prisma/client";
import moment from "moment";

// 스타일드 컴포넌트들
const NoticeCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
    transform: "translateY(-2px)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const NoticeHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  padding: theme.spacing(2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface Props {
  list?: infomation[];
  listcount?: { _count: number };
  count?: number;
  mutate: () => void;
  page: number;
  handleChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  rowPerPage: number;
  adminName?: string;
}

export const InfomationNew: FC<Props> = ({
  list,
  listcount,
  mutate,
  page,
  handleChange,
  count,
  rowPerPage,
  adminName,
}) => {
  const theme = useTheme();
  const [expandedNotices, setExpandedNotices] = useState<Set<string>>(
    new Set()
  );

  const toggleNoticeExpansion = (noticeId: string) => {
    const newExpanded = new Set(expandedNotices);
    if (newExpanded.has(noticeId)) {
      newExpanded.delete(noticeId);
    } else {
      newExpanded.add(noticeId);
    }
    setExpandedNotices(newExpanded);
  };

  // 번호 계산
  let index =
    listcount?._count && count
      ? listcount?._count - rowPerPage * (page - 1) + 1
      : 0;
  const indexCounter = () => {
    if (index) {
      index = index - 1;
      return index;
    }
  };

  const totalCount = list?.length || 0;

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          공지사항
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CampaignOutlined color="primary" />
            <Typography variant="body1" color="text.secondary">
              총 {listcount?._count || 0}개
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 공지사항 리스트 */}
      {list && list.length > 0 ? (
        <Stack spacing={2}>
          {list.map((item) => {
            const isExpanded = expandedNotices.has(item.id.toString());
            const noticeNumber = indexCounter();

            return (
              <NoticeCard key={item.id}>
                <NoticeHeader
                  onClick={() => toggleNoticeExpansion(item.id.toString())}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.palette.primary.main,
                        fontSize: "1rem",
                      }}
                    >
                      <CampaignOutlined />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={`#${noticeNumber}`}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor: alpha(
                              theme.palette.grey[500],
                              0.1
                            ),
                            color: theme.palette.grey[600],
                          }}
                        />
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="text.primary"
                          sx={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <PersonOutlined
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {adminName || "관리자"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <AccessTimeOutlined
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {moment(item.createAt).format(
                              "YYYY년 MM월 DD일 HH:mm"
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <ExpandButton
                    expanded={isExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNoticeExpansion(item.id.toString());
                    }}
                  >
                    <ExpandMore />
                  </ExpandButton>
                </NoticeHeader>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <CardContent
                    sx={{
                      pt: 0,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      sx={{
                        px: { xs: 1, md: 3 },
                        py: 2,
                        "& img": {
                          maxWidth: "100%",
                          height: "auto",
                        },
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{ __html: item.text }}
                        style={{
                          fontSize: "0.875rem",
                          lineHeight: 1.8,
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Collapse>
              </NoticeCard>
            );
          })}
        </Stack>
      ) : (
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
          <CampaignOutlined
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            등록된 공지사항이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            새로운 공지사항이 등록되면 여기에 표시됩니다
          </Typography>
        </Box>
      )}

      {/* 페이지네이션 */}
      {count && count > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={count}
            page={page}
            onChange={handleChange}
            variant="outlined"
            shape="rounded"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default InfomationNew;
