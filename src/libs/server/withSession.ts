import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

const cookieConfig = {
  cookieName: "babel",
  password: process.env.COOKIE_PASSWORD!,
  cookieOptions: {
    maxAge: 60 * 30,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true, // XSS 공격 방어
    sameSite: "lax" as const, // CSRF 공격 방어
    path: "/", // 쿠키 경로
  },
};

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: number;
      userId: string;
      role: string;
      lv: string;
      TTXD: string;
      nickName: string;
    };
  }
}

export function withAipSession(fn: any) {
  return withIronSessionApiRoute(async (req, res) => {
    // 세션이 존재하면(로그인 상태) 요청 시마다 갱신하여 idle 타이머 연장
    if (req.session?.user) {
      await req.session.save();
    }
    return fn(req, res);
  }, cookieConfig);
}

export function withSsrSession(handler: any) {
  return withIronSessionSsr(async (ctx: any) => {
    // 세션이 존재하면(로그인 상태) 페이지 접근 시마다 갱신하여 idle 타이머 연장
    if (ctx.req?.session?.user) {
      await ctx.req.session.save();
    }
    return handler(ctx);
  }, cookieConfig);
}
