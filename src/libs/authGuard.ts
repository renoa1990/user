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
    revalidateOnFocus: true, // 포커스 시 재검증 활성화
    revalidateOnReconnect: true, // 재연결 시 재검증 활성화
    dedupingInterval: 5000, // 5초간 중복 요청 방지
    errorRetryCount: 5, // 에러 시 5회 재시도
    errorRetryInterval: 1000, // 재시도 간격 1초
    shouldRetryOnError: true, // 에러 시 재시도 활성화
    refreshInterval: 30000, // 30초마다 자동 갱신
  });
  const router = useRouter();
  const [clearSession] = useMutation("/api/users/clear-session");

  useEffect(() => {
    // 에러가 발생했을 때만 로그아웃 처리 (데이터가 없을 때는 로딩 중일 수 있음)
    if (error) {
      console.log("Auth error:", error);
      // 네트워크 오류인 경우 더 긴 시간 대기 후 로그아웃
      setTimeout(() => {
        clearSession({});
        router.push("/");
      }, 5000);
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
