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
        return res.status(401).json({
          ok: false,
          message: "다른 곳에서 로그인하여 현재 세션이 종료되었습니다",
          forceLogout: true, // 강제 로그아웃 플래그 추가
        });
      }

      // 세션 토큰이 정확히 일치하는 경우만 허용
      if (profile.session === user.TTXD) {
        // 세션이 일치하므로 정상 처리

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
        // 세션 토큰이 일치하지 않으면 강제 로그아웃
        console.log(
          `Session mismatch detected for user ${user.id}: DB=${profile.session}, Session=${user.TTXD}`
        );
        req.session.destroy();
        return res.status(401).json({
          ok: false,
          message: "세션이 만료되었습니다. 다시 로그인해주세요.",
          forceLogout: true,
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
