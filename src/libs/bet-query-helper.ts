interface props {
  cartList: {
    id?: number;
    gameCode: string; //미닉임
    game_Event: string; //파워볼
    game_Name: string; //라운드
    game_Type: string; //일반볼 파워볼 등등
    game_Time: Date;
    pickOdds: string; //배당
    pick: string; //홀짝 등등
    team_home: string;
    team_tie?: string;
    team_away: string;
    Odds_home: string;
    Odds_tie?: string;
    Odds_away: string;
    game_Memo?: string;
  }[];
  gameCode: string;
  game_Event: string;
}
interface detail {
  game_Event: string;
  game_Name: string;
  game_Type: string;
  Pick: string;
  PickOdds: string;
  game_Time: Date;
  team_home: string;
  team_tie?: string;
  team_away: string;
  Odds_home: string;
  Odds_tie?: string;
  Odds_away: string;

  result?: string;
  status?: string;
  game_Memo?: string;

  powerballId?: number;
  powerladderId?: number;
  kinoLadderId?: number;
  eosPowerball5Id?: number;
  eosPowerball4Id?: number;
  eosPowerball3Id?: number;
  eosPowerball2Id?: number;
  eosPowerball1Id?: number;
  specialId?: number;
  crossId?: number;
  liveId?: number;
  starLadder1Id?: number;
  starLadder2Id?: number;
  starLadder3Id?: number;
}

export function BettingQuery(props: props) {
  const { cartList, gameCode, game_Event } = props;

  let detail: detail[] = [];
  let memo = "";
  for (let i = 0; i < cartList.length; i++) {
    switch (game_Event) {
      case "파워볼":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          powerballId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "파워사다리":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          powerladderId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "키노사다리":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          kinoLadderId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "eos파워볼 5분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          eosPowerball5Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "eos파워볼 4분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          eosPowerball4Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "eos파워볼 3분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          eosPowerball3Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "eos파워볼 2분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          eosPowerball2Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "eos파워볼 1분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          eosPowerball1Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "크로스":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          crossId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });

        break;
      case "스페셜":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          specialId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
          game_Memo: cartList[i].game_Memo,
        });
        break;
      case "라이브":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          liveId: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
          game_Memo: cartList[i].game_Memo,
        });
        break;
      case "별다리 1분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          starLadder1Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "별다리 2분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          starLadder2Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
      case "별다리 3분":
        detail.push({
          game_Event: cartList[i].game_Event,
          game_Name: cartList[i].game_Name,
          game_Type: cartList[i].game_Type,
          Pick: cartList[i].pick,
          PickOdds: cartList[i].pickOdds,
          starLadder3Id: cartList[i].id,
          game_Time: cartList[i].game_Time,
          team_home: cartList[i].team_home,
          team_tie: cartList[i].team_tie,
          team_away: cartList[i].team_away,
          Odds_home: cartList[i].Odds_home,
          Odds_tie: cartList[i].Odds_tie,
          Odds_away: cartList[i].Odds_away,
        });
        break;
    }
  }

  switch (gameCode) {
    case "미니게임":
      memo = `${cartList[0].game_Event} ${cartList[0].game_Name} 배팅`;
      break;
    case "스포츠":
      memo = `${game_Event} ${cartList.length}폴더 배팅`;
      break;
  }

  return { detail, memo };
}
