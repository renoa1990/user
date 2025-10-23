// 배너 컴포넌트에서 사용하는 공통 스타일 및 테마
import { SxProps, Theme } from "@mui/material";
import { glow, pulse } from "./banner-animations";

// 그라데이션 색상 팔레트
export const gradients = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  primaryReverse: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
  secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  secondaryReverse: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
  success: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  warning: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
  info: "linear-gradient(135deg, #00BFFF 0%, #0080FF 100%)",
  dark: "linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 100, 255, 0.05) 100%)",
  darkHover:
    "linear-gradient(135deg, rgba(0, 191, 255, 0.2) 0%, rgba(0, 100, 255, 0.1) 100%)",
  glass: "linear-gradient(180deg, rgba(40,40,40,0.7), rgba(20,20,20,0.7))",
  glassHover: "linear-gradient(180deg, rgba(60,60,60,0.8), rgba(30,30,30,0.8))",
};

// 공통 버튼 스타일
export const getButtonStyle = (
  variant: "primary" | "secondary" | "success" | "warning" = "primary"
): SxProps<Theme> => ({
  flex: 1,
  py: 1.5,
  borderRadius: 2,
  fontSize: "0.95rem",
  fontWeight: 600,
  background: gradients[variant],
  boxShadow: `0 4px 12px ${getBoxShadowColor(variant)}`,
  "&:hover": {
    background:
      variant === "primary"
        ? gradients.primaryReverse
        : variant === "secondary"
        ? gradients.secondaryReverse
        : gradients[variant],
    boxShadow: `0 6px 16px ${getBoxShadowColor(variant, 0.6)}`,
    transform: "translateY(-2px)",
  },
  transition: "all 0.3s ease",
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
});

// 박스 쉐도우 색상 헬퍼
const getBoxShadowColor = (variant: string, opacity: number = 0.4): string => {
  const colors = {
    primary: `rgba(102, 126, 234, ${opacity})`,
    secondary: `rgba(245, 87, 108, ${opacity})`,
    success: `rgba(56, 239, 125, ${opacity})`,
    warning: `rgba(255, 94, 98, ${opacity})`,
    info: `rgba(0, 191, 255, ${opacity})`,
  };
  return colors[variant as keyof typeof colors] || colors.primary;
};

// 공통 배너 컨테이너 스타일
export const bannerContainerStyle: SxProps<Theme> = {
  position: "relative",
  p: 2,
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  gap: 2,
  background: gradients.dark,
  backdropFilter: "blur(10px)",
  border: "2px solid #00BFFF",
  textDecoration: "none !important",
  color: "inherit",
  overflow: "hidden",
  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  animation: `${glow} 3s ease-in-out infinite`,
};

// 공통 아이콘 컨테이너 스타일
export const iconContainerStyle: SxProps<Theme> = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: gradients.info,
  padding: 0.5,
};

// 공통 인디케이터 도트 스타일
export const getIndicatorDotStyle = (isActive: boolean): SxProps<Theme> => ({
  width: isActive ? 24 : 8,
  height: 8,
  borderRadius: 4,
  bgcolor: isActive ? "primary.main" : "rgba(255, 255, 255, 0.5)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    bgcolor: isActive ? "primary.main" : "rgba(255, 255, 255, 0.8)",
  },
});

// 공통 오버레이 스타일 (Backdrop 등)
export const overlayStyle: SxProps<Theme> = {
  zIndex: 9999,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  backdropFilter: "blur(8px)",
};

// 공통 닫기 버튼 스타일
export const closeButtonStyle: SxProps<Theme> = {
  position: "absolute",
  top: -16,
  right: -16,
  bgcolor: "rgba(255, 255, 255, 0.9)",
  color: "text.primary",
  zIndex: 10,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  "&:hover": {
    bgcolor: "error.main",
    color: "white",
    transform: "rotate(90deg) scale(1.1)",
  },
  transition: "all 0.3s ease",
};

// 공통 네비게이션 버튼 스타일
export const navigationButtonStyle: SxProps<Theme> = {
  bgcolor: "rgba(0, 0, 0, 0.6)",
  color: "white",
  "&:hover": {
    bgcolor: "rgba(0, 0, 0, 0.8)",
    transform: "scale(1.1)",
  },
  transition: "all 0.2s ease",
};

// 공통 펄스 도트 스타일
export const pulseDotStyle: SxProps<Theme> = {
  display: "inline-block",
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: "#00FF00",
  animation: `${pulse} 2s ease-in-out infinite`,
  mr: 0.5,
};

// 공통 장식 라인 스타일
export const decorativeLineStyle: SxProps<Theme> = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "4px",
  background: "linear-gradient(180deg, #00BFFF 0%, #0080FF 100%)",
  animation: `${pulse} 2s ease-in-out infinite`,
};

// 반응형 텍스트 크기
export const responsiveFontSize = {
  xs: "0.875rem",
  sm: "0.95rem",
  md: "1rem",
  lg: "1.1rem",
};

// 공통 카드 스타일
export const cardStyle: SxProps<Theme> = {
  borderRadius: 2,
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  position: "relative",
};

// 글래스모피즘 스타일
export const glassmorphismStyle: SxProps<Theme> = {
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
};




