import React from "react";
import { Box, Typography, Stack, Chip, alpha } from "@mui/material";
import moment from "moment";
import numeral from "numeral";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import HMobiledataIcon from "@mui/icons-material/HMobiledata";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { SportsMatch } from "./sports-types";
import { changeGameType, calculateRemainingTime } from "./sports-table-utils";

interface MatchRowProps {
  item: SportsMatch;
  index: number;
  listData: SportsMatch[];
  iconState: number[];
  cartList: any[];
  isMobile: boolean;
  onHomeClick: (item: SportsMatch, index: number) => void;
  onAwayClick: (item: SportsMatch, index: number) => void;
  onTieClick: (item: SportsMatch, index: number) => void;
  onToggleExpand: (id: number) => void;
}

// 게임 타입별 색상
const getTypeColor = (type: string) => {
  switch (type) {
    case "handicap":
      return "info.main";
    case "unover":
      return "error.main";
    default:
      return "success.main";
  }
};

const cellBaseStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  transition: "all 0.2s ease-in-out",
} as const;

export const MatchRow: React.FC<MatchRowProps> = ({
  item,
  index,
  listData,
  iconState,
  cartList,
  isMobile,
  onHomeClick,
  onAwayClick,
  onTieClick,
  onToggleExpand,
}) => {
  // 그룹 전체를 하나의 border로 묶기
  const isMainMatch = item.handicap !== undefined;
  const hasParentId = !!item.parentId;
  const prevItem = listData[index - 1];
  const nextItem = listData[index + 1];

  // frontTable: 메인 경기가 확장되어 있고 다음이 자신의 자식
  const frontTable =
    isMainMatch &&
    iconState.includes(item.id) &&
    nextItem?.parentId === item.id;

  // mideTable: handicap 경기 중간
  const mideTable =
    hasParentId &&
    prevItem &&
    nextItem &&
    (prevItem.id === item.parentId || prevItem.parentId === item.parentId) &&
    nextItem.parentId === item.parentId;

  // endTable: handicap 경기의 마지막
  const endTable =
    hasParentId &&
    prevItem &&
    (prevItem.id === item.parentId || prevItem.parentId === item.parentId) &&
    (!nextItem || nextItem.parentId !== item.parentId);

  const isGrouped = frontTable || mideTable || endTable;

  // 선택 상태 (메모이제이션 제거 - 즉각 반응)
  const isHomeSelected = cartList.some(
    (i) => i.id === item.id && i.pick === "home"
  );
  const isAwaySelected = cartList.some(
    (i) => i.id === item.id && i.pick === "away"
  );
  const isTieSelected = cartList.some(
    (i) => i.id === item.id && i.pick === "tie"
  );
  const isExpanded = iconState.includes(item.id);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        height={{ xs: 52, md: 56 }}
        minHeight={{ xs: 52, md: 56 }}
        sx={{
          py: 0.5,
          px: { xs: 0.5, md: 0.75 },
          mb: endTable || !isGrouped ? 0.5 : 0,
          borderRadius: frontTable
            ? { xs: "8px 8px 0 0", md: "10px 10px 0 0" }
            : endTable
            ? { xs: "0 0 8px 8px", md: "0 0 10px 10px" }
            : mideTable
            ? 0
            : { xs: 1, md: 1.25 },
          bgcolor: "background.paper",
          border: "none",
          borderLeft: (t) =>
            isGrouped
              ? `2px solid ${alpha(t.palette.primary.main, 0.4)}`
              : `1px solid ${alpha(t.palette.divider, 0.5)}`,
          borderRight: (t) =>
            isGrouped
              ? `2px solid ${alpha(t.palette.primary.main, 0.4)}`
              : `1px solid ${alpha(t.palette.divider, 0.5)}`,
          borderTop: (t) =>
            frontTable || !isGrouped
              ? isGrouped
                ? `2px solid ${alpha(t.palette.primary.main, 0.4)}`
                : `1px solid ${alpha(t.palette.divider, 0.5)}`
              : "none",
          borderBottom: (t) =>
            endTable || !isGrouped
              ? isGrouped
                ? `2px solid ${alpha(t.palette.primary.main, 0.4)}`
                : `1px solid ${alpha(t.palette.divider, 0.5)}`
              : "none",
          boxShadow: (t) =>
            !isGrouped
              ? `0 1px 3px ${alpha(t.palette.common.black, 0.06)}`
              : endTable
              ? `0 2px 6px ${alpha(t.palette.primary.main, 0.15)}`
              : "none",
          transition: "all 0.2s ease",
          "&:hover": !isMobile
            ? {
                boxShadow: (t) =>
                  !isGrouped || endTable
                    ? `0 2px 8px ${alpha(t.palette.common.black, 0.1)}`
                    : "none",
                transform: !isGrouped ? "translateY(-1px)" : "none",
              }
            : {},
        }}
      >
        {!isMobile && (
          <>
            {/* 시간 */}
            <Box
              width="15%"
              sx={{
                ...cellBaseStyle,
                bgcolor: (t) => alpha(t.palette.background.default, 0.4),
                borderRadius: 1,
                mx: 0.5,
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {moment(item.playTime).format("MM/DD HH:mm")}
                </Typography>
              </Stack>
            </Box>

            {/* 타입 */}
            <Box
              width="10%"
              sx={{
                ...cellBaseStyle,
                mx: 0.5,
              }}
            >
              <Chip
                label={changeGameType(item.game_Type)}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: getTypeColor(item.game_Type),
                  color: "#fff",
                  borderRadius: 1,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
          </>
        )}

        {/* 홈팀 */}
        <Box
          width={!isMobile ? "25%" : "37%"}
          onClick={() => item.homeOdds && onHomeClick(item, index)}
          sx={{
            ...cellBaseStyle,
            justifyContent: "space-between",
            px: { xs: 0.75, md: 1.25 },
            mx: 0.25,
            borderRadius: 1,
            bgcolor: isHomeSelected
              ? "primary.main"
              : (t) => alpha(t.palette.background.default, 0.3),
            color: isHomeSelected ? "primary.contrastText" : "text.primary",
            cursor: item.homeOdds ? "pointer" : "default",
            border: (t) =>
              isHomeSelected
                ? "none"
                : `1px solid ${alpha(t.palette.divider, 0.3)}`,
            ...(!isMobile &&
              item.homeOdds && {
                "&:hover": {
                  bgcolor: isHomeSelected
                    ? "primary.dark"
                    : (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                  transform: "scale(1.02)",
                },
              }),
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            flex={1}
            overflow="hidden"
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: 12, md: 14 },
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.homeTeam?.changeName || item.homeTeam.name}
            </Typography>
            {item.game_Memo && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: 9, md: 10 },
                  color: isHomeSelected ? "inherit" : "error.main",
                  fontWeight: 600,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: isHomeSelected
                    ? "inherit"
                    : (t) => alpha(t.palette.error.main, 0.1),
                }}
              >
                {item.gameMemo?.changeName || item.game_Memo}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {item.game_Type === "unover" && (
              <FileUploadIcon
                sx={{
                  fontSize: { xs: 18, md: 20 },
                  color: isHomeSelected ? "inherit" : "error.main",
                }}
              />
            )}
            {item.game_Type === "handicap" && (
              <HMobiledataIcon
                sx={{
                  fontSize: { xs: 20, md: 22 },
                  color: isHomeSelected ? "inherit" : "info.main",
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: 13, md: 15 },
                fontWeight: 700,
              }}
            >
              {numeral(item.homeOdds).format("0.00")}
            </Typography>
          </Stack>
        </Box>

        {/* 무승부 / VS */}
        <Box
          width={!isMobile ? "15%" : "16%"}
          onClick={() =>
            item.tieOdds &&
            item.game_Type === "match" &&
            +item.tieOdds > 0 &&
            onTieClick(item, index)
          }
          sx={{
            ...cellBaseStyle,
            mx: 0.25,
            borderRadius: 1,
            bgcolor: isTieSelected
              ? "primary.main"
              : (t) => alpha(t.palette.background.default, 0.3),
            color: isTieSelected
              ? "primary.contrastText"
              : item.game_Type === "handicap"
              ? "info.main"
              : item.game_Type === "unover"
              ? "error.main"
              : "text.primary",
            cursor:
              item.game_Type === "match" && item.tieOdds
                ? "pointer"
                : "default",
            border: (t) =>
              isTieSelected
                ? "none"
                : `1px solid ${alpha(t.palette.divider, 0.3)}`,
            ...(!isMobile &&
              item.game_Type === "match" &&
              item.tieOdds && {
                "&:hover": {
                  bgcolor: isTieSelected
                    ? "primary.dark"
                    : (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                  transform: "scale(1.02)",
                },
              }),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: 13, md: 15 },
              fontWeight: 700,
            }}
          >
            {item.tieOdds && item.game_Type === "match" && +item.tieOdds > 0
              ? numeral(item.tieOdds).format(`0.00`)
              : item.tieOdds && item.game_Type !== "match"
              ? item.tieOdds.toString()
              : "VS"}
          </Typography>
        </Box>

        {/* 원정팀 */}
        <Box
          width={!isMobile ? "25%" : "37%"}
          onClick={() => item.awayOdds && onAwayClick(item, index)}
          sx={{
            ...cellBaseStyle,
            justifyContent: "space-between",
            px: { xs: 0.75, md: 1.25 },
            mx: 0.25,
            borderRadius: 1,
            bgcolor: isAwaySelected
              ? "primary.main"
              : (t) => alpha(t.palette.background.default, 0.3),
            color: isAwaySelected ? "primary.contrastText" : "text.primary",
            cursor: item.awayOdds ? "pointer" : "default",
            border: (t) =>
              isAwaySelected
                ? "none"
                : `1px solid ${alpha(t.palette.divider, 0.3)}`,
            ...(!isMobile &&
              item.awayOdds && {
                "&:hover": {
                  bgcolor: isAwaySelected
                    ? "primary.dark"
                    : (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: "primary.main",
                  transform: "scale(1.02)",
                },
              }),
          }}
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: 13, md: 15 },
                fontWeight: 700,
              }}
            >
              {numeral(item.awayOdds).format("0.00")}
            </Typography>
            {item.game_Type === "handicap" && (
              <HMobiledataIcon
                sx={{
                  fontSize: { xs: 20, md: 22 },
                  color: isAwaySelected ? "inherit" : "info.main",
                }}
              />
            )}
            {item.game_Type === "unover" && (
              <FileDownloadIcon
                sx={{
                  fontSize: { xs: 18, md: 20 },
                  color: isAwaySelected ? "inherit" : "info.main",
                }}
              />
            )}
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            flex={1}
            justifyContent="flex-end"
            overflow="hidden"
          >
            {item.game_Memo && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: 9, md: 10 },
                  color: isAwaySelected ? "inherit" : "error.main",
                  fontWeight: 600,
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  bgcolor: isAwaySelected
                    ? "inherit"
                    : (t) => alpha(t.palette.error.main, 0.1),
                }}
              >
                {item.gameMemo?.changeName || item.game_Memo}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: 12, md: 14 },
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.awayTeam?.changeName || item.awayTeam.name}
            </Typography>
          </Stack>
        </Box>

        {/* 남은시간 */}
        {!isMobile && (
          <Box
            width="5%"
            sx={{
              ...cellBaseStyle,
              mx: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: 11,
                fontWeight: 500,
                color: "text.disabled",
              }}
            >
              {calculateRemainingTime(item.playTime)}
            </Typography>
          </Box>
        )}

        {/* 더보기 - 서브 경기가 있을 때만 표시 */}
        {item.handicap && item.handicap.length > 0 ? (
          <Box
            width={!isMobile ? "5%" : "10%"}
            onClick={() => onToggleExpand(item.id)}
            sx={{
              ...cellBaseStyle,
              mx: 0.25,
              borderRadius: 1,
              bgcolor: isExpanded ? "primary.main" : "transparent",
              color: isExpanded ? "primary.contrastText" : "primary.main",
              cursor: "pointer",
              border: (t) =>
                isExpanded ? "none" : `2px solid ${t.palette.primary.main}`,
              ...(!isMobile && {
                "&:hover": {
                  bgcolor: isExpanded
                    ? "primary.dark"
                    : (t) => alpha(t.palette.primary.main, 0.08),
                  transform: "scale(1.1)",
                },
              }),
            }}
          >
            {isExpanded ? (
              <RemoveIcon sx={{ fontSize: 18 }} />
            ) : (
              <AddIcon sx={{ fontSize: 18 }} />
            )}
          </Box>
        ) : (
          <Box width={!isMobile ? "5%" : "10%"} sx={{ mx: 0.25 }} />
        )}
      </Box>
    </>
  );
};
