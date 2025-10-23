/**
 * Prisma 데이터를 babel UI 타입으로 변환하는 어댑터
 */

import type { PowerballOdds, LadderOdds } from "@/types/minigame";
import type {
  PowerballSetup,
  PowerladderSetup,
  kinoLadderSetup,
  EosPowerballSetup,
  StarladderSetup,
} from "@prisma/client";

/**
 * EOS 파워볼 설정 → PowerballOdds 변환
 */
export function eosToOdds(setup: EosPowerballSetup): PowerballOdds {
  return {
    pbPowerOddOdds: Number(setup.game1_odd_home) || 0,
    pbPowerEvenOdds: Number(setup.game1_odd_away) || 0,
    pbPowerUnderOdds: Number(setup.game1_odd_under) || 0,
    pbPowerOverOdds: Number(setup.game1_odd_over) || 0,
    pbNormalOddOdds: Number(setup.game2_odd_home) || 0,
    pbNormalEvenOdds: Number(setup.game2_odd_away) || 0,
    pbNormalUnderOdds: Number(setup.game2_odd_under) || 0,
    pbNormalOverOdds: Number(setup.game2_odd_over) || 0,
    pbNormalSmallOdds: Number(setup.game3_odd_small) || 0,
    pbNormalMidOdds: Number(setup.game3_odd_medium) || 0,
    pbNormalBigOdds: Number(setup.game3_odd_large) || 0,
  };
}

/**
 * 네임드 파워볼 설정 → PowerballOdds 변환
 */
export function powerballToOdds(setup: PowerballSetup): PowerballOdds {
  return {
    pbPowerOddOdds: Number(setup.game1_odd_home) || 0,
    pbPowerEvenOdds: Number(setup.game1_odd_away) || 0,
    pbPowerUnderOdds: Number(setup.game1_odd_under) || 0,
    pbPowerOverOdds: Number(setup.game1_odd_over) || 0,
    pbNormalOddOdds: Number(setup.game2_odd_home) || 0,
    pbNormalEvenOdds: Number(setup.game2_odd_away) || 0,
    pbNormalUnderOdds: Number(setup.game2_odd_under) || 0,
    pbNormalOverOdds: Number(setup.game2_odd_over) || 0,
    pbNormalSmallOdds: Number(setup.game3_odd_small) || 0,
    pbNormalMidOdds: Number(setup.game3_odd_medium) || 0,
    pbNormalBigOdds: Number(setup.game3_odd_large) || 0,
  };
}

/**
 * 파워사다리 설정 → LadderOdds 변환
 */
export function powerLadderToOdds(setup: PowerladderSetup): LadderOdds {
  return {
    ldLeftOdds: Number(setup.game_odd_left) || 0,
    ldRightOdds: Number(setup.game_odd_right) || 0,
    ldOddOdds: Number(setup.game_odd_home) || 0,
    ldEvenOdds: Number(setup.game_odd_away) || 0,
    ld3LineOdds: Number(setup.game_odd_line3) || 0,
    ld4LineOdds: Number(setup.game_odd_line4) || 0,
    ldLeft3EvenOdds: 0, // user 스키마에 없음
    ldLeft4OddOdds: 0,
    ldRight3OddOdds: 0,
    ldLeft4EvenOdds: 0,
  };
}

/**
 * 키노사다리 설정 → LadderOdds 변환
 */
export function kinoLadderToOdds(setup: kinoLadderSetup): LadderOdds {
  return {
    ldLeftOdds: Number(setup.game_odd_left) || 0,
    ldRightOdds: Number(setup.game_odd_right) || 0,
    ldOddOdds: Number(setup.game_odd_home) || 0,
    ldEvenOdds: Number(setup.game_odd_away) || 0,
    ld3LineOdds: Number(setup.game_odd_line3) || 0,
    ld4LineOdds: Number(setup.game_odd_line4) || 0,
    ldLeft3EvenOdds: 0,
    ldLeft4OddOdds: 0,
    ldRight3OddOdds: 0,
    ldLeft4EvenOdds: 0,
  };
}

