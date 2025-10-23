import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";
import pwencoder from "@libs/server/pwencoder";
import { UserSetup } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: {
      data,
      devicedata: { country, city, viewport, ip },
    },
  } = req;

  const [userIdCheck, registerSetup, inviteCheck] = await Promise.all([
    client.parisuser.findMany({
      where: {
        OR: [
          { userId: data.userId },
          { nickName: data.nickName },
          { phone: data.phone },
          { bankName: data.bankName, bankNumber: data.bankNumber },
        ],
      },
      select: {
        userId: true,
        nickName: true,
        phone: true,
        bankName: true,
        bankNumber: true,
      },
    }),
    client.userSetup.findFirst({}),

    client.parisuser.findFirst({
      where: { userId: data.invite, role: "user" },
      select: { userId: true },
    }),
  ]);

  if (!data || !userIdCheck || !registerSetup)
    return res.json({ ok: true, message: `오류가 발생했습니다` });

  const valid = validate(userIdCheck, registerSetup, inviteCheck, data);

  if (valid.length > 0) return res.json({ ok: true, valid });

  const inviteFilter =
    data.invite && inviteCheck
      ? {
          invite: {
            create: {
              inviteUser: inviteCheck.userId,
            },
          },
        }
      : {};
  const registerConigFilter =
    registerSetup?.pointCheck && +registerSetup.point > 0
      ? {
          point: +registerSetup.point,
          pointLog: {
            create: {
              type: "신규회원 보너스",
              memo: "자동지급",
              beforePoint: 0,
              point: +registerSetup.point,
              afterPoint: +registerSetup.point,
              confirmUser: "AUTO BOT",
            },
          },
        }
      : {};

  const messageFilter =
    registerSetup?.registerMessage && registerSetup?.registerMessageTitle
      ? {
          message: {
            create: {
              title: registerSetup?.registerMessageTitle,
              text: registerSetup?.registerMessage,
            },
          },
        }
      : {};

  const create = Boolean(
    await client.parisuser.create({
      data: {
        userId: data.userId,
        nickName: data.nickName,
        password: pwencoder(data.password),
        bankName: data.bankName,
        bankNumber: data.bankNumber,
        name: data.name,
        birth: data.birth,
        phone: data.phone,
        createdevice: viewport,
        createdomain: req.headers.host || "unknown",
        createip: ip,
        createcity: city,
        createcoutry: country,
        bankPassword: data.bankPassword,
        activate: registerSetup?.autoConfirm === true ? "true" : "null",
        levelStup: {
          connect: {
            lv: registerSetup?.basicLv || "1",
          },
        },
        Code: {
          connect: {
            code: data.joinCode,
          },
        },
        ...registerConigFilter,
        ...inviteFilter,
        ...messageFilter,
      },
      select: {
        id: true,
      },
    })
  );

  res.json({ ok: true, create });
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);

const validate = (
  userIdCheck: {
    userId: string;
    nickName: string;
    phone: string | null;
    bankName: string | null;
    bankNumber: string | null;
  }[],
  registerSetup: UserSetup,
  inviteCheck: { userId: string } | null,
  data?: {
    userId: string;
    nickName: string;
    password: string;
    bankName: string;
    bankNumber: string;
    name: string;
    birth: string;
    phone: string;
    bankPassword: string;
    joinCode: string;
    invite: string;
  }
) => {
  const checkup: { message: string; type: string }[] = [];

  if (userIdCheck.some((item) => item.userId === data?.userId)) {
    //아이이디 중복
    checkup.push({ message: "사용할수 없는 아이디입니다", type: "userId" });
  }
  if (userIdCheck.some((item) => item.nickName === data?.nickName)) {
    //닉네임중복
    checkup.push({ message: "사용할수 없는 닉네임입니다", type: "nickName" });
  }

  if (registerSetup.duplicate) {
    if (
      registerSetup.phone &&
      userIdCheck.some((item) => item.phone === data?.phone)
    ) {
      //전화번호 중복
      checkup.push({ message: "사용할수 없는 전화번호입니다", type: "phone" });
    }
    if (
      registerSetup.bank &&
      userIdCheck.some(
        (item) =>
          item.bankName === data?.bankName &&
          item.bankNumber === data?.bankNumber
      )
    ) {
      //계좌번호 중복
      checkup.push({
        message: "사용할수 없는 계좌번호 입니다",
        type: "bankNumber",
      });
    }
  }
  if (data?.invite) {
    if (!inviteCheck) {
      checkup.push({
        message: "추천할수 없는 유저입니다",
        type: "invite",
      });
    }
    if (data?.invite === data.userId) {
      checkup.push({
        message: "내아이디를 추천할수 없습니다",
        type: "invite",
      });
    }
  }

  return checkup;
};
