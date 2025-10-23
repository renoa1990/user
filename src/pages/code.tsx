import type { NextPage } from "next";
import Head from "next/head";
import Box from "@mui/material/Box";
import Container from "@components/Container";
import client from "@libs/server/client";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { withSsrSession } from "@libs/server/withSession";
import { IncomingMessage, ServerResponse } from "http";
import geoip from "fast-geoip";
import { CodeForm } from "@components/code/code-form";
import useMutation from "@libs/useMutation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { Code as Codes } from "@prisma/client";
import { ClientLoading } from "@components/client-loading";
import { Card, CardContent, Grid } from "@mui/material";
import Image from "next/image";
import {
  authContainerStyle,
  authCardStyle,
  authFormCardStyle,
  authLogoStyle,
} from "../components/auth/auth-styles";
import AnimatedSpaceBg from "@/components/AnimatedSpaceBg";

interface PropsData {
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
  invite: boolean;
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
interface CodeForm {
  code: String;
}

interface mut {
  ok: boolean;
  checkCode: Codes;
  block: number;
  CF_success?: boolean;
}

export const Code: NextPage<PropsData> = (Props) => {
  const { devicedata } = Props;
  const { enqueueSnackbar } = useSnackbar();
  const [registerCode, { loading, data }] = useMutation<mut>(
    "/api/users/register/code"
  );
  const router = useRouter();
  const onSubmit = (data: CodeForm) => {
    if (loading) return;
    registerCode({ data, devicedata });
  };
  useEffect(() => {
    if (data) {
      if (data.ok) {
        if (data.checkCode) {
          router.push(`/register/${data.checkCode.code}`);
        } else if (data.block) {
          router.push(`/`);
        } else {
          enqueueSnackbar("코드가 유효하지 않습니다", {
            variant: "error",
          });
        }
      }
    }
  }, [data]);

  return (
    <>
      <Head>
        <title>가입코드 입력 - BABEL</title>
        <meta
          name="description"
          content="BABEL 회원가입을 위한 가입코드를 입력하세요"
        />
      </Head>
      <main>
        <Box sx={authContainerStyle}>
          <AnimatedSpaceBg />
          <Box sx={authCardStyle}>
            <Card sx={authFormCardStyle}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={authLogoStyle}>
                  <Image
                    src="/images/main_logo.png"
                    alt="BABEL"
                    width={200}
                    height={76}
                    style={{ width: 160, height: "auto" }}
                    priority
                  />
                </Box>
                <CodeForm
                  onSubmit={onSubmit}
                  loading={loading}
                  devicedata={devicedata}
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </main>
    </>
  );
};

const Page: NextPage<PropsData> = (Props) => {
  return <Code {...Props} />;
};

export const getServerSideProps = withSsrSession(async function ({
  req,
  res,
  query,
}: serverside) {
  const user = req?.session.user;

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

  if (user) {
    const me = await client.parisuser.findFirst({
      where: { id: user?.id, role: "user", session: user?.TTXD },
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

  const onRegister = await client.userSetup.findFirst({
    select: {
      register: true,
      invite: true,
    },
  });
  if (!onRegister?.register) return { notFound: true };

  const devicedata = {
    country: geo ? geo?.country : "unknown",
    city: geo ? geo?.city : "unknown",
    viewport: query.viewport,
    ip: ip,
  };

  return {
    props: {
      devicedata: JSON.parse(JSON.stringify(devicedata)),
      invite: JSON.parse(JSON.stringify(onRegister.invite)),
    },
  };
});

export default Page;
