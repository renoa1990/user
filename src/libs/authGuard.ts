import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";
import useMutation from "@libs/useMutation";

interface ProfileResponse {
  ok: boolean;
  profile: {
    id: number;
    nickName: string;
    userId: string;
    lv: string;
    money: number;
    point: string;
    message: number;
    contact: number;
  };
  message: string;
}

export default function authGuard() {
  const { data, error } = useSWR<ProfileResponse>("/api/users/me", {
    revalidateOnFocus: false, // 포커스 시 재검증 비활성화 (너무 빈번한 요청 방지)
    revalidateOnReconnect: true, // 재연결 시에만 재검증
    dedupingInterval: 10000, // 10초간 중복 요청 방지 (더 긴 간격)
    errorRetryCount: 3, // 에러 시 3회만 재시도 (너무 많은 재시도 방지)
    errorRetryInterval: 2000, // 재시도 간격 2초 (더 긴 간격)
    shouldRetryOnError: (error) => {
      // 네트워크 오류나 5xx 에러만 재시도
      return error?.status >= 500 || error?.message?.includes("network");
    },
    refreshInterval: 0, // 자동 갱신 비활성화 (수동으로만 갱신)
  });
  const router = useRouter();
  const [clearSession] = useMutation("/api/users/clear-session");

  useEffect(() => {
    // 에러가 발생했을 때만 로그아웃 처리
    if (error) {
      console.log("Auth error:", error);
      // 네트워크 오류가 아닌 경우에만 즉시 로그아웃
      if (error?.status < 500 && !error?.message?.includes("network")) {
        clearSession({});
        router.push("/");
      } else {
        // 네트워크 오류인 경우 더 긴 시간 대기 후 로그아웃
        setTimeout(() => {
          clearSession({});
          router.push("/");
        }, 10000); // 10초로 연장
      }
    } else if (data && !data.ok) {
      // 명시적으로 실패한 경우에만 로그아웃
      console.log("Auth failed:", data);
      clearSession({});
      router.push("/");
    }
  }, [data, error, router, clearSession]);

  return {
    user: data?.profile,
    isLoading: !data && !error,
    message: data?.message,
  };
}