/**
 * 별다리 설정 → LadderOdds 변환
 */
export function starLadderToOdds(setup: StarladderSetup): LadderOdds {
  return {
    ldLeftOdds: Number(setup.game_odd_left) || 0,
    ldRightOdds: Number(setup.game_odd_right) || 0,
    ldOddOdds: Number(setup.game_odd_home) || 0,
    ldEvenOdds: Number(setup.game_odd_away) || 0,
    ld3LineOdds: Number(setup.game_odd_line3) || 0,
    ld4LineOdds: Number(setup.game_odd_line4) || 0,
    ldLeft3EvenOdds: 0,
    ldLeft4OddOdds: 0,
    ldRight3OddOdds: 0,
    ldLeft4EvenOdds: 0,
  };
}

/**
 * 게임 타입 판별
 */
export function getGameType(gameName: string): "POWERBALL" | "LADDER" {
  if (
    gameName.includes("파워볼") ||
    gameName.includes("powerball") ||
    gameName.includes("키노")
  ) {
    return "POWERBALL";
  }
  return "LADDER";
}

/**
 * 게임 설정 정보 가져오기
 */
export function getGameConfig(gameName: string) {
  const configs: Record<
    string,
    {
      videoUrl: string;
      videoUrlMobile: string;
      width: number;
      height: number;
      powerThreshold?: string;
      normalThreshold?: string;
    }
  > = {
    eos1: {
      videoUrl: "https://ntry.com/scores/eos_powerball/live.php?game_type=1",
      videoUrlMobile:
        "https://ntry.com/scores/eos_powerball/live_mobile.php?game_type=1",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    eos2: {
      videoUrl: "https://ntry.com/scores/eos_powerball/live.php?game_type=2",
      videoUrlMobile:
        "https://ntry.com/scores/eos_powerball/live_mobile.php?game_type=2",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    eos3: {
      videoUrl: "https://ntry.com/scores/eos_powerball/live.php?game_type=3",
      videoUrlMobile:
        "https://ntry.com/scores/eos_powerball/live_mobile.php?game_type=3",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    eos4: {
      videoUrl: "https://ntry.com/scores/eos_powerball/live.php?game_type=4",
      videoUrlMobile:
        "https://ntry.com/scores/eos_powerball/live_mobile.php?game_type=4",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    eos5: {
      videoUrl: "https://ntry.com/scores/eos_powerball/live.php?game_type=5",
      videoUrlMobile:
        "https://ntry.com/scores/eos_powerball/live_mobile.php?game_type=5",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    powerball: {
      videoUrl: "https://nt-live.ntry.com/powerball/",
      videoUrlMobile: "https://nt-live.ntry.com/powerball/?device=mo",
      width: 830,
      height: 640,
      powerThreshold: "4.5",
      normalThreshold: "72.5",
    },
    powerladder: {
      videoUrl: "https://nt-live.ntry.com/powerladder/",
      videoUrlMobile: "https://nt-live.ntry.com/powerladder/?device=mo",
      width: 830,
      height: 640,
    },
    kinoladder: {
      videoUrl: "https://nt-live.ntry.com/kinoladder/",
      videoUrlMobile: "https://nt-live.ntry.com/kinoladder/?device=mo",
      width: 830,
      height: 640,
    },
    starladder1: {
      videoUrl: "https://s3.bscr.kr/live/ladder_01.html",
      videoUrlMobile: "https://s3.bscr.kr/live/ladder_01_m.html",
      width: 830,
      height: 640,
    },
    starladder2: {
      videoUrl: "https://s3.bscr.kr/live/ladder_02.html",
      videoUrlMobile: "https://s3.bscr.kr/live/ladder_02_m.html",
      width: 830,
      height: 640,
    },
    starladder3: {
      videoUrl: "https://s3.bscr.kr/live/ladder_03.html",
      videoUrlMobile: "https://s3.bscr.kr/live/ladder_03_m.html",
      width: 830,
      height: 640,
    },
  };

  return configs[gameName] || configs.eos1;
}
