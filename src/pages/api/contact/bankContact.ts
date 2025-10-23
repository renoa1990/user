import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

/**
 * 계좌 문의 API
 * - 자동발급(auto_Bank=true): 개인계좌 > 레벨별 계좌 > 수동문의 순으로 처리
 * - 수동문의(auto_Bank=false): 관리자 답변 대기
 */
async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    session: { user },
  } = req;

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "인증이 필요합니다.",
    });
  }

  try {
    // 1. 사용자 정보 조회
    const userData = await client.parisuser.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        auto_Bank: true,
        persnalBank: true,
        levelStup: {
          select: { bank: true },
        },
      },
    });

    if (!userData) {
      return res.json({
        ok: false,
        message: "사용자 정보를 찾을 수 없습니다.",
        variant: "error",
      });
    }

    // 2. 중복 문의 체크 (답변 대기중인 계좌문의가 있는지)
    const hasPendingRequest = await client.contact.findFirst({
      where: {
        parisuserId: userData.id,
        title: "계좌문의 요청이 접수되었습니다.",
        updateAt: null, // 답변이 없는 경우
      },
    });

    if (hasPendingRequest) {
      return res.json({
        ok: false,
        message: "답변 대기중인 계좌문의가 있습니다.",
        variant: "info",
      });
    }

    // 3. 자동 발급 여부에 따른 처리
    if (userData.auto_Bank) {
      // 3-1. 개인 전용 계좌가 있는 경우
      if (userData.persnalBank && userData.persnalBank.length > 4) {
        await createContactWithBank(
          userData.id,
          userData.persnalBank,
          "전용계좌",
          "자동안내"
        );
        return res.json({
          ok: true,
          variant: "success",
          message: "계좌문의 요청이 접수되었습니다.",
        });
      }

      // 3-2. 레벨별 계좌 체크
      const bankSetup = await client.moneySetup.findFirst({
        select: { bankSetup: true },
      });

      if (
        bankSetup?.bankSetup &&
        userData.levelStup?.bank &&
        userData.levelStup.bank.length > 4
      ) {
        await createContactWithBank(
          userData.id,
          userData.levelStup.bank,
          "레벨별 계좌",
          "자동안내"
        );
        return res.json({
          ok: true,
          variant: "success",
          message: "계좌문의 요청이 접수되었습니다.",
        });
      }
    }

    // 4. 수동 문의 처리 (자동 발급 실패 또는 비활성화)
    await createManualContact(userData.id);
    return res.json({
      ok: true,
      variant: "success",
      message: "계좌문의 요청이 접수되었습니다.",
    });
  } catch (error) {
    console.error("계좌문의 처리 중 오류:", error);
    return res.status(500).json({
      ok: false,
      message: "계좌문의 처리 중 오류가 발생했습니다.",
      variant: "error",
    });
  }
}

/**
 * 자동 계좌 안내 생성 (트랜잭션)
 */
async function createContactWithBank(
  userId: number,
  bankInfo: string,
  bankType: string,
  answerType: string
) {
  await client.$transaction([
    client.contact.create({
      data: {
        parisuserId: userId,
        title: "계좌문의 요청이 접수되었습니다.",
        text: "계좌문의 요청이 접수되었습니다.",
        adminText: `<p>입금계좌 안내해 드립니다</p><p><br></p><p><br></p><p><strong>${bankInfo}</strong></p>`,
        adminTitle: "입금계좌안내",
        updateAt: new Date(),
      },
    }),
    client.bankLog.create({
      data: {
        parisuserId: userId,
        answer: answerType,
        type: bankType,
        bank: bankInfo,
      },
    }),
  ]);
}

/**
 * 수동 문의 생성 (트랜잭션)
 */
async function createManualContact(userId: number) {
  await client.$transaction([
    client.contact.create({
      data: {
        parisuserId: userId,
        title: "계좌문의 요청이 접수되었습니다.",
        text: "계좌문의 요청이 접수되었습니다.",
      },
    }),
    client.bankLog.create({
      data: {
        parisuserId: userId,
        answer: "수동문의",
      },
    }),
  ]);
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
