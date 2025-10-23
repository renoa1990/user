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
  Collapse,
} from "@mui/material";
import {
  ForumOutlined,
  DeleteOutline,
  ExpandMore,
  AccessTimeOutlined,
  ReplyOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  FiberNewOutlined,
  AccountBalanceOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { contact, Parisuser } from "@prisma/client";
import moment from "moment";
import { modalConfirm } from "@components/ModalConfirm";
import useMutation from "@libs/useMutation";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { LoadingButton } from "@mui/lab";

// 스타일드 컴포넌트들
const ContactCard = styled(Card)(({ theme }) => ({
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
  "&.pending": {
    borderColor: alpha(theme.palette.warning.main, 0.3),
  },
}));

const ContactHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  padding: theme.spacing(2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const StatusChip = styled(Chip)<{ status: "pending" | "answered" | "new" }>(
  ({ theme, status }) => ({
    height: 24,
    fontSize: "0.75rem",
    fontWeight: 600,
    ...(status === "pending" && {
      backgroundColor: alpha(theme.palette.warning.main, 0.1),
      color: theme.palette.warning.main,
      border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
    }),
    ...(status === "answered" && {
      backgroundColor: alpha(theme.palette.success.main, 0.1),
      color: theme.palette.success.main,
      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
    }),
    ...(status === "new" && {
      backgroundColor: alpha(theme.palette.info.main, 0.1),
      color: theme.palette.info.main,
      border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
    }),
  })
);

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "expanded",
})<{ expanded: boolean }>(({ theme, expanded }) => ({
  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ReplyBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.primary.main, 0.03),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
}));

interface ContactUser extends contact {
  Parisuser: Parisuser;
}
interface Props {
  list?: ContactUser[];
  listcount?: { _count: number };
  count?: number;
  mutate: () => void;
  page: number;
  handleChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  rowPerPage: number;
}

interface View {
  ok: boolean;
}
interface DeleteRes {
  ok: boolean;
  contactDelete: boolean;
  nothing: boolean;
}
interface BankContactType {
  ok: boolean;
  message: string;
  variant: "success" | "error";
}

