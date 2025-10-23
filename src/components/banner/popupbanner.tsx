import React, { FC, useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { banner } from "@prisma/client";
import {
  Backdrop,
  Box,
  IconButton,
  keyframes,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import useMutation from "@libs/useMutation";
import { imageURL, imageURL2 } from "@libs/cfimageURL";
import CloseIcon from "@mui/icons-material/Close";

interface props {
  banner: banner[];
}
interface mutRes {
  ok: boolean;
  off: boolean;
  nothing: boolean;
}

// 페이드인 애니메이션
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 페이드아웃 애니메이션
const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
`;

// 슬라이드 인 애니메이션 (아래에서 위로)
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const PopupBanner: FC<props> = (props) => {
  const { banner } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [ThreeDayOff, { data, loading }] = useMutation<mutRes>(
    "/api/home/banneroff"
  );

  const [currentPopup, setCurrentPopup] = useState(banner ? banner : []);
  const [isClosing, setIsClosing] = useState(false);

  // 현재 배너는 항상 첫 번째 배너
  const handleClose = (id: number) => {
    setIsClosing(true);
    setTimeout(() => {
      setCurrentPopup((prevIndexes) =>
        prevIndexes.filter((item) => item.id !== id)
      );
      setIsClosing(false);
    }, 300);
  };

  const handle3DayOff = (id: number) => {
    if (loading) return;
    ThreeDayOff({ id });
    handleClose(id);
  };

  const handleCloseAll = () => {
    setIsClosing(true);
    setTimeout(() => {
      setCurrentPopup([]);
      setIsClosing(false);
    }, 300);
  };

  // ESC 키로 현재 배너 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && currentPopup.length > 0) {
        handleClose(currentPopup[0].id);
      }
    };

    if (currentPopup.length > 0) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [currentPopup]);

  if (!currentPopup || currentPopup.length === 0) return null;

  const currentBanner = currentPopup[0]; // 항상 첫 번째 배너만 표시
  const remainingCount = currentPopup.length;
  const currentPosition = banner.length - currentPopup.length + 1;

  return (
    <Backdrop
      open={currentPopup.length > 0}
      sx={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        // 백드롭 클릭 시 아무 동작 안 함 (순서대로 닫아야 함)
        e.stopPropagation();
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: "relative",
          width: isMobile ? "100vw" : "auto",
          maxWidth: isMobile ? "100vw" : "380px",
          animation: isClosing
            ? `${fadeOut} 0.3s ease-out`
            : `${fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        {/* 닫기 버튼 */}
        <IconButton
          onClick={() => handleClose(currentBanner.id)}
          sx={{
            position: "absolute",
            top: isMobile ? 8 : -16,
            right: isMobile ? 8 : -16,
            bgcolor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            zIndex: 10,
            width: 40,
            height: 40,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(8px)",
            "&:hover": {
              bgcolor: "error.main",
              color: "white",
              transform: "rotate(90deg) scale(1.1)",
              borderColor: "error.main",
              boxShadow: "0 6px 16px rgba(211, 47, 47, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* 배너 이미지 */}
        <Box
          onClick={() => handleClose(currentBanner.id)}
          sx={{
            position: "relative",
            width: isMobile ? "100vw" : "380px",
            height: isMobile ? "auto" : "546px",
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            boxShadow: isMobile ? "none" : "0 20px 60px rgba(0, 0, 0, 0.5)",
            animation: `${slideInUp} 0.5s ease-out`,
            cursor: "pointer",
            "&:hover": {
              transform: "scale(1.02)",
              transition: "transform 0.2s ease",
            },
          }}
        >
          <Image
            src={imageURL + currentBanner.url + imageURL2}
            width={380}
            height={546}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgwIiBoZWlnaHQ9IjU0NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzgwIiBoZWlnaHQ9IjU0NiIgZmlsbD0iIzIwMjAyMCIvPjwvc3ZnPg==`}
            alt={currentBanner.name || "popup"}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
            priority
          />

          {/* 페이지 인디케이터 (여러 배너가 있을 때만) */}
          {remainingCount > 1 && (
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: "absolute",
                top: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                padding: "8px 16px",
                bgcolor: "rgba(0, 0, 0, 0.8)",
                borderRadius: 3,
                backdropFilter: "blur(8px)",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
                zIndex: 5,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                pointerEvents: "none", // 클릭 이벤트 비활성화
              }}
            >
              {currentPosition} / {banner.length}
            </Box>
          )}
        </Box>

        {/* 하단 버튼 영역 */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: isMobile ? 0 : 2,
            p: isMobile ? 2 : 0,
            animation: `${slideInUp} 0.6s ease-out`,
          }}
        >
          <Button
            variant="contained"
            onClick={() => handle3DayOff(currentBanner.id)}
            disabled={loading}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: isMobile ? 1 : 2,
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              fontWeight: 600,
              background: "linear-gradient(135deg, #00BFFF 0%, #009ACD 100%)",
              boxShadow: "0 4px 12px rgba(0, 191, 255, 0.3)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #009ACD 0%, #00BFFF 100%)",
                boxShadow: "0 6px 16px rgba(0, 191, 255, 0.5)",
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                opacity: 0.6,
                background: "rgba(0, 191, 255, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            3일동안 보지 않기
          </Button>
          <Button
            variant="contained"
            onClick={() => handleClose(currentBanner.id)}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: isMobile ? 1 : 2,
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              fontWeight: 600,
              background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #c62828 0%, #d32f2f 100%)",
                boxShadow: "0 6px 16px rgba(211, 47, 47, 0.5)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            닫기
          </Button>
        </Box>

        {/* 남은 배너 힌트 */}
        {remainingCount > 1 && (
          <Box
            sx={{
              mt: isMobile ? 0 : 1,
              mb: isMobile ? 2 : 0,
              textAlign: "center",
              color: "text.secondary",
              fontSize: "0.75rem",
              fontWeight: 500,
              animation: `${fadeIn} 1s ease-out 0.5s both`,
              opacity: 0.8,
            }}
          >
            남은 배너: {remainingCount - 1}개 | ESC로 닫기
          </Box>
        )}
      </Box>
    </Backdrop>
  );
};

export default PopupBanner;
