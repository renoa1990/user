import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  addItem,
  clearCart,
  removeItem,
  updateItem,
} from "src/redux/slices/cartSlice";
import { Virtuoso } from "react-virtuoso";
import { useSnackbar } from "notistack";
import moment from "moment";
import { SportsMatch, SportsTableProps } from "./sports-types";
import { sportEmoji, getImageUrl } from "./sports-table-utils";
import { MatchRow } from "./MatchRow";
import { LeagueRow } from "./LeagueRow";

export const NewSportsTable: FC<SportsTableProps> = (props) => {
  const { subTab, mainTab, list, sportsSetup, setBonus } = props;
  const cartList = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [iconState, setIconState] = useState<number[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const listData = useMemo(() => {
    let data =
      subTab !== "all"
        ? list?.filter((item) => item.game_Event === subTab) || []
        : list || [];

    // iconState에 따라 data 배열 수정
    const modifiedData: SportsMatch[] = [];
    data.forEach((item, index) => {
      modifiedData.push(item);

      // 현재 아이템의 id가 iconState에 있으면 handicap 배열을 다음 위치로 이동
      if (iconState.includes(item.id) && item.handicap) {
        // handicap 경기에 parentId 추가 (그룹화 구분용)
        const handicapsWithParent = item.handicap.map((h) => ({
          ...h,
          parentId: item.id,
        }));
        modifiedData.push(...handicapsWithParent);
      }
    });

    return modifiedData;
  }, [list, subTab, iconState]);

  const createCartItem = (item: SportsMatch, pick: string) => {
    const pickOddsMapping: {
      [key: string]: string | undefined;
    } = {
      home: item.homeOdds?.toString(),
      away: item.awayOdds?.toString(),
      tie: item.tieOdds?.toString(),
    };

    return {
      id: item.id,
      gameCode: mainTab,
      game_Event: item.game_Event,
      game_Name: item.game_Name,
      game_Name_Change: item.league?.changeName || undefined,
      game_Type: item.game_Type,
      pick: pick,
      game_Memo: item.game_Memo || undefined,
      game_Memo_Change: item.gameMemo?.changeName || undefined,
      pickOdds: pickOddsMapping[pick] || "0",
      game_Time: item.playTime,
      team_home: item.homeTeam.name,
      team_home_change: item.homeTeam?.changeName || undefined,
      team_away: item.awayTeam.name,
      team_away_change: item.awayTeam?.changeName || undefined,
      Odds_home: item.homeOdds.toString(),
      Odds_tie: item.tieOdds?.toString(),
      Odds_away: item.awayOdds.toString(),
    };
  };

  const handleClick = useCallback(
    (item: SportsMatch, index: number, pick: string) => {
      const existingItemIndex = cartList?.findIndex((i) => i.id === item.id);

      if (existingItemIndex === -1) {
        const val = sportsValidate(item, pick);
        if (!val) dispatch(addItem(createCartItem(item, pick)));
      } else {
        const existingItem = cartList[existingItemIndex];
        if (existingItem.id === item.id && existingItem.pick === pick) {
          dispatch(removeItem(existingItem.id));
        } else {
          const updatedItem = createCartItem(item, pick);
          dispatch(updateItem({ index: existingItemIndex, item: updatedItem }));
        }
      }
    },
    [dispatch, cartList]
  );

  useEffect(() => {
    setIconState([]);
    dispatch(clearCart());
  }, [mainTab]);

  const sportsValidate = (selectItem: SportsMatch, pick: string) => {
    for (const item of cartList) {
      if (
        selectItem.homeTeam.name === item.team_home &&
        selectItem.awayTeam.name === item.team_away &&
        selectItem.game_Event === item.game_Event
      ) {
        if (item.game_Type === selectItem.game_Type) {
          enqueueSnackbar("같은 타입의 경기에 배팅할수없습니다.", {
            variant: "error",
          });
          return true;
        }

        if (item.game_Event === "soccer") {
          if (sportsSetup.soccer_combi_1) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("축구 승무패 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.soccer_combi_2) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("축구 승무패 + 언더오버는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.soccer_combi_3) {
            if (
              item.game_Type === "handicap" ||
              selectItem.game_Type === "handicap"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("축구 핸디캡 + 언더오버는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.soccer_combi_4) {
            if (item.pick === "tie" || pick === "tie") {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("축구 무 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.soccer_combi_5) {
            if (item.pick === "tie" || pick === "tie") {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("축구 무 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
        } else if (item.game_Event === "basketball") {
          if (sportsSetup.basketball_combi_1) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("농구 승패 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.basketball_combi_2) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("농구 승패 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.basketball_combi_3) {
            if (
              item.game_Type === "handicap" ||
              selectItem.game_Type === "handicap"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("농구 핸디캡 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
        } else if (item.game_Event === "baseball") {
          if (sportsSetup.baseball_combi_1) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("야구 승패 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.baseball_combi_2) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("야구 승패 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.baseball_combi_3) {
            if (
              item.game_Type === "handicap" ||
              selectItem.game_Type === "handicap"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("야구 핸디캡 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
        } else if (item.game_Event === "volleyball") {
          if (sportsSetup.volleyball_combi_1) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("배구 승패 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.volleyball_combi_2) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("배구 승패 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.volleyball_combi_3) {
            if (
              item.game_Type === "handicap" ||
              selectItem.game_Type === "handicap"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar("배구 핸디캡 + 오버언더는 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
        } else {
          if (sportsSetup.other_combi_1) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar(
                  "동일경기 승무패 + 핸디캡은 배팅할수없습니다.",
                  {
                    variant: "error",
                  }
                );
                return true;
              }
            }
          }
          if (sportsSetup.other_combi_2) {
            if (
              item.game_Type === "match" ||
              selectItem.game_Type === "match"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar(
                  "동일경기 승무패 + 오버언더는 배팅할수없습니다.",
                  {
                    variant: "error",
                  }
                );
                return true;
              }
            }
          }
          if (sportsSetup.other_combi_3) {
            if (
              item.game_Type === "handicap" ||
              selectItem.game_Type === "handicap"
            ) {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar(
                  "동일경기 핸디캡 + 오버언더는 배팅할수없습니다.",
                  {
                    variant: "error",
                  }
                );
                return true;
              }
            }
          }
          if (sportsSetup.other_combi_4) {
            if (item.pick === "tie" || pick === "tie") {
              if (
                item.game_Type === "handicap" ||
                selectItem.game_Type === "handicap"
              ) {
                enqueueSnackbar("동일경기 무 + 핸디캡은 배팅할수없습니다.", {
                  variant: "error",
                });
                return true;
              }
            }
          }
          if (sportsSetup.other_combi_5) {
            if (item.pick === "tie" || pick === "tie") {
              if (
                item.game_Type === "unover" ||
                selectItem.game_Type === "unover"
              ) {
                enqueueSnackbar(
                  "동일경기 승무패 + 오버언더는 배팅할수없습니다.",
                  {
                    variant: "error",
                  }
                );
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (
      sportsSetup &&
      cartList &&
      ((sportsSetup.cross_bonus_odds && mainTab === "cross") ||
        (sportsSetup.special_bonus_odds && mainTab === "special") ||
        (sportsSetup.live_bonus_odds && mainTab === "live"))
    ) {
      const bonusOdds = (sportsSetup as any)[`bonus_odds_${cartList.length}`];

      if (cartList.length <= 10 && bonusOdds > 1) {
        setBonus({ bonus: bonusOdds, count: cartList.length });
      } else {
        setBonus(null);
      }
    }
  }, [cartList, sportsSetup]);

  const iconClick = useCallback(
    (id: number) => {
      setIconState((prevState) => {
        const isIdPresent = prevState.includes(id);

        if (isIdPresent) {
          return prevState.filter((existingId) => existingId !== id);
        } else {
          return [...prevState, id];
        }
      });
    },
    [setIconState]
  );

  const handleHomeClick = useCallback(
    (item: SportsMatch, index: number) => handleClick(item, index, "home"),
    [handleClick]
  );
  const handleAwayClick = useCallback(
    (item: SportsMatch, index: number) => handleClick(item, index, "away"),
    [handleClick]
  );
  const handleTieClick = useCallback(
    (item: SportsMatch, index: number) => handleClick(item, index, "tie"),
    [handleClick]
  );

  const renderMatch = useCallback(
    (item: SportsMatch, index: number) => (
      <MatchRow
        item={item}
        index={index}
        listData={listData}
        iconState={iconState}
        cartList={cartList}
        isMobile={isMobile}
        onHomeClick={(item) => handleHomeClick(item, index)}
        onAwayClick={(item) => handleAwayClick(item, index)}
        onTieClick={(item) => handleTieClick(item, index)}
        onToggleExpand={iconClick}
      />
    ),
    [
      listData,
      iconState,
      cartList,
      isMobile,
      handleHomeClick,
      handleAwayClick,
      handleTieClick,
      iconClick,
    ]
  );

  const labelCell = useCallback(
    (item: SportsMatch) => {
      return <LeagueRow item={item} isMobile={isMobile} />;
    },
    [isMobile]
  );

  return (
    <>
      <Box
        display={"flex"}
        alignItems={"center"}
        width={"100%"}
        minHeight={40}
        sx={{
          backgroundColor: theme.palette.background.default,
          px: { xs: 0, md: 1.5 },
          py: 1,
          mb: 0.5,
        }}
      >
        {!isMobile && (
          <>
            <Box
              width={"15%"}
              height={"100%"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography fontSize={"small"}>경기일시</Typography>
            </Box>
            <Box
              width={"10%"}
              height={"100%"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Typography fontSize={"small"}>타입</Typography>
            </Box>
          </>
        )}
        <Box
          width={!isMobile ? "25%" : "37%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography fontSize={"small"}>홈</Typography>
        </Box>
        <Box
          width={!isMobile ? "15%" : "16%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography fontSize={"small"}>VS</Typography>
        </Box>
        <Box
          width={!isMobile ? "25%" : "37%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography fontSize={"small"}>원정</Typography>
        </Box>
        {!isMobile && (
          <Box
            width={"5%"}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography fontSize={"small"}>시간</Typography>
          </Box>
        )}
        <Box
          width={!isMobile ? "5%" : "10%"}
          height={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography fontSize={"small"}>더보기</Typography>
        </Box>
      </Box>
      <Virtuoso
        data={listData}
        style={{ height: "calc(100vh - 200px)", paddingBottom: 80 }}
        itemContent={(index, item) =>
          item.tag ? labelCell(item) : renderMatch(item, index)
        }
        overscan={300}
        increaseViewportBy={{ top: 600, bottom: 600 }}
        defaultItemHeight={56}
        useWindowScroll={false}
        computeItemKey={(index, item) =>
          `match-${item.id}-${item.game_Type || "league"}`
        }
      />
    </>
  );
};
