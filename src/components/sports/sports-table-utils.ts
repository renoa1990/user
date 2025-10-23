import { Decimal } from "@prisma/client/runtime/library";
import moment from "moment";

/* ================== 상수 ================== */
export const sportEmoji: Record<string, string> = {
  soccer: "⚽",
  basketball: "🏀",
  baseball: "🥎",
  volleyball: "🏐",
  "ice-hockey": "🏒",
  "e-sports": "🎮",
  other: "🎯",
};

/* ================== 유틸 함수 ================== */
export const changeGameType = (type: string): string => {
  if (type === "match") return "승무패";
  if (type === "handicap") return "핸디캡";
  if (type === "unover") return "언더오버";
  return type;
};

export const formatKickoff = (date: Date): string => {
  return moment(date).format("MM/DD(ddd) HH:mm");
};

export const formatOdds = (
  odds: Decimal | number | null | undefined
): string => {
  if (typeof odds === "number") return odds.toFixed(2);
  if (odds && typeof odds === "object" && "toNumber" in odds) {
    return odds.toNumber().toFixed(2);
  }
  return "-";
};

export const calculateRemainingTime = (playTime: Date): string => {
  const currentTime = new Date().getTime();
  const gameTime = new Date(playTime).getTime();
  const remainingTime = gameTime - currentTime;

  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

  if (hours === 0) {
    if (minutes === 0) return `${seconds}초전`;
    return `${minutes}분전`;
  }
  return `${hours}시간전`;
};

export const getImageUrl = (imgPath?: string | null): string => {
  if (!imgPath) return "/images/flag/u/United Nations.png";
  if (imgPath.includes("/")) return imgPath;

  // Cloudflare 이미지 URL 구성
  const imageURL = "https://imagedelivery.net/0EdjdSJHte47tUPbcTsE7w/";
  const imageURL2 = "/public";
  return imageURL + imgPath + imageURL2;
};

/* ================== 스타일 상수 ================== */
export const CELL_HEIGHT = 44;

export const cellBaseStyle = {
  border: (t: any) => `1px solid ${t.palette.divider}`,
  borderRadius: 0,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
} as const;

// 캐시된 스타일 객체들
const styleCache = new Map<string, any>();

export const getPickableCellStyle = (
  isSelected: boolean,
  hasOdds: boolean,
  isMobile: boolean
) => {
  const key = `${isSelected}-${hasOdds}-${isMobile}`;

  if (!styleCache.has(key)) {
    styleCache.set(key, {
      ...cellBaseStyle,
      backgroundColor: isSelected ? "primary.main" : "background.paper",
      color: isSelected ? "primary.contrastText" : "text.primary",
      cursor: hasOdds ? "pointer" : "default",
      justifyContent: "space-between",
      px: 1,
      ...(!isMobile &&
        hasOdds && {
          "&:hover": {
            backgroundColor: isSelected ? "primary.dark" : "action.hover",
            boxShadow: (t: any) => `inset 0 0 0 1px ${t.palette.primary.main}`,
          },
        }),
    });
  }

  return styleCache.get(key);
};

/* ================== 선택 상태 체크 (메모이제이션용) ================== */
export const isMatchSelected = (
  cartList: any[],
  matchId: number,
  pick: string
): boolean => {
  return cartList.some((i) => i.id === matchId && i.pick === pick);
};
