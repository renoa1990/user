export const eventImg = (event: string) => {
  switch (event) {
    case "baseball":
      return "/images/icon/baseball.png";
    case "basketball":
      return "/images/icon/basketball.png";
    case "e-sports":
      return "/images/icon/e-sports.png";
    case "handball":
      return "/images/icon/handball.png";
    case "ice-hockey":
      return "/images/icon/ice hockey.png";
    case "soccer":
      return "/images/icon/soccer.png";

    case "volleyball":
      return "/images/icon/volleyball.png";
    case "파워볼":
      return "/images/icon/PB.png";
    case "파워사다리":
      return "/images/icon/ladder.png";
    case "키노사다리":
      return "/images/icon/ladder.png";
    case "eos파워볼 5분":
      return "/images/icon/eos.png";
    case "eos파워볼 4분":
      return "/images/icon/eos.png";
    case "eos파워볼 3분":
      return "/images/icon/eos.png";
    case "eos파워볼 2분":
      return "/images/icon/eos.png";
    case "eos파워볼 1분":
      return "/images/icon/eos.png";
    case "별다리 1분":
      return "/images/icon/boscore2.png";
    case "별다리 2분":
      return "/images/icon/boscore2.png";
    case "별다리 3분":
      return "/images/icon/boscore2.png";
    case "보너스":
      return "/images/bonus/bonus.png";
  }
};

export const flagImg = (country: string) => {
  switch (country) {
    case "korea":
      return "/images/flag/s/South Korea.png";
    case "japan":
      return "/images/flag/j/Japan.png";
    case "china":
      return "/images/flag/c/China.png";
    case "america":
      return "/images/flag/u/United States of America (USA).png";
  }
};

export const changeGameType = (str: string) => {
  switch (str) {
    case "match":
      return "승무패";
    case "unover":
      return "오버언더";
    case "handicap":
      return "핸디캡";
    default:
      return "알수없음";
  }
};
