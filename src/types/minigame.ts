// 미니게임 타입 정의

export type MiniGameType = "POWERBALL" | "LADDER";

/**
 * 파워볼 배당 타입
 */
export type PowerballOdds = {
  // 파워볼 홀짝
  pbPowerOddOdds: number;
  pbPowerEvenOdds: number;
  // 파워볼 언더오버
  pbPowerUnderOdds: number;
  pbPowerOverOdds: number;
  // 일반볼 홀짝
  pbNormalOddOdds: number;
  pbNormalEvenOdds: number;
  // 일반볼 언더오버
  pbNormalUnderOdds: number;
  pbNormalOverOdds: number;
  // 일반볼 대중소
  pbNormalBigOdds: number;
  pbNormalMidOdds: number;
  pbNormalSmallOdds: number;
};

/**
 * 사다리 배당 타입
 */
export type LadderOdds = {
  // 좌우
  ldLeftOdds: number;
  ldRightOdds: number;
  // 홀짝
  ldOddOdds: number;
  ldEvenOdds: number;
  // 줄수
  ld3LineOdds: number;
  ld4LineOdds: number;
  // 조합
  ldLeft3EvenOdds: number; // 좌3짝
  ldLeft4OddOdds: number; // 좌4홀
  ldRight3OddOdds: number; // 우3홀
  ldLeft4EvenOdds: number; // 좌4짝
};

/**
 * 게임별 설정
 */
export type GameConfig = {
  gameName: string;
  gameType: MiniGameType;
  enabled: boolean;
  videoUrl: string;
  videoUrlMobile?: string;
  contentWidth?: number;
  contentHeight?: number;
  powerThresholdText?: string; // 파워볼 언오버 기준점
  normalThresholdText?: string; // 일반볼 언오버 기준점
};














