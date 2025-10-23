import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BabelLoader from "./BabelLoader";

/**
 * 페이지 전환(URL 변경) 시 BabelLoader를 표시하는 컴포넌트
 */
export default function RouteProgressLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      // 현재 URL과 다른 경우에만 로딩 표시
      if (url !== router.asPath) {
        setLoading(true);
      }
    };

    const handleComplete = () => {
      setLoading(false);
    };

    // Router 이벤트 등록
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    // 컴포넌트 언마운트 시 이벤트 제거
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  // 로딩 중이 아니면 아무것도 렌더링하지 않음
  if (!loading) {
    return null;
  }

  // 로딩 중일 때 BabelLoader 표시
  return (
    <BabelLoader
      fullscreen={true}
      withBackground={true}
      showCenterLogo={true}
      backdropOpacity={0.95}
      zIndex={9999}
      blockPointer={true}
    />
  );
}
