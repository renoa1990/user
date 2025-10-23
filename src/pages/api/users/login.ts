import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import pwencoder, { comparePassword } from "@libs/server/pwencoder";
import numeral from "numeral";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      ValidForm: { userId, password },
      devicedata: { country, city, viewport, ip },
    },
  } = req;

  const userIdCheck = await client.parisuser.findFirst({
    where: {
      userId,
      OR: [{ role: "user" }, { role: "test" }],
    },
    select: {
      id: true,
      userId: true,
      password: true,
      role: true,
      activate: true,
      point: true,
      lv: true,
      nickName: true,
    },
  });

  //아이디 없음
  if (!userIdCheck) {
    await client.ipLog.create({
      data: {
        ip,
        contry_code: country,
        state: city,
        domain: req.headers.host ? req.headers.host : "unknown",
        device: viewport,
        status: false,
        memo: `${userId} 로그인 시도, 없는아이디 입니다`,
        category: "login",
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
      const lastlogin = await client.ipLog.findFirst({
        where: {
          status: true,
          category: "login",
        },
        orderBy: { createAt: "desc" },
      });

      const faildCount = await client.ipLog.aggregate({
        where: {
          ip,
          status: false,
          category: "login",
          createAt: {
            gte: new Date(now.setDate(now.getDate() - 1)),
            lte: new Date(),
          },
        },
        _count: true,
        cursor: { id: lastlogin?.id },
      });
      if (faildCount._count >= ipblock.userIpAutoBlockNum) {
        await client.ipblock.upsert({
          where: {
            ip,
          },
          update: {},
          create: {
            ip,
            memo: `${faildCount._count} 회 로그인 실패`,
            confirmUser: "AUTO BOT",
          },
        });
        return res.json({ ok: true, block: true });
      }
    }
    return res.json({
      ok: true,
      userIdCheck: true,
    });
  } //아이디 있음
  else {
    //패스워드 일치하는경우
    if (
      userIdCheck.password &&
      comparePassword(password, userIdCheck.password)
    ) {
      //   //승인대기중
      if (userIdCheck.activate === "null" || userIdCheck.activate === "ready") {
        await client.ipLog.create({
          data: {
            ip,
            contry_code: country,
            state: city,
            domain: req.headers.host ? req.headers.host : "unknown",
            device: viewport,
            status: false,
            memo: `${userId} 로그인 시도, 승인대기중 입니다.`,
            category: "login",
          },
        });
        return res.json({
          ok: true,
          confirm: true,
        });
      } // 탈퇴회원
      else if (userIdCheck.activate === "false") {
        await client.ipLog.create({
          data: {
            ip,
            contry_code: country,
            state: city,
            domain: req.headers.host ? req.headers.host : "unknown",
            device: viewport,
            status: false,
            memo: `${userId} 로그인 시도, 탈퇴한 회원입니다`,
            category: "login",
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
          const lastlogin = await client.ipLog.findFirst({
            where: {
              status: true,
              category: "login",
            },
            orderBy: { createAt: "desc" },
          });

          const faildCount = await client.ipLog.aggregate({
            where: {
              ip,
              status: false,
              category: "login",

              createAt: {
                gte: new Date(now.setDate(now.getDate() - 1)),
                lte: new Date(),
              },
            },
            _count: true,
            // cursor: { id: lastlogin?.id },
          });
          if (faildCount._count >= ipblock.userIpAutoBlockNum) {
            await client.ipblock.upsert({
              where: {
                ip,
              },
              update: {},
              create: {
                ip,
                memo: `${faildCount._count} 회 로그인 실패`,
                confirmUser: "AUTO BOT",
              },
            });
            res.json({ ok: true, block: true });
          }
        }

        res.json({
          ok: true,
          registe: true,
        });
      } ///로그인
      else {
        let TTXD = Math.random().toString(36).substring(2, 13);

        req.session.user = {
          id: userIdCheck.id,
          userId: userIdCheck.userId,
          role: userIdCheck.role,
          lv: userIdCheck.lv,
          TTXD: TTXD,
          nickName: userIdCheck.nickName,
        };

        // 로그인 보너스 및 로그 처리
        let loginBonusFilter = {};
        const setup = await client.moneySetup.findFirst({
          select: {
            LoginPointCheck: true,
            LoginPoint: true,
          },
        });

        if (setup?.LoginPointCheck) {
          //당일 로그인 체크
          const loginCheck = Boolean(
            await client.ipLog.findFirst({
              where: {
                category: "login",
                parisuserId: userIdCheck.id,
                status: true,
                createAt: {
                  gte: new Date(new Date().toLocaleDateString()),
                  lte: new Date(
                    new Date(new Date().toLocaleDateString()).setHours(24)
                  ),
                },
              },
            })
          );

          if (!loginCheck) {
            loginBonusFilter = {
              point: +userIdCheck.point + +setup?.LoginPoint,
              pointLog: {
                create: {
                  type: "로그인 포인트 지급",
                  memo: "",
                  beforePoint: +userIdCheck.point,
                  point: +setup?.LoginPoint,
                  afterPoint: +userIdCheck.point + +setup?.LoginPoint,
                  confirmUser: "AUTO BOT",
                },
              },
            };
          }
        }

        // 사용자 정보 업데이트 (세션 토큰 포함)
        await client.parisuser.update({
          where: {
            id: +userIdCheck.id,
          },
          data: {
            ...loginBonusFilter,
            updateAt: new Date(),
            ip,
            session: TTXD,
            domain: req.headers.host ? req.headers.host : "unknown",
            device: viewport,
            lastPageAt: new Date(), // 마지막 활동 시간 업데이트
            IpLog: {
              create: {
                category: "login",
                ip,
                contry_code: country,
                state: city,
                domain: req.headers.host ? req.headers.host : "unknown",
                device: viewport,
                status: true,
                memo: "로그인 성공",
              },
            },
          },
        });

        // 세션 저장 (확실히 저장되도록 처리)
        await req.session.save();

        // 세션 저장 확인을 위한 추가 대기
        await new Promise((resolve) => setTimeout(resolve, 50));

        // 로그인 성공 응답
        res.json({
          ok: true,
          loginok: true,
          bonus: {
            ok: false,
            message: "",
          },
        });
      }
    }
    //패스워드 불일치
    else {
      await client.ipLog.create({
        data: {
          ip,
          contry_code: country,
          state: city,
          domain: req.headers.host ? req.headers.host : "unknown",
          device: viewport,
          status: false,
          memo: `${userId} 로그인 시도, 패스워드 불일치`,
          category: "login",
        },
      });
      ///아이피 블럭 체크
      const ipblock = await client.basicSetup.findFirst({
        select: {
          userIpAutoBlock: true,
          userIpAutoBlockNum: true,
          userIpBlock: true,
        },
      });

      if (ipblock?.userIpBlock && ipblock?.userIpAutoBlock) {
        const now = new Date();
        const lastlogin = await client.ipLog.findFirst({
          where: {
            status: true,
            ip,
            category: "login",
          },
          orderBy: { createAt: "desc" },
        });

        const faildCount = await client.ipLog.aggregate({
          where: {
            ip,
            status: false,
            category: "login",

            createAt: {
              gte: new Date(now.setDate(now.getDate() - 1)),
              lte: new Date(),
            },
          },
          _count: true,
          // cursor: { id: lastlogin?.id },
        });
        if (faildCount._count >= ipblock.userIpAutoBlockNum) {
          await client.ipblock.upsert({
            where: {
              ip,
            },
            update: {},
            create: {
              ip,
              memo: `${faildCount._count} 회 로그인 실패`,
              confirmUser: "AUTO BOT",
            },
          });
          return res.json({ ok: true, block: true });
        }
      }

      res.json({
        ok: true,
        passwordCheck: true,
      });
    }
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
