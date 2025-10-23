import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  alpha,
  styled,
  useTheme,
} from "@mui/material";
import {
  MailOutline,
  DeleteOutline,
  DeleteSweepOutlined,
  MarkEmailReadOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import { message } from "@prisma/client";
import moment from "moment";
import { modalConfirm } from "@components/ModalConfirm";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";

// 스타일드 컴포넌트들
const MessageCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
    transform: "translateY(-2px)",
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  "&.unread": {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  "&.read": {
    opacity: 0.8,
  },
}));

const MessageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
}));

const MessageContent = styled(Box)(({ theme }) => ({
  "& .message-text": {
    fontSize: "0.875rem",
    lineHeight: 1.6,
    color: theme.palette.text.secondary,
    maxHeight: "3.5rem",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
  },
  "& .message-text.expanded": {
    maxHeight: "none",
    WebkitLineClamp: "none",
  },
}));

const StatusChip = styled(Chip)<{ unread?: boolean }>(({ theme, unread }) => ({
  height: 24,
  fontSize: "0.75rem",
  fontWeight: 600,
  ...(unread && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }),
  ...(!unread && {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
    color: theme.palette.grey[600],
  }),
}));

interface Props {
  list?: message[];
  listcount?: { _count: number };
  count?: number;
  mutate: () => void;
  page: number;
  handleChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  rowPerPage: number;
}

interface MessageView {
  ok: boolean;
  nothing: boolean;
}

interface MessageDelete {
  ok: boolean;
  nothing: boolean;
  deletelist: boolean;
}

interface MessageDeleteAll {
  ok: boolean;
  nothing: boolean;
  deleteAll: boolean;
}

interface MessageViewAll {
  ok: boolean;
  nothing: boolean;
  viewAll: boolean;
}

