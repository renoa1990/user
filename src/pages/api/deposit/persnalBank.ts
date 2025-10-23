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
    body: { id },
  } = req;
  if (!user) return;

  const userData = await client.parisuser.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      id: true,
      auto_Bank: true,
      persnalBank: true,
      levelStup: {
        select: { bank: true },
      },
    },
  });

  if (userData) {
    if (userData.auto_Bank) {
      if (userData?.persnalBank && userData?.persnalBank.length > 4) {
        await client.bankLog.create({
          data: {
            parisuserId: userData.id,
            answer: "자동안내",
            type: "전용계좌",
            bank: userData?.persnalBank,
          },
        });
        return res.json({
          ok: true,
          persnalBank: userData?.persnalBank,
        });
      } else {
        const bankSetup = await client.moneySetup.findFirst({
          select: {
            bankSetup: true,
          },
        });
        if (
          bankSetup?.bankSetup &&
          userData?.levelStup?.bank &&
          userData?.levelStup?.bank.length > 4
        ) {
          await client.bankLog.create({
            data: {
              parisuserId: userData.id,
              answer: "자동안내",
              type: "레벨별 계좌",
              bank: userData?.levelStup?.bank,
            },
          });
          return res.json({
            ok: true,
            persnalBank: userData?.levelStup?.bank,
          });
        } else {
          const writeCheck = Boolean(
            (await client.contact.findFirst({
              where: {
                parisuserId: userData.id,
                title: "계좌문의 요청이 접수되었습니다.",
                updateAt: null,
              },
            })) &&
              (await client.bankLog.create({
                data: {
                  parisuserId: userData.id,
                  answer: "수동문의",
                },
              }))
          );

          if (!writeCheck) {
            const write = Boolean(
              (await client.contact.create({
                data: {
                  parisuserId: user?.id,
                  title: "계좌문의 요청이 접수되었습니다.",
                  text: "계좌문의 요청이 접수되었습니다.",
                },
              })) &&
                (await client.bankLog.create({
                  data: {
                    parisuserId: userData.id,
                    answer: "수동문의",
                  },
                }))
            );
            return res.json({
              ok: true,
              write,
            });
          } else {
            return res.json({
              ok: true,
              notWrite: true,
            });
          }
        }
      }
    } else {
      const writeCheck = Boolean(
        (await client.contact.findFirst({
          where: {
            parisuserId: userData.id,
            title: "계좌문의 요청이 접수되었습니다.",
            updateAt: null,
          },
        })) &&
          (await client.bankLog.create({
            data: {
              parisuserId: userData.id,
              answer: "수동문의",
            },
          }))
      );
      if (!writeCheck) {
        const write = Boolean(
          (await client.contact.create({
            data: {
              parisuserId: user?.id,
              title: "계좌문의 요청이 접수되었습니다.",
              text: "계좌문의 요청이 접수되었습니다.",
            },
          })) &&
            (await client.bankLog.create({
              data: {
                parisuserId: userData.id,
                answer: "수동문의",
              },
            }))
        );
        return res.json({
          ok: true,
          write,
        });
      } else {
        return res.json({
          ok: true,
          notWrite: true,
        });
      }
    }
  } else {
    return res.json({
      ok: false,
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
