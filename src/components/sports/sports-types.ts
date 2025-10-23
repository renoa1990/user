import { Dispatch, SetStateAction } from "react";
import { SportsSetup, Team, gameMemo, league } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface SportsMatch {
  id: number;
  parseId: number;
  game_Event: string;
  game_Type: string;
  game_Name: string;
  game_Memo: string;
  playTime: Date;
  homeTeam: Team;
  homeTeamId: number;
  homeOdds: Decimal;
  tieOdds: Decimal;
  awayTeam: Team;
  awayTeamId: number;
  awayOdds: Decimal;
  activate: boolean;
  score_Home: number;
  score_Away: number;
  result: string;
  result_exception: boolean;
  result_cancle: boolean;
  gameMemo: gameMemo;
  league: league;
  leagueId: number;
  tag?: boolean;
  handicap?: SportsMatch[];
  parentId?: number; // 확장된 handicap 경기의 부모 ID
}

export interface SportsTableProps {
  subTab: string;
  mainTab: string;
  list?: SportsMatch[];
  sportsSetup: SportsSetup;
  bonus: {
    bonus: string;
    count: number;
  } | null;
  setBonus: Dispatch<
    SetStateAction<{
      bonus: string;
      count: number;
    } | null>
  >;
}
