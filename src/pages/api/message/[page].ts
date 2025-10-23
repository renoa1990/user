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

  const listcount = await client.message.aggregate({
    where: {
      parisuserId: user?.id,
      userDelete: false,
    },
    _count: true,
  });

  if (listcount._count > 0) {
    const lastId = await client.message.findFirst({
      where: {
        parisuserId: user?.id,
        userDelete: false,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });

    const list = await client.message.findMany({
      where: {
        parisuserId: user?.id,
        userDelete: false,
      },
      take: rowPerPage ? +rowPerPage : 10,
      skip: page && rowPerPage ? (+page - 1) * +rowPerPage : 0,
      cursor: { id: lastId?.id },
      select: {
        id: true,
        title: true,
        text: true,
        createAt: true,
        updateAt: true,
        userCheck: true,
      },
      orderBy: {
        id: "desc",
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
