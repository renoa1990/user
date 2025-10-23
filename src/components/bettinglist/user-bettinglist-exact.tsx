import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import { useTheme, styled, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Chip,
  Button,
  useMediaQuery,
  Pagination,
  Stack,
} from "@mui/material";
import { useSnackbar } from "notistack";
import Image from "next/image";
import moment from "moment";
import numeral from "numeral";
import { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import HMobiledataIcon from "@mui/icons-material/HMobiledata";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import {
  SportsSetup,
  Team,
  betDetail,
  bettinglist,
  gameMemo,
  league,
} from "@prisma/client";
import chengeTitle from "@libs/changeTitle";
import { eventImg } from "@libs/changeImg";
import { imageURL, imageURL2 } from "@libs/cfimageURL";

// CSS 변수들을 사용한 styled components
const StyledSection = styled("section")(({ theme }) => ({
  "& *": {
    margin: 0,
    padding: 0,
    border: 0,
    fontFamily: "inherit",
    fontSize: "inherit",
    color: "inherit",
    letterSpacing: "inherit",
    fontStyle: "normal",
    textDecoration: "none",
    listStyle: "none",
    boxSizing: "border-box",
    fontSmoothing: "antialiased",
    textSizeAdjust: "none",
    tapHighlightColor: "transparent",
  },
}));

const GmWrap = styled("div")(({ theme }) => ({
  fontFamily: '"aTitGD", "Malgun Gothic", "sans-serif", "Arial"',
  fontSize: "14px",
  color: "#fff",
  letterSpacing: "0.005em",
  lineHeight: "1.3",
}));

const GmHead = styled("div")(({ theme }) => ({
  background: "linear-gradient(135deg, #1a1a1a 0%, #252525 100%)",
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  "& ul": {
    display: "flex",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  "& li": {
    padding: "8px",
    textAlign: "center",
    fontSize: "small",
    fontWeight: "bold",
    color: "#fff",
  },
  "& .col-date": {
    width: "10%",
    minWidth: "80px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-league": {
    width: "13%",
    minWidth: "100px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-type": {
    width: "10%",
    minWidth: "70px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-home": {
    width: "27%",
    minWidth: "150px",
  },
  "& .col-score-home": {
    width: "5%",
    minWidth: "30px",
  },
  "& .col-vs": {
    width: "6%",
    minWidth: "50px",
  },
  "& .col-score-away": {
    width: "5%",
    minWidth: "30px",
  },
  "& .col-away": {
    width: "27%",
    minWidth: "150px",
  },
  "& .col-rslt": {
    flex: 1,
    minWidth: "60px",
  },
}));

const GmList = styled("div")(({ theme }) => ({
  borderBottom: "1px solid rgba(59, 59, 60, 0.3)", // --border
}));

const GmTit = styled("div")(({ theme }) => ({
  backgroundColor: "#1c1c1c", // --bg-body
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  "& img": {
    width: "20px",
    height: "20px",
  },
  "& .type": {
    color: "#fff",
    fontWeight: "bold",
  },
  "& span:last-child": {
    color: "#fff",
    fontSize: "14px",
  },
  "& .date-bx.mobile": {
    display: "none", // 모바일에서만 표시
    marginLeft: "auto",
    "& em": {
      color: "#E00A15", // --primary
    },
  },
}));

const GmItem = styled("ul")(({ theme }) => ({
  display: "flex",
  listStyle: "none",
  padding: 0,
  margin: 0,
  backgroundColor: "#262626", // --bg-container
  "& li": {
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50px",
    border: "1px solid #3b3b3c",
  },
  "& .col-date": {
    width: "10%",
    minWidth: "80px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-league": {
    width: "13%",
    minWidth: "100px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-type": {
    width: "10%",
    minWidth: "70px",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  "& .col-home": {
    width: "27%",
    minWidth: "150px",
  },
  "& .col-score-home": {
    width: "5%",
    minWidth: "30px",
  },
  "& .col-vs": {
    width: "6%",
    minWidth: "50px",
  },
  "& .col-score-away": {
    width: "5%",
    minWidth: "30px",
  },
  "& .col-away": {
    width: "27%",
    minWidth: "150px",
  },
  "& .col-rslt": {
    flex: 1,
    minWidth: "60px",
  },
}));

const GmBx = styled("div")(({ theme }) => ({
  width: "100%",
  textAlign: "center",
  "&.date-bx": {
    "& em": {
      color: "#E00A15", // --primary
      fontWeight: "bold",
    },
  },
  "&.type-bx": {
    color: "#fff",
    fontSize: "14px",
  },
  "&.home-bx, &.away-bx": {
    backgroundColor: "#252525", // --game-bx
    border: "1px solid #3b3b3c",
    borderRadius: "4px",
    padding: "8px",
    minHeight: "50px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "&.my-select": {
      backgroundColor: "#51090d", // --game-bx-select
      border: `2px solid ${theme.palette.primary.main}`,
    },
    "& .team": {
      color: "#fff",
      fontSize: "13px",
      fontWeight: "bold",
      marginBottom: "4px",
    },
    "& .tm-score": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      "& span": {
        color: "#fff",
        fontWeight: "bold",
      },
      "& .ico": {
        fontSize: "10px",
        "&.over": {
          color: "#E00A15", // --primary
        },
        "&.under": {
          color: "#22a7ff", // --blue-400
        },
      },
    },
  },
  "&.vs-bx": {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
  },
  "&.score-bx": {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "bold",
  },
  "&.rslt-bx": {
    "& .color04": {
      color: "#E00A15", // --primary
      fontWeight: "bold",
    },
  },
}));

const BetItem = styled(Box)(({ theme }) => ({
  display: "block",
  listStyle: "none",
  margin: 0,
  backgroundColor: "#1c1c1c", // --bg-body
  padding: "12px 16px",
  borderTop: "1px solid #3b3b3c",
}));

// 유틸리티 함수들
const flegFunction = (item?: string | null) => {
  if (item) {
    if (item.includes("/")) {
      return item;
    } else {
      return imageURL + item + imageURL2;
    }
  } else return "/images/flag/u/United Nations.png";
};

const fontColor = (status: string) => {
  switch (status) {
    case "win":
      return "primary.main";
    case "lose":
      return "error.main";
    case "cancle":
      return "error.main";
    default:
      return "text.secondary";
  }
};

// gameCode별 이모지 매핑
const getGameEmoji = (gameCode: string) => {
  switch (gameCode) {
    case "크로스":
      return "⚽";
    case "스페셜":
      return "🎯";
    case "실시간":
      return "🔴";
    case "미니게임":
      return "🎮";
    case "스포츠":
      return "⚽";
    default:
      return "📋";
  }
};

// 타입별 배지 스타일 (재사용)
const getTypeBadgeStyle = (gameType: string, theme: any) => ({
  height: 20,
  fontSize: 11,
  fontWeight: 700,
  backgroundColor:
    gameType === "handicap"
      ? alpha(theme.palette.primary.main, 0.2)
      : gameType.includes("unover")
      ? alpha(theme.palette.error.main, 0.2)
      : alpha(theme.palette.info.main, 0.2),
  color:
    gameType === "handicap"
      ? "primary.main"
      : gameType.includes("unover")
      ? "error.main"
      : "info.main",
  border:
    gameType === "handicap"
      ? `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
      : gameType.includes("unover")
      ? `1px solid ${alpha(theme.palette.error.main, 0.4)}`
      : `1px solid ${alpha(theme.palette.info.main, 0.4)}`,
  "& .MuiChip-label": {
    px: 0.8,
  },
});

// 상태별 아이콘 가져오기
const getStatusIcon = (status: string, size: number = 14) => {
  if (status === "win") {
    return <CheckCircleIcon sx={{ fontSize: `${size}px !important` }} />;
  } else if (status === "lose" || status === "cancle") {
    return <CancelIcon sx={{ fontSize: `${size}px !important` }} />;
  } else {
    return <PendingIcon sx={{ fontSize: `${size}px !important` }} />;
  }
};

// 상태별 배지 색상
const getStatusColor = (status: string): "primary" | "error" | "default" => {
  if (status === "win") return "primary";
  if (status === "lose" || status === "cancle") return "error";
  return "default";
};

interface details extends betDetail {
  away_TeamName: Team;
  home_TeamName: Team;
  leagueName: league;
  gameMemo: gameMemo;
}

interface detail extends bettinglist {
  betDetail: details[];
}

interface mutate {
  ok: boolean;
}

interface props {
  list?: detail[];
  count: number;
  page: number;
  handleChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  mutate: () => void;
  setup: SportsSetup;
}

const UserBettingListExact: React.FC<props> = ({
  list,
  count,
  page,
  handleChange,
  mutate,
  setup,
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const nowTime = useMemo(() => Date.now(), []); // 현재 시간 계산
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // 모바일 화면인지 확인
  const [value, setValue] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // 선택된 항목이 있는지 계산
  const buttonValue = useMemo(() => value.length === 0, [value]);

  const { trigger: deleteTrigger } = useSWRMutation(
    "/api/betlist/delete",
    async (url: string, { arg }: { arg: any }) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      return response.json();
    }
  );

  const { trigger: cancelTrigger } = useSWRMutation(
    "/api/betlist/cancle",
    async (url: string, { arg }: { arg: any }) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      });
      return response.json();
    }
  );

  const handleCancel = useCallback(
    async (betId: string) => {
      try {
        await cancelTrigger({ betId });
        mutate();
        enqueueSnackbar("베팅이 취소되었습니다.", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("베팅 취소에 실패했습니다.", { variant: "error" });
      }
    },
    [cancelTrigger, mutate, enqueueSnackbar]
  );

  const onCheck = useCallback((id: number) => {
    setValue((prev) =>
      prev.some((checkItem) => checkItem === id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  }, []);

  const onCheckAll = useCallback(() => {
    if (selectAll) {
      setValue([]);
      setSelectAll(false);
    } else {
      const allIds = list?.map((item) => item.id) || [];
      setValue(allIds);
      setSelectAll(true);
    }
  }, [selectAll, list]);

  // 전체 선택 상태 업데이트
  useEffect(() => {
    if (list && list.length > 0) {
      if (value.length === list.length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
    }
  }, [value, list]);

  const onDelete = useCallback(
    async (id?: number, type?: string) => {
      try {
        if (type === "check") {
          // 선택된 항목들 삭제
          for (const checkId of value) {
            await deleteTrigger({ betId: checkId.toString() });
          }
          setValue([]);
        } else if (type === "all") {
          // 종료된 항목들 전체 삭제
          const endedItems =
            list?.filter((item) => item.status !== "ready") || [];
          for (const item of endedItems) {
            await deleteTrigger({ betId: item.id.toString() });
          }
        } else if (id) {
          // 개별 삭제
          await deleteTrigger({ betId: id.toString() });
        }
        mutate();
        enqueueSnackbar("삭제되었습니다.", { variant: "success" });
      } catch (error) {
        enqueueSnackbar("삭제에 실패했습니다.", { variant: "error" });
      }
    },
    [value, list, deleteTrigger, mutate, enqueueSnackbar]
  );

  if (!list || list.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        베팅 내역이 없습니다.
      </Box>
    );
  }

  return (
    <StyledSection className="gm-wrap bet-list">
      <GmWrap>
        {/* 삭제 버튼들 */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: { xs: 1, md: 2 },
            mb: 2,
            borderRadius: 2,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(10px)",
            border: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="label"
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 1,
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onCheckAll}
                style={{
                  cursor: "pointer",
                  width: "18px",
                  height: "18px",
                  accentColor: theme.palette.primary.main,
                }}
              />
              <Typography fontSize="small" fontWeight="bold">
                전체 선택
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              color="warning"
              disabled={buttonValue}
              sx={{
                py: { xs: 0.8, md: 1 },
                px: { xs: 1.5, md: 2 },
                fontSize: { xs: 11, md: "small" },
                fontWeight: 700,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(237, 108, 2, 0.4)",
                },
              }}
              onClick={() => onDelete(undefined, "check")}
            >
              🗑️ 선택내역 삭제
            </Button>
            <Button
              variant="contained"
              size="small"
              color="error"
              sx={{
                py: { xs: 0.8, md: 1 },
                px: { xs: 1.5, md: 2 },
                fontSize: { xs: 11, md: "small" },
                fontWeight: 700,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
                },
              }}
              onClick={() => onDelete(undefined, "all")}
            >
              🗑️ 종료내역 전체삭제
            </Button>
          </Box>
        </Box>

        {/* 헤더 - 기존 테이블과 동일한 구조 */}
        <GmHead sx={{ display: { xs: "none", md: "block" } }}>
          <ul>
            <li className="col-date">경기일시</li>
            <li className="col-type">타입</li>
            <li className="col-home">홈팀</li>
            <li className="col-score-home"></li>
            <li className="col-vs">VS</li>
            <li className="col-score-away"></li>
            <li className="col-away">원정팀</li>
            <li className="col-rslt">결과</li>
          </ul>
        </GmHead>

        {/* 각 베팅 아이템별 렌더링 */}
        {list.map((item, itemIndex) => (
          <Box
            key={`${item.id}-${itemIndex}`}
            sx={{
              mb: 3,
            }}
          >
            <Box
              sx={{
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 2,
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  borderColor: (theme) => theme.palette.primary.main,
                },
              }}
            >
              {/* 게임 타이틀 */}
              <GmList>
                <GmTit>
                  {/* 데스크톱 버전 */}
                  <Box
                    sx={{
                      display: { xs: "none", md: "flex" },
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <input
                        type="checkbox"
                        checked={value.some(
                          (checkItem) => checkItem === item.id
                        )}
                        onChange={() => onCheck(item.id)}
                        style={{
                          cursor: "pointer",
                          width: "18px",
                          height: "18px",
                          marginRight: "8px",
                        }}
                      />

                      <Chip
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography component="span" fontSize={14}>
                              {getGameEmoji(item?.gameCode)}
                            </Typography>
                            <Typography
                              component="span"
                              fontSize="small"
                              fontWeight="bold"
                            >
                              {item?.game_Event}
                            </Typography>
                          </Box>
                        }
                        size="small"
                        sx={{
                          height: 24,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.15),
                          color: "#fff",
                          fontWeight: 700,
                          border: (theme) =>
                            `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.3
                            )}`,
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography fontSize="small" fontWeight="bold">
                          배팅시간
                        </Typography>
                        <Typography fontSize="small" fontWeight="bold">
                          {moment(item?.betTime).format("MM/DD(ddd)")}
                        </Typography>
                        <Typography fontSize="small" fontWeight="bold">
                          {moment(item?.betTime).format("HH:mm:ss")}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontSize="small" fontWeight="bold">
                        배팅결과:
                      </Typography>
                      <Chip
                        icon={getStatusIcon(item?.status)}
                        label={
                          item?.status === "ready" &&
                          item.betDetail.every(
                            (timecheck) =>
                              +nowTime > +new Date(timecheck?.game_Time)
                          )
                            ? "경기중"
                            : chengeTitle(item?.status)
                        }
                        size="small"
                        color={getStatusColor(item?.status)}
                        sx={{
                          height: 22,
                          fontSize: 11,
                          "& .MuiChip-label": {
                            px: 0.8,
                            py: 0,
                            fontSize: 11,
                            fontWeight: 700,
                          },
                          "& .MuiChip-icon": {
                            fontSize: 14,
                            marginLeft: 0.5,
                            marginRight: -0.3,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  {/* 모바일 버전 - 2줄 레이아웃 */}
                  <Box
                    sx={{
                      display: { xs: "flex", md: "none" },
                      flexDirection: "column",
                      gap: 1,
                      width: "100%",
                    }}
                  >
                    {/* 첫 번째 줄: 체크박스 + 아이콘 + 게임타입 + 결과 */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <input
                          type="checkbox"
                          checked={value.some(
                            (checkItem) => checkItem === item.id
                          )}
                          onChange={() => onCheck(item.id)}
                          style={{
                            cursor: "pointer",
                            width: "16px",
                            height: "16px",
                          }}
                        />

                        <Chip
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                              }}
                            >
                              <Typography component="span" fontSize={12}>
                                {getGameEmoji(item?.gameCode)}
                              </Typography>
                              <Typography
                                component="span"
                                fontSize={10}
                                fontWeight="bold"
                              >
                                {item?.gameCode}
                              </Typography>
                            </Box>
                          }
                          size="small"
                          sx={{
                            height: 20,
                            backgroundColor: (theme) =>
                              alpha(theme.palette.primary.main, 0.15),
                            color: "#fff",
                            fontWeight: 700,
                            border: (theme) =>
                              `1px solid ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                            "& .MuiChip-label": {
                              px: 0.8,
                            },
                          }}
                        />
                      </Box>
                      <Chip
                        icon={getStatusIcon(item?.status, 12)}
                        label={
                          item?.status === "ready" &&
                          item.betDetail.every(
                            (timecheck) =>
                              +nowTime > +new Date(timecheck?.game_Time)
                          )
                            ? "경기중"
                            : chengeTitle(item?.status)
                        }
                        size="small"
                        color={getStatusColor(item?.status)}
                        sx={{
                          height: 20,
                          fontSize: 10,
                          "& .MuiChip-label": {
                            px: 0.6,
                            py: 0,
                            fontSize: 10,
                            fontWeight: 700,
                          },
                          "& .MuiChip-icon": {
                            fontSize: 12,
                            marginLeft: 0.3,
                            marginRight: -0.3,
                          },
                        }}
                      />
                    </Box>

                    {/* 두 번째 줄: 배팅시간 */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Typography fontSize={11} fontWeight="bold">
                        배팅시간:
                      </Typography>
                      <Typography fontSize={11} fontWeight="bold">
                        {moment(item?.betTime).format("MM/DD(ddd)")}
                      </Typography>
                      <Typography fontSize={11} fontWeight="bold">
                        {moment(item?.betTime).format("HH:mm:ss")}
                      </Typography>
                    </Box>
                  </Box>
                </GmTit>
              </GmList>

              {/* 각 경기 아이템 - 기존 테이블과 동일한 9개 컬럼 구조 */}
              {item.betDetail.map((subitem: any, subIndex: number) => {
                const prev = subIndex > 0 ? item.betDetail[subIndex - 1] : null;
                const sameLeagueOrName =
                  (prev?.leagueName?.id || prev?.game_Name) ===
                  (subitem?.leagueName?.id || subitem?.game_Name);
                const sameEvent = prev?.game_Event === subitem?.game_Event;
                const sameTime =
                  prev && moment(prev.game_Time).isSame(subitem.game_Time);
                const showHeader = !(sameLeagueOrName && sameEvent && sameTime);

                return (
                  <GmList key={subIndex}>
                    {/* 경기 정보 헤더 - PC/모바일 공통 (동일 그룹이면 첫 항목만 표시) */}
                    {showHeader && (
                      <Box
                        sx={{
                          display: "flex",
                          backgroundColor: "#262626",
                          padding: "8px",
                          borderBottom: "1px solid #3b3b3c",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.8, md: 1.5 },
                          }}
                        >
                          <Image
                            src={eventImg(subitem?.game_Event) as string}
                            width={20}
                            height={20}
                            alt={subitem?.game_Event}
                          />
                          <Typography
                            fontSize={{ xs: 11, md: "small" }}
                            fontWeight="bold"
                          >
                            {item.gameCode === "미니게임"
                              ? item.game_Event
                              : chengeTitle(subitem?.game_Event)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              overflow: "hidden",
                            }}
                          >
                            {item.gameCode !== "미니게임" && (
                              <Image
                                src={flegFunction(subitem?.leagueName?.flegImg)}
                                width={20}
                                height={20}
                                alt=""
                              />
                            )}
                            <Typography
                              fontSize="small"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.gameCode === "미니게임"
                                ? subitem.game_Event
                                : subitem?.leagueName?.changeName ||
                                  subitem.game_Name}
                            </Typography>
                          </Box>
                        </Box>
                        <Box display={{ xs: "block", md: "none" }}>
                          <Typography
                            fontSize={{ xs: 11, md: "small" }}
                            fontWeight="bold"
                          >
                            {moment(subitem.game_Time).format("MM/DD(dd)")}
                            <Typography
                              component="span"
                              fontSize={{ xs: 11, md: "small" }}
                              fontWeight="bold"
                              ml={0.5}
                            >
                              {moment(subitem.game_Time).format("HH:mm")}
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {/* 데스크톱 + 모바일 공통 데이터 행 */}
                    <GmItem>
                      {/* 1. 경기일시 */}
                      <li className="col-date">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography fontSize="small" fontWeight="bold">
                            {moment(subitem.game_Time).format("MM/DD(dd)")}
                          </Typography>
                          <Typography fontSize="small" fontWeight="bold">
                            {moment(subitem.game_Time).format("HH:mm")}
                          </Typography>
                        </Box>
                      </li>
                      {/* 2. 리그명 */}

                      {/* 3. 타입 */}
                      <li className="col-type">
                        <Typography
                          fontSize="small"
                          fontWeight="bold"
                          color={
                            subitem?.game_Type === "handicap"
                              ? "primary"
                              : subitem?.game_Type === "unover"
                              ? "error"
                              : ""
                          }
                        >
                          {chengeTitle(subitem.game_Type)}
                        </Typography>
                      </li>
                      {/* 4. 홈팀 */}
                      <li
                        className="col-home"
                        style={{
                          border:
                            subitem.Pick === subitem.team_home ||
                            subitem.Pick === "home"
                              ? `2px solid ${theme.palette.primary.main}`
                              : "1px solid #3b3b3c",
                          backgroundColor:
                            subitem.result === subitem.team_home ||
                            subitem.result === "home"
                              ? subitem.Pick === subitem.team_home ||
                                subitem.Pick === "home"
                                ? alpha(theme.palette.primary.main, 0.4) // 적중: 진한 primary
                                : alpha(theme.palette.primary.main, 0.2) // 결과만: 연한 primary
                              : "",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            flexDirection: { xs: "column", md: "row" },
                          }}
                        >
                          {item.gameCode === "미니게임" ? (
                            <>
                              <Box sx={{ display: "flex" }}>
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {subitem.game_Name}
                                </Typography>
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                  color="#0080FF"
                                  ml={0.5}
                                >
                                  [{subitem.team_home}]
                                </Typography>
                              </Box>
                              <Typography
                                fontSize={{ xs: 11, md: "small" }}
                                fontWeight="bold"
                                align="right"
                              >
                                {numeral(subitem.Odds_home).format("0.00")}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                }}
                              >
                                <Typography
                                  align="left"
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {subitem?.home_TeamName?.changeName ||
                                    subitem.team_home}
                                </Typography>
                                {subitem.game_Memo && (
                                  <Typography
                                    fontSize={{ xs: 11, md: "small" }}
                                    color="error"
                                    fontWeight="bold"
                                    ml={1}
                                  >
                                    {subitem?.gameMemo?.changeName ||
                                      subitem?.game_Memo}
                                  </Typography>
                                )}
                                {subitem.game_Type === "unover" &&
                                  !isMobile && (
                                    <Typography
                                      fontSize={{ xs: 11, md: "small" }}
                                      color="error"
                                      fontWeight="bold"
                                      ml={1}
                                    >
                                      [오버]
                                    </Typography>
                                  )}
                                {subitem.game_Type === "handicap" &&
                                  !isMobile && (
                                    <Typography
                                      fontSize={{ xs: 11, md: "small" }}
                                      color="primary"
                                      fontWeight="bold"
                                      ml={1}
                                    >
                                      [핸디캡]
                                    </Typography>
                                  )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                              >
                                {subitem.game_Type === "unover" && (
                                  <FileUploadIcon
                                    color="error"
                                    fontSize="small"
                                  />
                                )}
                                {subitem.game_Type === "handicap" && (
                                  <HMobiledataIcon
                                    color="primary"
                                    fontSize="small"
                                  />
                                )}
                                <Typography
                                  align="right"
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {numeral(subitem.Odds_home).format("0.00")}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </li>
                      {/* 5. 홈 스코어 */}
                      <li className="col-score-home">
                        <Typography fontSize="small" fontWeight="bold">
                          {subitem.score_home !== undefined &&
                          subitem.score_home !== null
                            ? +subitem.score_home
                            : "-"}
                        </Typography>
                      </li>
                      {/* 6. VS / 무승부 */}
                      <li
                        className="col-vs"
                        style={{
                          border:
                            subitem.Pick === subitem.team_tie ||
                            subitem.Pick === "tie"
                              ? `2px solid ${theme.palette.primary.main}`
                              : "1px solid #3b3b3c",
                          backgroundColor:
                            subitem.result === subitem.team_tie ||
                            subitem.result === "tie"
                              ? subitem.Pick === subitem.team_tie ||
                                subitem.Pick === "tie"
                                ? alpha(theme.palette.primary.main, 0.4) // 적중: 진한 primary
                                : alpha(theme.palette.primary.main, 0.2) // 결과만: 연한 primary
                              : "",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          {subitem.team_tie && (
                            <Typography fontSize={{ xs: 11, md: "small" }}>
                              {subitem.team_tie}
                            </Typography>
                          )}
                          <Typography
                            fontSize={{ xs: 11, md: "small" }}
                            fontWeight="bold"
                            color={
                              subitem.game_Type !== "match"
                                ? "error"
                                : subitem.Odds_tie && +subitem.Odds_tie !== 0
                                ? ""
                                : "error"
                            }
                          >
                            {subitem.game_Type !== "match"
                              ? subitem.Odds_tie
                              : subitem.Odds_tie && +subitem.Odds_tie !== 0
                              ? numeral(subitem.Odds_tie).format("0.00")
                              : "VS"}
                          </Typography>
                        </Box>
                      </li>
                      {/* 7. 원정 스코어 */}
                      <li className="col-score-away">
                        <Typography fontSize="small" fontWeight="bold">
                          {subitem.score_away !== undefined &&
                          subitem.score_away !== null
                            ? +subitem.score_away
                            : "-"}
                        </Typography>
                      </li>
                      {/* 8. 원정팀 */}
                      <li
                        className="col-away"
                        style={{
                          border:
                            subitem.Pick === subitem.team_away ||
                            subitem.Pick === "away"
                              ? `2px solid ${theme.palette.primary.main}`
                              : "1px solid #3b3b3c",
                          backgroundColor:
                            subitem.result === subitem.team_away ||
                            subitem.result === "away"
                              ? subitem.Pick === subitem.team_away ||
                                subitem.Pick === "away"
                                ? alpha(theme.palette.primary.main, 0.4) // 적중: 진한 primary
                                : alpha(theme.palette.primary.main, 0.2) // 결과만: 연한 primary
                              : "",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            flexDirection: {
                              xs: "column-reverse",
                              md: "row",
                            },
                          }}
                        >
                          {item.gameCode === "미니게임" ? (
                            <>
                              <Typography
                                fontSize={{ xs: 11, md: "small" }}
                                fontWeight="bold"
                              >
                                {numeral(subitem.Odds_away).format("0.00")}
                              </Typography>
                              <Box
                                sx={{ display: "flex", justifyContent: "end" }}
                              >
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                  color="error"
                                  mr={0.5}
                                >
                                  [{subitem.team_away}]
                                </Typography>
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {subitem.game_Name}
                                </Typography>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                }}
                              >
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {numeral(subitem.Odds_away).format("0.00")}
                                </Typography>
                                {subitem.game_Type === "handicap" && (
                                  <HMobiledataIcon
                                    color="primary"
                                    fontSize="small"
                                  />
                                )}
                                {subitem.game_Type === "unover" && (
                                  <FileDownloadIcon
                                    color="info"
                                    fontSize="small"
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                              >
                                {subitem.game_Memo && (
                                  <Typography
                                    fontSize={{ xs: 11, md: "small" }}
                                    color="error"
                                    fontWeight="bold"
                                    mr={1}
                                  >
                                    {subitem?.gameMemo?.changeName ||
                                      subitem?.game_Memo}
                                  </Typography>
                                )}
                                {subitem.game_Type === "unover" &&
                                  !isMobile && (
                                    <Typography
                                      fontSize={{ xs: 11, md: "small" }}
                                      color="info.main"
                                      mr={1}
                                      fontWeight="bold"
                                    >
                                      [언더]
                                    </Typography>
                                  )}
                                {subitem.game_Type === "handicap" &&
                                  !isMobile && (
                                    <Typography
                                      fontSize={{ xs: 11, md: "small" }}
                                      color="primary"
                                      mr={1}
                                      fontWeight="bold"
                                    >
                                      [핸디캡]
                                    </Typography>
                                  )}
                                <Typography
                                  fontSize={{ xs: 11, md: "small" }}
                                  fontWeight="bold"
                                >
                                  {subitem?.away_TeamName?.changeName ||
                                    subitem.team_away}
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </li>
                      {/* 9. 결과 (적중/미적중) */}
                      <li className="col-rslt">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                          }}
                        >
                          {subitem?.status === "win" && (
                            <CheckCircleIcon
                              sx={{ fontSize: { xs: 12, md: 14 } }}
                              color="primary"
                            />
                          )}
                          {(subitem?.status === "lose" ||
                            subitem?.status === "cancle") && (
                            <CancelIcon
                              sx={{ fontSize: { xs: 12, md: 14 } }}
                              color="error"
                            />
                          )}
                          {subitem?.status === "ready" && (
                            <PendingIcon
                              sx={{ fontSize: { xs: 12, md: 14 } }}
                              color="action"
                            />
                          )}
                          <Typography
                            fontSize={{ xs: 11, md: "small" }}
                            fontWeight="bold"
                            color={
                              subitem?.status === "ready" &&
                              +nowTime > +new Date(subitem?.game_Time)
                                ? ""
                                : fontColor(subitem.status)
                            }
                          >
                            {subitem?.status === "ready" &&
                            !isMobile &&
                            +nowTime > +new Date(subitem?.game_Time)
                              ? "경기중"
                              : chengeTitle(subitem?.status)}
                          </Typography>
                        </Box>
                      </li>
                    </GmItem>
                  </GmList>
                );
              })}

              {/* 베팅 요약 */}
              <BetItem>
                {/* 데스크톱: 1줄 4항목 */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    gap: 2,
                    width: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Typography fontSize="small" fontWeight="bold">
                      배팅금액:
                    </Typography>
                    <Typography fontSize="small" fontWeight="bold">
                      {numeral(item?.betPrice).format("0,0")}원
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Typography fontSize="small" fontWeight="bold">
                      배당:
                    </Typography>
                    <Typography
                      fontSize="small"
                      fontWeight="bold"
                      color={
                        +item?.totalOdd >= 3.0
                          ? "warning.main"
                          : +item?.totalOdd >= 2.0
                          ? "info.main"
                          : ""
                      }
                    >
                      {numeral(item?.totalOdd).format("0.00")}배
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Typography fontSize="small" fontWeight="bold">
                      예상금액:
                    </Typography>
                    <Typography fontSize="small" fontWeight="bold">
                      {numeral(item?.winPrice).format("0,0")}원
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Typography fontSize="small" fontWeight="bold">
                      당첨금액:
                    </Typography>
                    <Typography
                      fontSize="small"
                      fontWeight="bold"
                      color={
                        +item?.payment > 0 ? "primary.main" : "text.secondary"
                      }
                    >
                      {+item?.payment > 0 && "💰 "}
                      {numeral(item?.payment).format("0,0")}원
                    </Typography>
                  </Box>
                </Box>

                {/* 모바일: 2줄 */}
                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    flexDirection: "column",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  {/* 첫 번째 줄: 배팅금액, 배당, 예상금액 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", gap: 0.3, alignItems: "center" }}
                    >
                      <Typography fontSize={11} fontWeight="bold">
                        배팅금액:
                      </Typography>
                      <Typography fontSize={11} fontWeight="bold">
                        {numeral(item?.betPrice).format("0,0")}원
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 0.3, alignItems: "center" }}
                    >
                      <Typography fontSize={11} fontWeight="bold">
                        배당:
                      </Typography>
                      <Typography
                        fontSize={11}
                        fontWeight="bold"
                        color={
                          +item?.totalOdd >= 3.0
                            ? "warning.main"
                            : +item?.totalOdd >= 2.0
                            ? "info.main"
                            : ""
                        }
                      >
                        {numeral(item?.totalOdd).format("0.00")}배
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", gap: 0.3, alignItems: "center" }}
                    >
                      <Typography fontSize={11} fontWeight="bold">
                        예상금액:
                      </Typography>
                      <Typography fontSize={11} fontWeight="bold">
                        {numeral(item?.winPrice).format("0,0")}원
                      </Typography>
                    </Box>
                  </Box>

                  {/* 두 번째 줄: 당첨금액만 우측 정렬 */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", gap: 0.3, alignItems: "center" }}
                    >
                      <Typography fontSize={11} fontWeight="bold">
                        당첨금액:
                      </Typography>
                      <Typography
                        fontSize={11}
                        fontWeight="bold"
                        color={
                          +item?.payment > 0 ? "primary.main" : "text.secondary"
                        }
                      >
                        {+item?.payment > 0 && "💰 "}
                        {numeral(item?.payment).format("0,0")}원
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </BetItem>
            </Box>

            {/* 버튼 영역 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1,
              }}
            >
              {item.status !== "ready" && (
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  sx={{
                    py: { xs: 0.8, md: 1 },
                    px: { xs: 1.5, md: 2 },
                    fontSize: { xs: 11, md: "small" },
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
                    },
                  }}
                  onClick={() => onDelete(item.id)}
                >
                  🗑️ 내역 삭제
                </Button>
              )}

              {item.gameCode === "스포츠" &&
                item.status === "ready" &&
                item.betDetail.every(
                  (timecheck) =>
                    +nowTime <
                    +new Date(timecheck.game_Time) -
                      +setup.cancle_PlayTime * 60000
                ) &&
                +new Date(item.betTime) + +setup.cancle_min * 60000 >
                  +nowTime && (
                  <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    sx={{
                      py: { xs: 0.8, md: 1 },
                      px: { xs: 1.5, md: 2 },
                      fontSize: { xs: 11, md: "small" },
                      fontWeight: 700,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(237, 108, 2, 0.4)",
                      },
                    }}
                    onClick={() => handleCancel(item.id.toString())}
                  >
                    ❌ 배팅취소
                  </Button>
                )}
            </Box>
          </Box>
        ))}

        {/* 페이지네이션 */}
        <Stack
          spacing={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          mt={4}
          mb={2}
        >
          <Pagination
            variant="outlined"
            shape="rounded"
            count={count}
            page={page}
            onChange={handleChange}
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                  borderColor: (theme) => theme.palette.primary.main,
                },
              },
              "& .Mui-selected": {
                backgroundColor: (theme) => theme.palette.primary.main,
                borderColor: (theme) => theme.palette.primary.main,
                color: "#fff",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.dark,
                },
              },
            }}
          />
        </Stack>
      </GmWrap>
    </StyledSection>
  );
};

export default memo(UserBettingListExact);
