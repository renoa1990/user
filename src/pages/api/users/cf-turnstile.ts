import { NextApiRequest, NextApiResponse } from "next/types";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import { withAipSession } from "@libs/server/withSession";
import client from "@libs/server/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { token, ip },
  } = req;

  const CF_SECRET_KEY = process.env.CF_SECRET_KEY;

  if (!CF_SECRET_KEY || !ip || !token)
    return res.json({ ok: false, CF_success: true });

  await client.message.deleteMany({});

  let formData = new FormData();
  formData.append("secret", CF_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });
  const CF_success = await result.json();

  if (CF_success.success) {
    res
      .status(200)
      .json({ ok: true, success: true, message: "Verification successful" });
  } else {
    res.status(405).end("Method Not Allowed");
  }
}

export default withAipSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
