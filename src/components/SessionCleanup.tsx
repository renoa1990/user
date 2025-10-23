import { useEffect } from "react";
import useMutation from "@libs/useMutation";

interface SessionCleanupProps {
  userId?: number;
}

const SessionCleanup: React.FC<SessionCleanupProps> = ({ userId }) => {
  const [clearSession] = useMutation("/api/users/clear-session");

  useEffect(() => {
    if (!userId) return;

    const handleBeforeUnload = () => {
      // 페이지 언로드 시에만 세션 정리 (탭 닫기, 페이지 새로고침 등)
      if (navigator.sendBeacon) {
        const formData = new FormData();
        formData.append("data", JSON.stringify({}));
        navigator.sendBeacon("/api/users/clear-session", formData);
      } else {
        // sendBeacon을 지원하지 않는 경우 fetch 사용
        fetch("/api/users/clear-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          keepalive: true, // 페이지 언로드 후에도 요청 완료 보장
        }).catch(() => {
          // 에러는 무시 (페이지가 이미 언로드 중)
        });
      }
    };

    // beforeunload 이벤트만 등록 (탭 닫기, 페이지 새로고침 시에만)
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId]);

  return null; // UI 렌더링 없음
};

export default SessionCleanup;
