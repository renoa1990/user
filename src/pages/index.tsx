import type { NextPage } from "next";
import Head from "next/head";
import Box from "@mui/material/Box";
import Container from "@components/Container";
import { LoginForm } from "@components/Login/LoginForm";
import client from "@libs/server/client";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { withSsrSession } from "@libs/server/withSession";
import { IncomingMessage, ServerResponse } from "http";
import geoip from "fast-geoip";
import useMutation from "@libs/useMutation";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRouter } from "next/router";
import { ClientLoading } from "@components/client-loading";
import Image from "next/image";
import { Button, Card, CardContent, Divider, TextField } from "@mui/material";
import TelegramBanner from "@/components/TelegramBanner";
import {
  authContainerStyle,
  authCardStyle,
} from "../components/auth/auth-styles";
import AnimatedSpaceBg from "@/components/AnimatedSpaceBg";

interface PropsData {
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
  onRegister: boolean;
}
interface serverside {
  req?: IncomingMessage;
  res?: ServerResponse;
  query: {
    country: string;
    city: string;
    viewport: string;
    userip: string;
  };
}
interface LoginForm {
  userId: string;
  password: string;
}
interface responsData {
  ok: boolean;
  CF_success?: boolean;
  userIdCheck: boolean;
  passwordCheck: boolean;
  registe: boolean;
  confirm: boolean;
  loginok: boolean;
  block: boolean;
  bonus: {
    ok: boolean;
    message: string;
  };
}

export const Login: NextPage<PropsData> = (Props) => {
  const { devicedata, onRegister } = Props;
  const [login, { loading, data, error }] =
    useMutation<responsData>("/api/users/login");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const router = useRouter();

  const onValid = (ValidForm: LoginForm) => {
    if (loading) return;
    if (isLoading) return;
    setIsLoading(true);
    login({ ValidForm, devicedata });
  };

  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (data?.loginok) {
          enqueueSnackbar("환영합니다", {
            variant: "success",
          });
          // 로딩 상태를 false로 설정하고 즉시 리다이렉트
          setIsLoading(false);
          // 세션 저장을 기다린 후 리다이렉트 (더 긴 시간 대기)
          setTimeout(() => {
            router.replace("/home"); // push 대신 replace 사용
          }, 500);
        }
        if (data?.userIdCheck || data.passwordCheck) {
          enqueueSnackbar("아이디 또는 패스워드가 유효하지 않습니다", {
            variant: "error",
          });
          setIsLoading(false);
        }
        if (data?.registe) {
          enqueueSnackbar("탈퇴한 회원입니다", {
            variant: "error",
          });
          setIsLoading(false);
        }
        if (data?.confirm) {
          enqueueSnackbar("승인대기중인 회원입니다", {
            variant: "info",
          });
          setIsLoading(false);
        }
        if (data?.block) {
          router.replace("/404");
        }
        if (data?.bonus?.ok) {
          enqueueSnackbar(`${data.bonus.message}`, {
            variant: "success",
          });
          setIsLoading(false);
        }
        return;
      } else {
        enqueueSnackbar("오류가 발생했습니다.새로고침후 이용해주세요.", {
          variant: "error",
        });
      }
    }
  }, [data]);

  return (
    <>
      <Head>
        <title>로그인 - BABEL</title>
        <meta
          name="description"
          content="BABEL에 로그인하여 다양한 서비스를 이용하세요"
        />
      </Head>
      <main>
        <Box sx={authContainerStyle}>
          <AnimatedSpaceBg />
          <Box sx={authCardStyle}>
            <LoginForm
              onRegister={onRegister}
              onValid={onValid}
              loading={isLoading}
              devicedata={devicedata}
            />
          </Box>
        </Box>
      </main>
    </>
  );
};

const Page: NextPage<PropsData> = (Props) => {
  return <Login {...Props} />;
};
export default Page;

export const getServerSideProps = withSsrSession(async function ({
  req,
  res,
  query,
}: serverside) {
  const ip =
    req?.headers["x-real-ip"] ||
    req?.headers["x-forwarded-for"] ||
    req?.connection.remoteAddress;
  const geo = await geoip.lookup(ip as string);

  if (!ip) {
    return { notFound: true };
  } else {
    const ipBlockCheck = await client.basicSetup.findFirst({
      select: {
        userIpBlock: true,
        serverDown: true,
        foreignBlock: true,
      },
    });
    if (!ipBlockCheck) return { notFound: true };
    if (ipBlockCheck?.serverDown) return { notFound: true };
    if (ipBlockCheck?.foreignBlock && geo?.country !== "KR")
      return { notFound: true };
    if (ipBlockCheck?.foreignBlock && geo?.country !== "KR")
      return { notFound: true };

    if (ipBlockCheck?.userIpBlock) {
      const ipCheck = await client.ipblock.findFirst({
        where: {
          ip: ip.toString(),
        },
      });

      if (ipCheck) {
        return { notFound: true };
      }
    }
  }
  const user = req?.session.user;

  if (user) {
    const me = await client.parisuser.findFirst({
      where: {
        id: user?.id,
        role: { in: ["user", "test"] },
        session: user?.TTXD,
      },
      select: {
        id: true,
        session: true,
      },
    });
    if (me) {
      return {
        redirect: {
          destination: "/home",
        },
      };
    } else {
      req.session.destroy();
    }
  }

  const onRegister = Boolean(
    await client.userSetup.findFirst({
      where: {
        register: true,
      },
    })
  );
  const devicedata = {
    country: geo ? geo?.country : "unknown",
    city: geo ? geo?.city : "unknown",
    viewport: query.viewport,
    ip: ip,
  };

  return {
    props: {
      devicedata: JSON.parse(JSON.stringify(devicedata)),
      onRegister: JSON.parse(JSON.stringify(onRegister)),
    },
  };
});
