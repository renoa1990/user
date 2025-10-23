import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import client from "@libs/server/client";
import { withAipSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { page, rowPerPage },
    session: { user },
  } = req;

  const listcount = await client.contact.aggregate({
    where: {
      parisuserId: user?.id,
      userDelete: false,
      createAt: {
        gte: new Date(+new Date() - 1209600000), //14일
        lte: new Date(),
      },
    },
    _count: true,
  });

  if (listcount._count > 0) {
    const lastId = await client.contact.findFirst({
      where: {
        parisuserId: user?.id,
        userDelete: false,
        createAt: {
          gte: new Date(+new Date() - 1209600000), //14일
          lte: new Date(),
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });

    const list = await client.contact.findMany({
      where: {
        parisuserId: user?.id,
        userDelete: false,
        createAt: {
          gte: new Date(+new Date() - 1209600000), //14일
          lte: new Date(),
        },
      },
      take: rowPerPage ? +rowPerPage : 10,
      skip: page && rowPerPage ? (+page - 1) * +rowPerPage : 0,
      cursor: { id: lastId?.id },

      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        title: true,
        text: true,
        createAt: true,
        updateAt: true,
        adminTitle: true,
        adminText: true,
        userCheck: true,
        Parisuser: {
          select: { nickName: true },
        },
      },
    });
    res.json({
      ok: true,
      listcount,
      list,
    });
  } else {
    res.json({
      ok: true,
      listcount,
      list: [],
    });
  }
}

export default withAipSession(
  withHandler({
    methods: ["GET"],
    handler,
  })
);
