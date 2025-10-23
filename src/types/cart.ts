export interface cartState {
  id?: number;
  gameCode: string; //미닉임
  game_Event: string; //파워볼
  game_Name: string; //라운드
  game_Name_Change?: string;
  game_Type: string; //일반볼 파워볼 등등
  game_Memo?: string;
  game_Memo_Change?: string;
  game_Time?: Date;
  pickOdds: string; //배당
  pick: string; //홀짝 등등
  team_home: string;
  team_home_change?: string;
  team_tie?: string;
  team_away?: string;
  team_away_change?: string;
  Odds_home: string;
  Odds_tie?: string;
  Odds_away?: string;
}

export interface cartSetup {
  minBet: string;
  maxBet: string;
  maxResult: string;
  minBet_1?: string;
  maxBet_1?: string;
  maxResult_1?: string;
}
