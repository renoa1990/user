import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { title, text },
    session: { user },
  } = req;

  const userData = await client.parisuser.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      id: true,
      contact_block: true,
    },
  });
  if (userData && !userData.contact_block) {
    const writeCheck = Boolean(
      await client.contact.findFirst({
        where: {
          parisuserId: user?.id,
          updateAt: null,
        },
      })
    );
    if (writeCheck) {
      res.json({
        ok: true,
        message: "답변 대기중인 게시물이 있습니다.",
      });
    } else {
      const contact = Boolean(
        await client.contact.create({
          data: {
            title,
            text,
            parisuserId: userData?.id,
          },
        })
      );
      res.json({
        ok: true,
        contact,
      });
    }
  } else {
    res.json({
      ok: true,
      message: "게시물 작성이 금지된 회원입니다.",
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
  })
);
