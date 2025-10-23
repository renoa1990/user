import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      data: { code },
      devicedata: { country, city, viewport, ip },
    },
  } = req;

  const checkCode = await client.code.findFirst({
    where: {
      code,
      codeActivate: true,
    },
    select: {
      code: true,
    },
  });

  if (checkCode) {
    await client.ipLog.create({
      data: {
        ip,
        contry_code: country,
        state: city,
        domain: req.headers.host ? req.headers.host : "unknown",
        device: viewport,
        status: true,
        memo: `${code} 가입코드 인증`,
        category: "code",
      },
    });
    res.json({
      ok: true,
      checkCode,
    });
  } else {
    await client.ipLog.create({
      data: {
        ip,
        contry_code: country,
        state: city,
        domain: req.headers.host ? req.headers.host : "unknown",
        device: viewport,
        status: false,
        memo: `${code} 회원가입 시도, 가입코드 불일치`,
        category: "code",
      },
    });

    const ipblock = await client.basicSetup.findFirst({
      select: {
        userIpAutoBlock: true,
        userIpAutoBlockNum: true,
        userIpBlock: true,
      },
    });

    if (ipblock?.userIpBlock && ipblock?.userIpAutoBlock) {
      const now = new Date();
      const lastCode = await client.ipLog.findFirst({
        where: {
          status: true,
          category: "code",
          ip: ip,
        },
        orderBy: { createAt: "desc" },
        select: { id: true },
      });

      const faildCount = await client.ipLog.aggregate({
        where: {
          ip,
          status: false,
          category: "code",
          createAt: {
            gte: new Date(now.setDate(now.getDate() - 1)),
            lte: new Date(),
          },
        },
        _count: true,
        ...(lastCode?.id && { cursor: { id: lastCode.id } }),
        orderBy: { id: "asc" },
      });
      if (faildCount._count >= ipblock.userIpAutoBlockNum) {
        await client.ipblock.upsert({
          where: {
            ip,
          },
          update: {},
          create: {
            ip,
            memo: `${faildCount._count} 회 가입코드 인증 실패`,
            confirmUser: "AUTO BOT",
          },
        });
        return res.json({
          ok: true,
          block: true,
        });
      }
    }
    res.json({
      ok: true,
      checkCode,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
