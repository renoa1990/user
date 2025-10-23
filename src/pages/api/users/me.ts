import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const user = req.session?.user;

  if (user) {
    const [profile, serverDown] = await Promise.all([
      client.parisuser.findFirst({
        where: {
          id: user?.id,
          OR: [{ role: "user" }, { role: "test" }],
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
      // 강제 로그아웃 감지: 세션이 "FORCE_LOGOUT"으로 설정된 경우
      if (profile.session === "FORCE_LOGOUT") {
        console.log("Force logout detected for user:", user.id);
        req.session.destroy();
        return res.json({
          ok: false,
          message: "관리자에 의해 강제 로그아웃되었습니다",
        });
      }

      // 세션 토큰이 일치하거나, 세션이 비어있는 경우 허용
      if (
        profile.session === user.TTXD ||
        !profile.session ||
        profile.session === ""
      ) {
        // 세션이 비어있거나 일치하지 않으면 현재 세션으로 업데이트
        if (!profile.session || profile.session !== user.TTXD) {
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
        // 세션 토큰이 다르더라도 사용자가 활성화되어 있으면 허용
        // (다른 기기에서 로그인했을 수도 있지만, 현재 사용자를 우선시)
        console.log(
          "Session mismatch detected, but allowing current session for active user"
        );
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
    // 세션 없음 - 로그인 필요
    console.log("No session found in /api/users/me");
    res.json({
      ok: false,
      message: "로그인이 필요합니다",
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
    isPrivate: false, // 세션 검증을 우회하고 내부에서 처리
  })
);
