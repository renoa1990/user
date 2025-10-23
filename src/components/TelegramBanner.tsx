// src/components/TelegramBanner.tsx

import { Box, Typography, keyframes } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

// 펄스 애니메이션 정의
const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 191, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 191, 255, 0);
  }
`;

// 글로우 애니메이션
const glow = keyframes`
  0%, 100% {
    border-color: #00BFFF;
    box-shadow: 0 0 5px rgba(0, 191, 255, 0.5);
  }
  50% {
    border-color: #00D4FF;
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.4);
  }
`;

// 아이콘 회전 애니메이션
const iconBounce = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
`;

export default function TelegramBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 페이드인 효과
    setIsVisible(true);
  }, []);

  return (
    <Box
      component="a"
      target="_blank"
      rel="noopener noreferrer"
      href="https://t.me/yourtelegramlink"
      sx={{
        position: "relative",
        p: 2,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        background:
          "linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 100, 255, 0.05) 100%)",
        backdropFilter: "blur(10px)",
        border: "2px solid #00BFFF",
        textDecoration: "none !important",
        color: "inherit",
        overflow: "hidden",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        animation: `${glow} 3s ease-in-out infinite`,

        // 배경 그라데이션 애니메이션 효과
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
          transition: "left 0.5s",
        },

        "&:hover": {
          background:
            "linear-gradient(135deg, rgba(0, 191, 255, 0.2) 0%, rgba(0, 100, 255, 0.1) 100%)",
          transform: "translateY(-4px) scale(1.02)",
          boxShadow:
            "0 8px 24px rgba(0, 191, 255, 0.3), 0 0 40px rgba(0, 191, 255, 0.2)",
          borderColor: "#00D4FF",

          "&::before": {
            left: "100%",
          },

          "& .telegram-icon": {
            animation: `${iconBounce} 0.6s ease-in-out`,
          },
        },

        "&:active": {
          transform: "translateY(-2px) scale(0.98)",
        },
      }}
    >
      {/* 좌측 장식 라인 */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: "linear-gradient(180deg, #00BFFF 0%, #0080FF 100%)",
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />

      <Typography
        fontSize={"medium"}
        fontWeight={700}
        sx={{
          color: "text.primary",
          flex: 1,
          textDecoration: "none !important",
          display: "flex",
          alignItems: "center",
          gap: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#00FF00",
            animation: `${pulse} 2s ease-in-out infinite`,
            mr: 0.5,
          }}
        />
        텔레그램 고객센터 바로가기
      </Typography>

      <Box
        className="telegram-icon"
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00BFFF 0%, #0080FF 100%)",
          padding: 0.5,
        }}
      >
        <Image
          src="/images/telegram.png"
          alt="Telegram"
          width={40}
          height={40}
          style={{ borderRadius: "50%" }}
        />
      </Box>
    </Box>
  );
}
