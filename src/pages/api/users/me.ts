import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  if (user) {
    const [profile, serverDown] = await Promise.all([
      client.parisuser.findFirst({
        where: {
          id: user?.id,
          OR: [{ role: "user" }, { role: "test" }],
          session: user.TTXD,
          activate: "true",
        },
        select: {
          id: true,
          nickName: true,
          userId: true,
          session: true,
          lv: true,
          money: true,
          role: true,
          point: true,
          message: {
            where: {
              userCheck: false,
            },
            select: { id: true },
          },

          contact: {
            where: {
              userCheck: false,
              NOT: {
                adminTitle: "",
              },
            },
            select: {
              id: true,
            },
          },
        },
      }),
      client.basicSetup.findFirst({
        where: {
          serverDown: true,
        },
      }),
    ]);

    if (serverDown) {
      if (req.session) {
        req.session.destroy();
      }
      return res.json({
        ok: false,
      });
    }

    if (profile) {
      // 세션 토큰이 일치하거나, 세션이 비어있는 경우 (새로고침 등) 허용
      if (profile.session === user.TTXD || !profile.session) {
        // 세션이 비어있다면 현재 세션으로 업데이트
        if (!profile.session) {
          await client.parisuser.update({
            where: { id: user.id },
            data: {
              session: user.TTXD,
            },
          });
        }

        res.json({
          ok: true,
          profile: {
            id: profile.id,
            nickName: profile.nickName,
            userId: profile.userId,
            lv: profile.lv,
            money: profile.money,
            point: profile.point,
            message: profile.message.length,
            contact: profile.contact.length,
            role: profile.role,
          },
        });
      } else {
        // 중복 로그인 감지 시에도 현재 세션을 허용 (기존 세션이 만료된 경우)
        console.log("Session mismatch detected, allowing current session");
        await client.parisuser.update({
          where: { id: user.id },
          data: {
            session: user.TTXD,
          },
        });

        res.json({
          ok: true,
          profile: {
            id: profile.id,
            nickName: profile.nickName,
            userId: profile.userId,
            lv: profile.lv,
            money: profile.money,
            point: profile.point,
            message: profile.message.length,
            contact: profile.contact.length,
            role: profile.role,
          },
        });
      }
    } else {
      // 사용자 없음 - 데이터베이스 세션도 정리
      if (user?.id) {
        await client.parisuser.update({
          where: { id: user.id },
          data: {
            session: "",
          },
        });
      }
      req.session.destroy();
      res.json({
        ok: false,
      });
    }
  } else {
    // 세션 없음 - 이미 정리된 상태
    req.session.destroy();
    res.json({
      ok: false,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