export const MessageInboxNew: FC<Props> = ({
  list,
  listcount,
  mutate,
  page,
  handleChange,
  count,
  rowPerPage,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set()
  );

  // API 호출
  const [messageView, { loading: messageViewLoading, data: messageViewData }] =
    useMutation<MessageView>("/api/message/view");
  const [
    messageDelete,
    { loading: messageDeleteLoading, data: messageDeleteData },
  ] = useMutation<MessageDelete>("/api/message/delete");
  const [
    messageDeleteAll,
    { loading: messageDeleteAllLoading, data: messageDeleteAllData },
  ] = useMutation<MessageDeleteAll>("/api/message/deleteall");
  const [
    messageViewAll,
    { loading: messageViewAllLoading, data: messageViewAllData },
  ] = useMutation<MessageViewAll>("/api/message/viewall");

  // API 응답 처리
  useEffect(() => {
    if (messageViewData && messageViewData.ok) {
      mutate();
    }
  }, [messageViewData, mutate]);

  useEffect(() => {
    if (messageViewAllData && messageViewAllData.ok) {
      if (messageViewAllData.viewAll) {
        enqueueSnackbar("전체읽음 처리가 완료되었습니다.", {
          variant: "success",
        });
      } else if (messageViewAllData.nothing) {
        enqueueSnackbar("읽음 처리할 쪽지가 없습니다.", {
          variant: "info",
        });
      }
      mutate();
    }
  }, [messageViewAllData, mutate, enqueueSnackbar]);

  useEffect(() => {
    if (messageDeleteData) {
      if (messageDeleteData.ok) {
        if (messageDeleteData.deletelist) {
          enqueueSnackbar("삭제가 완료되었습니다.", {
            variant: "success",
          });
        } else if (messageDeleteData.nothing) {
          enqueueSnackbar("이미 삭제되었습니다.", {
            variant: "info",
          });
        }
      }
      mutate();
    }
  }, [messageDeleteData, mutate, enqueueSnackbar]);

  useEffect(() => {
    if (messageDeleteAllData) {
      if (messageDeleteAllData.ok) {
        if (messageDeleteAllData.deleteAll) {
          enqueueSnackbar("삭제가 완료되었습니다.", {
            variant: "success",
          });
        } else if (messageDeleteAllData.nothing) {
          enqueueSnackbar("삭제할 수 있는 쪽지가 없습니다.", {
            variant: "info",
          });
        }
      }
      mutate();
    }
  }, [messageDeleteAllData, mutate, enqueueSnackbar]);

  // 핸들러 함수들
  const onMessageView = (id: number) => {
    if (messageViewLoading) return;
    messageView({ id });
  };

  const onDelete = (id: number | undefined) => {
    if (messageDeleteLoading) return;
    messageDelete({ id });
  };

  const onDeleteAll = () => {
    if (messageDeleteAllLoading) return;
    const hasReadMessages = list?.some((i) => i.userCheck === true);
    if (hasReadMessages) {
      messageDeleteAll({});
    } else {
      enqueueSnackbar("삭제할 수 있는 쪽지가 없습니다.", {
        variant: "info",
      });
    }
  };

  const onViewAll = () => {
    if (messageViewAllLoading) return;
    const hasUnreadMessages = list?.some((i) => i.userCheck === false);
    if (hasUnreadMessages) {
      messageViewAll({});
    } else {
      enqueueSnackbar("읽음 처리할 쪽지가 없습니다.", {
        variant: "info",
      });
    }
  };

  const toggleMessageExpansion = (messageId: string, isUnread: boolean) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
      // 더보기 클릭시 읽지 않은 메시지라면 자동으로 읽음처리
      if (isUnread) {
        const messageIdNumber = parseInt(messageId);
        onMessageView(messageIdNumber);
      }
    }
    setExpandedMessages(newExpanded);
  };

  // 통계 계산
  const unreadCount = list?.filter((item) => !item.userCheck).length || 0;
  const totalCount = list?.length || 0;

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          쪽지함
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MailOutline color="primary" />
            <Typography variant="body1" color="text.secondary">
              총 {totalCount}개
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error">
              <Typography variant="body1" color="primary" fontWeight="bold">
                읽지 않음 {unreadCount}개
              </Typography>
            </Badge>
          )}
        </Box>

        {/* 액션 버튼들 */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<MarkEmailReadOutlined />}
            onClick={onViewAll}
            disabled={messageViewAllLoading || unreadCount === 0}
            sx={{ borderRadius: 2 }}
          >
            전체 읽음
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepOutlined />}
            onClick={() => {
              modalConfirm(
                "confirm",
                "전체 삭제",
                "읽은 쪽지를 모두 삭제하시겠습니까?",
                onDeleteAll
              );
            }}
            disabled={messageDeleteAllLoading}
            sx={{ borderRadius: 2 }}
          >
            전체 삭제
          </Button>
        </Box>
      </Box>

      {/* 메시지 리스트 */}
      {list && list.length > 0 ? (
        <Stack spacing={2}>
          {list.map((item) => {
            const isUnread = !item.userCheck;
            const isExpanded = expandedMessages.has(item.id.toString());

            return (
              <MessageCard
                key={item.id}
                className={isUnread ? "unread" : "read"}
              >
                <CardContent>
                  <MessageHeader>
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
                          bgcolor: isUnread
                            ? theme.palette.primary.main
                            : theme.palette.grey[400],
                          fontSize: "1rem",
                        }}
                      >
                        <MailOutline />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={isUnread ? "bold" : "medium"}
                            color={isUnread ? "text.primary" : "text.secondary"}
                            sx={{ flex: 1 }}
                          >
                            {item.title}
                          </Typography>
                          <StatusChip
                            label={isUnread ? "읽지 않음" : "읽음"}
                            size="small"
                            unread={isUnread}
                          />
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="삭제">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            modalConfirm(
                              "confirm",
                              "삭제",
                              "이 쪽지를 삭제하시겠습니까?",
                              onDelete,
                              item.id
                            );
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </MessageHeader>

                  <MessageContent>
                    <div
                      className={`message-text ${isExpanded ? "expanded" : ""}`}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                    {!isExpanded && (
                      <Button
                        size="small"
                        onClick={() =>
                          toggleMessageExpansion(item.id.toString(), isUnread)
                        }
                        sx={{ mt: 1, p: 0, minWidth: "auto" }}
                      >
                        더 보기
                      </Button>
                    )}
                  </MessageContent>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", px: 3, pb: 2 }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        toggleMessageExpansion(item.id.toString(), isUnread)
                      }
                    >
                      {isExpanded ? "접기" : "펼치기"}
                    </Button>
                    {isUnread && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onMessageView(item.id)}
                      >
                        읽음 처리
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </MessageCard>
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
          <MailOutline sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            받은 쪽지가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            새로운 쪽지가 도착하면 여기에 표시됩니다
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

export default MessageInboxNew;
