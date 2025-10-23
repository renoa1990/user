import { useEffect, useState, useRef } from "react";
import type { FC, ReactNode } from "react";
import { ClientNavbar } from "./clientNavbar";
import getTheme from "src/theme/client-theme";
import { Box } from "@mui/system";
import { Container, Paper } from "@mui/material";
import authGuard from "@libs/authGuard";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";
import ClientMobileSidebar from "./mobileSidebar";
import AccountSidebar from "./accountSidebar";
import { useRouter } from "next/router";
import ModalConfirm from "@components/ModalConfirm";
import { Footer } from "./footer";
import SessionCleanup from "@components/SessionCleanup";

interface ClientLayoutProps {
  children?: ReactNode;
  gameCode?: string;
  game_Event?: string;
  mutate?: () => void;
  activeTab?: string;
  bonus?: {
    bonus: string;
    count: number;
  } | null;
}

export const ClientLayout: FC<ClientLayoutProps> = ({
  children,
  gameCode,
  game_Event,
  mutate,
  activeTab,
  bonus,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = getTheme();
  const userData = authGuard();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: false,
  });

  const router = useRouter();
  const [openSidebar, setOpenSidebar] = useState(false);
  const open = isMd ? false : openSidebar;

  const handleSidebarOpen = (): void => {
    setOpenSidebar(true);
  };
  const handleSidebarClose = (): void => {
    setOpenSidebar(false);
  };

  const [openAccountSidebar, setOpenAccountSidebar] = useState(false);
  const handleAccountSidebarOpen = (): void => {
    setOpenAccountSidebar(true);
  };
  const handleAccountSidebarClose = (): void => {
    setOpenAccountSidebar(false);
  };

  const [openMobileCart, setOpenMobileCart] = useState(false);
  // 데스크탑에서 gameCode가 있으면 카트를 항상 표시
  const CartOpen = isMd ? !!gameCode : openMobileCart;
  const handleCartOpen = (): void => {
    setOpenMobileCart(true);
  };
  const handleCartClose = (): void => {
    setOpenMobileCart(false);
  };

  // 중복 알림 방지를 위한 ref
  const notificationShown = useRef({
    message: false,
    contact: false,
  });

  useEffect(() => {
    if (userData.message) {
      enqueueSnackbar("중복로그인", {
        variant: "error",
      });
    }
  }, [userData?.message]);

  // 메시지 알림 처리
  useEffect(() => {
    if (
      userData?.user?.message &&
      router.pathname !== "/message" &&
      !notificationShown.current.message
    ) {
      notificationShown.current.message = true;
      router.replace("/message");
      enqueueSnackbar(`쪽지를 확인하세요`, {
        variant: "success",
        autoHideDuration: 5000,
      });
    }

    // 메시지가 없으면 알림 상태 초기화
    if (!userData?.user?.message) {
      notificationShown.current.message = false;
    }
  }, [userData?.user?.message, router.pathname]);

  // 고객문의 답변 알림 처리
  useEffect(() => {
    if (
      userData?.user?.contact &&
      router.pathname !== "/contact" &&
      !notificationShown.current.contact
    ) {
      notificationShown.current.contact = true;
      enqueueSnackbar("고객문의 답변을 확인하세요.", {
        variant: "success",
        autoHideDuration: 5000,
      });
    }

    // 고객문의가 없으면 알림 상태 초기화
    if (!userData?.user?.contact) {
      notificationShown.current.contact = false;
    }
  }, [userData?.user?.contact, router.pathname]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <ModalConfirm />
      <SessionCleanup userId={userData?.user?.id} />
      <ClientNavbar
        onSidebarOpen={handleSidebarOpen}
        onAccountSidebarOpen={handleAccountSidebarOpen}
        message={userData?.user?.message}
        contact={userData?.user?.contact}
        money={userData?.user?.money}
        point={userData?.user?.point}
        lv={userData?.user?.lv}
        nickname={userData?.user?.nickName}
      />

      <ClientMobileSidebar
        onClose={handleSidebarClose}
        open={open}
        variant="temporary"
      />

      <AccountSidebar
        open={openAccountSidebar}
        onClose={handleAccountSidebarClose}
        nickname={userData?.user?.nickName}
        money={userData?.user?.money}
        point={userData?.user?.point}
        lv={userData?.user?.lv}
        message={userData?.user?.message}
        contact={userData?.user?.contact}
      />
      <Box sx={{ flex: "1 0 auto" }}>
        <Box sx={{ py: 1, width: "100%" }}>{children}</Box>
      </Box>
      <Footer />
    </Box>
  );
};
