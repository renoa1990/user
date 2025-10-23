import type { NextPage } from "next";
import Head from "next/head";
import Box from "@mui/material/Box";
import Container from "@components/Container";
import client from "@libs/server/client";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { withSsrSession } from "@libs/server/withSession";
import { IncomingMessage, ServerResponse } from "http";
import geoip from "fast-geoip";
import { RegisterForm } from "@components/Register/RegisterForm";
import {
  authContainerStyle,
  authCardStyle,
} from "../../components/auth/auth-styles";
import AnimatedSpaceBg from "@/components/AnimatedSpaceBg";

interface PropsData {
  devicedata: {
    country: string;
    city: string;
    viewport: string;
    ip: string;
  };
  invite: boolean;
  code: string;
}
interface serverside {
  req?: IncomingMessage;
  res?: ServerResponse;
  query: {
    id: any;
    country: string;
    city: string;
    viewport: string;
    userip: string;
  };
}

const Register: NextPage<PropsData> = (Props) => {
  return (
    <>
      <Head>
        <title>회원가입 - BABEL</title>
        <meta name="description" content="BABEL 회원가입을 완료하세요" />
      </Head>
      <main>
        <Box sx={authContainerStyle}>
          <AnimatedSpaceBg />
          <Box sx={authCardStyle}>
            <RegisterForm {...Props} />
          </Box>
        </Box>
      </main>
    </>
  );
};

const Page: NextPage<PropsData> = (Props) => {
  return <Register {...Props} />;
};

export const getServerSideProps = withSsrSession(async function ({
  req,
  res,
  query,
}: serverside) {
  const user = req?.session.user;
  const code = query?.id;

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
  if (code) {
    const check = await client.code.findFirst({
      where: {
        code: code,
        codeActivate: true,
      },
    });
    if (!check) {
      return { notFound: true };
    }
  } else {
    return { notFound: true };
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
      code: JSON.parse(JSON.stringify(code)),
    },
  };
});

export default Page;
