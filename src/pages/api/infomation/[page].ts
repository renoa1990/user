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

  const listcount = await client.infomation.aggregate({
    where: {
      open: true,
    },
    orderBy: { id: "desc" },
    _count: true,
  });

  if (listcount._count > 0) {
    const lastId = await client.infomation.findFirst({
      where: {
        open: true,
      },
      orderBy: { id: "desc" },

      select: {
        id: true,
      },
    });

    const [list, adminName] = await Promise.all([
      client.infomation.findMany({
        where: {
          open: true,
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
        },
      }),
      client.basicSetup.findFirst({
        select: {
          adminNickname: true,
        },
      }),
    ]);

    res.json({
      ok: true,
      listcount,
      list,
      adminName: adminName?.adminNickname,
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
