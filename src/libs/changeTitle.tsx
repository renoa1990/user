export default function chengeTitle(str: string) {
  switch (str) {
    case "powerball_oe":
      return "파워볼 홀짝";
    case "powerball_unover":
      return "파워볼 오버언더";
    case "ball_oe":
      return "일반볼 홀짝";
    case "ball_unover":
      return "일반볼 오버언더";
    case "ball_size":
      return "일반볼 소/중/대";
    case "ball_mix":
      return "일반볼 조합";
    case "ball_mix_size":
      return "일반볼 조합(소/중/대)";
    case "powerladder_line":
      return "줄갯수";
    case "powerladder_oe":
      return "홀짝";
    case "powerladder_rl":
      return "출발점";
    case "kinoladder_line":
      return "줄갯수";
    case "kinoladder_oe":
      return "홀짝";
    case "kinoladder_rl":
      return "출발점";
    case "powerball":
      return "파워볼 숫자";
    case "win":
      return "적중";
    case "lose":
      return "미적중";
    case "tie":
      return "적중특례";
    case "cancle":
      return "취소";
    case "ready":
      return "대기";
    case "match":
      return "승무패";
    case "unover":
      return "오버언더";
    case "handicap":
      return "핸디캡";
    case "cross":
      return "크로스";
    case "special":
      return "스페셜";
    case "live":
      return "라이브";
    case "soccer":
      return "축구";
    case "baseball":
      return "야구";
    case "basketball":
      return "농구";
    case "volleyball":
      return "배구";
    case "ice-hockey":
      return "아이스 하키";
    case "e-sports":
      return "E-스포츠";
    case "starladder_line":
      return "줄갯수";
    case "starladder_oe":
      return "홀짝";
    case "starladder_rl":
      return "출발점";
    default:
      return "알수없음";
  }
}
