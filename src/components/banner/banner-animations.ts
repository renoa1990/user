// 배너 컴포넌트에서 사용하는 공통 애니메이션 정의
import { keyframes } from "@mui/material";

// 페이드인 애니메이션
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 페이드아웃 애니메이션
export const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
`;

// 슬라이드 인 애니메이션 (아래에서 위로)
export const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 슬라이드 인 애니메이션 (위에서 아래로)
export const slideInFromTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 슬라이드 인 애니메이션 (왼쪽에서)
export const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 슬라이드 인 애니메이션 (오른쪽에서)
export const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// 펄스 애니메이션 (박스 쉐도우)
export const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 191, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 191, 255, 0);
  }
`;

// 펄스 애니메이션 (스케일)
export const pulseScale = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// 글로우 애니메이션
export const glow = keyframes`
  0%, 100% {
    border-color: #00BFFF;
    box-shadow: 0 0 5px rgba(0, 191, 255, 0.5);
  }
  50% {
    border-color: #00D4FF;
    box-shadow: 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.4);
  }
`;

// 반짝임 애니메이션
export const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

// 바운스 애니메이션
export const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// 회전 애니메이션
export const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 흔들림 애니메이션
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
`;

// 아이콘 바운스 애니메이션
export const iconBounce = keyframes`
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

// 그라데이션 이동 애니메이션
export const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 확대 애니메이션
export const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 축소 애니메이션
export const zoomOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`;




