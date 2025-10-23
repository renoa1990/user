import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import { UserSetup } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { type, value },
  } = req;

  if (!type) {
    return res.json({ ok: false, message: "필수 파라미터가 누락되었습니다" });
  }

  // userSetup 조회
  const registerSetup = await client.userSetup.findFirst({});
  if (!registerSetup) {
    return res.json({ ok: false, message: "시스템 설정을 찾을 수 없습니다" });
  }

  let duplicateCheck = null;

  if (type === "userId") {
    if (!value) {
      return res.json({ ok: false, message: "아이디 값이 필요합니다" });
    }
    duplicateCheck = await client.parisuser.findFirst({
      where: { userId: value },
      select: { userId: true },
    });
  } else if (type === "nickName") {
    if (!value) {
      return res.json({ ok: false, message: "닉네임 값이 필요합니다" });
    }
    duplicateCheck = await client.parisuser.findFirst({
      where: { nickName: value },
      select: { nickName: true },
    });
  } else if (type === "phone") {
    if (!value) {
      return res.json({ ok: false, message: "휴대폰 번호 값이 필요합니다" });
    }
    // 휴대폰 번호 중복 검사는 duplicate가 true이고 phone이 true일 때만 수행
    if (registerSetup.duplicate && registerSetup.phone) {
      duplicateCheck = await client.parisuser.findFirst({
        where: { phone: value },
        select: { phone: true },
      });
    } else {
      // 중복 검사가 비활성화된 경우 중복이 없다고 처리
      duplicateCheck = null;
    }
  } else if (type === "bankAccount") {
    const { bankName, bankNumber } = req.body;
    if (!bankName || !bankNumber) {
      return res.json({
        ok: false,
        message: "은행명과 계좌번호 값이 필요합니다",
      });
    }
    // 계좌번호 중복 검사는 duplicate가 true이고 bank가 true일 때만 수행
    if (registerSetup.duplicate && registerSetup.bank) {
      duplicateCheck = await client.parisuser.findFirst({
        where: {
          bankName: bankName,
          bankNumber: bankNumber,
        },
        select: { bankName: true, bankNumber: true },
      });
    } else {
      // 중복 검사가 비활성화된 경우 중복이 없다고 처리
      duplicateCheck = null;
    }
  } else {
    return res.json({ ok: false, message: "잘못된 검사 타입입니다" });
  }

  const isDuplicate = !!duplicateCheck;

  let message = "";
  if (type === "userId") {
    message = isDuplicate
      ? "아이디가 이미 사용중입니다"
      : "아이디를 사용할 수 있습니다";
  } else if (type === "nickName") {
    message = isDuplicate
      ? "닉네임이 이미 사용중입니다"
      : "닉네임을 사용할 수 있습니다";
  } else if (type === "phone") {
    message = isDuplicate
      ? "휴대폰 번호가 이미 사용중입니다"
      : "휴대폰 번호를 사용할 수 있습니다";
  } else if (type === "bankAccount") {
    message = isDuplicate
      ? "계좌번호가 이미 사용중입니다"
      : "계좌번호를 사용할 수 있습니다";
  }

  res.json({
    ok: true,
    isDuplicate,
    message,
  });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