export const ContactListNew: FC<Props> = ({
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
  const router = useRouter();
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(
    new Set()
  );

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

  // API 호출
  const [contactView, { loading: viewLoading, data: viewData }] =
    useMutation<View>("/api/contact/view");
  const [contactDelete, { loading: deleteLoading, data: deleteData }] =
    useMutation<DeleteRes>("/api/contact/delete");
  const [bankContact, { loading: bankContactLoading, data: bankContactData }] =
    useMutation<BankContactType>("/api/contact/bankContact");

  const onView = (id: number) => {
    if (viewLoading) return;
    contactView({ id });
  };
  const onDelete = (id: number | undefined) => {
    if (deleteLoading) return;
    contactDelete({ id });
  };
  const onBankContact = () => {
    if (bankContactLoading) return;
    bankContact({});
  };

  const write = () => {
    const replyCheck = list?.some((item) => item.updateAt === null);

    if (replyCheck) {
      enqueueSnackbar("답변 대기중인 게시물이 있습니다.", {
        variant: "error",
      });
    } else {
      router.push("/contact/write");
    }
  };

  const toggleContactExpansion = (
    contactId: string,
    hasReply: boolean,
    isRead: boolean
  ) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
      // 답변이 있고 읽지 않은 경우 자동 읽음처리
      if (hasReply && !isRead) {
        const contactIdNumber = parseInt(contactId);
        onView(contactIdNumber);
      }
    }
    setExpandedContacts(newExpanded);
  };

  // API 응답 처리
  useEffect(() => {
    if (viewData && viewData.ok) {
      mutate();
    }
  }, [viewData, mutate]);

  useEffect(() => {
    if (deleteData) {
      if (deleteData.ok) {
        if (deleteData.contactDelete) {
          enqueueSnackbar("삭제가 완료되었습니다.", {
            variant: "success",
          });
        } else if (deleteData.nothing) {
          enqueueSnackbar("삭제할수 있는 문의가 없습니다.", {
            variant: "info",
          });
        }
      }
      mutate();
    }
  }, [deleteData, mutate, enqueueSnackbar]);

  useEffect(() => {
    if (bankContactData) {
      if (bankContactData.ok) {
        enqueueSnackbar(bankContactData.message, {
          variant: bankContactData.variant,
        });
      }
      mutate();
    }
  }, [bankContactData, mutate, enqueueSnackbar]);

  // 통계 계산
  const pendingCount = list?.filter((item) => !item.adminText).length || 0;
  const unreadCount =
    list?.filter((item) => item.adminText && !item.userCheck).length || 0;
  const totalCount = list?.length || 0;

  return (
    <Box sx={{ pt: 3, px: { xs: 1, sm: 0 } }}>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          고객센터
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ForumOutlined color="primary" />
            <Typography variant="body1" color="text.secondary">
              총 {totalCount}개
            </Typography>
          </Box>
          {pendingCount > 0 && (
            <Badge badgeContent={pendingCount} color="warning">
              <Typography
                variant="body1"
                color="warning.main"
                fontWeight="bold"
              >
                답변대기 {pendingCount}개
              </Typography>
            </Badge>
          )}
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="info">
              <Typography variant="body1" color="info.main" fontWeight="bold">
                읽지않음 {unreadCount}개
              </Typography>
            </Badge>
          )}
        </Box>

        {/* 액션 버튼들 */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditOutlined />}
            onClick={write}
            sx={{ borderRadius: 2 }}
          >
            문의하기
          </Button>
          <LoadingButton
            loading={bankContactLoading}
            variant="outlined"
            color="error"
            startIcon={<AccountBalanceOutlined />}
            onClick={onBankContact}
            sx={{ borderRadius: 2 }}
          >
            계좌문의
          </LoadingButton>
        </Box>
      </Box>

      {/* 문의 리스트 */}
      {list && list.length > 0 ? (
        <Stack spacing={2}>
          {list.map((item) => {
            const isExpanded = expandedContacts.has(item.id.toString());
            const hasReply = !!item.adminText;
            const isRead = item.userCheck;
            const contactNumber = indexCounter();

            // 상태 결정
            let status: "pending" | "answered" | "new";
            if (!hasReply) {
              status = "pending";
            } else if (hasReply && !isRead) {
              status = "new";
            } else {
              status = "answered";
            }

            return (
              <ContactCard
                key={item.id}
                className={!hasReply ? "pending" : !isRead ? "unread" : "read"}
              >
                <ContactHeader
                  onClick={() =>
                    toggleContactExpansion(item.id.toString(), hasReply, isRead)
                  }
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
                        bgcolor: !hasReply
                          ? theme.palette.warning.main
                          : !isRead
                          ? theme.palette.info.main
                          : theme.palette.success.main,
                        fontSize: "1rem",
                      }}
                    >
                      {!hasReply ? (
                        <HourglassEmptyOutlined />
                      ) : !isRead ? (
                        <FiberNewOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={`#${contactNumber}`}
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
                          fontWeight={!isRead && hasReply ? "bold" : "medium"}
                          color={
                            !isRead && hasReply
                              ? "text.primary"
                              : "text.secondary"
                          }
                          sx={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </Typography>
                        <StatusChip
                          label={
                            !hasReply
                              ? "답변대기"
                              : !isRead
                              ? "답변완료(NEW)"
                              : "답변완료"
                          }
                          size="small"
                          status={status}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {item.Parisuser?.nickName}
                        </Typography>
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
                      toggleContactExpansion(
                        item.id.toString(),
                        hasReply,
                        isRead
                      );
                    }}
                  >
                    <ExpandMore />
                  </ExpandButton>
                </ContactHeader>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <CardContent
                    sx={{
                      pt: 0,
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {/* 문의 내용 */}
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
                          color: theme.palette.text.primary,
                        }}
                      />
                    </Box>

                    {/* 답변 내용 */}
                    {item.adminTitle && item.adminText && (
                      <ReplyBox>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <ReplyOutlined
                            sx={{ color: "primary.main", fontSize: 20 }}
                          />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.adminTitle}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: "auto" }}
                          >
                            {moment(item.updateAt).format(
                              "YYYY년 MM월 DD일 HH:mm"
                            )}
                          </Typography>
                        </Box>
                        <div
                          dangerouslySetInnerHTML={{ __html: item.adminText }}
                          style={{
                            fontSize: "0.875rem",
                            lineHeight: 1.8,
                            color: theme.palette.text.secondary,
                          }}
                        />
                      </ReplyBox>
                    )}
                  </CardContent>

                  {/* 삭제 버튼 - 답변이 있을 때만 표시 */}
                  {item.adminText && (
                    <CardActions
                      sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutline />}
                        onClick={() => {
                          modalConfirm(
                            "confirm",
                            "삭제",
                            "한번 삭제하면 되돌릴수 없습니다. 삭제하시겠습니까?",
                            onDelete,
                            item.id
                          );
                        }}
                      >
                        삭제
                      </Button>
                    </CardActions>
                  )}
                </Collapse>
              </ContactCard>
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
          <ForumOutlined
            sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            문의 내역이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            궁금한 사항이 있으시면 문의하기를 이용해주세요
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

export default ContactListNew;
