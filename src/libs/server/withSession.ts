import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

const cookieConfig = {
  cookieName: "babel",
  password: process.env.COOKIE_PASSWORD!,
  cookieOptions: {
    maxAge: 60 * 30, // 30분 (1800초)
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
    lastSave?: number; // Add lastSave to track last session save time
  }
}

export function withAipSession(fn: any) {
  return withIronSessionApiRoute(async (req, res) => {
    // 세션이 존재하면 5분마다만 갱신 (TTXD 변경 최소화)
    if (req.session?.user) {
      const now = Date.now();
      const lastSave = req.session.lastSave || 0;
      const fiveMinutes = 5 * 60 * 1000; // 5분

      if (now - lastSave > fiveMinutes) {
        await req.session.save();
        req.session.lastSave = now;
      }
    }
    return fn(req, res);
  }, cookieConfig);
}

export function withSsrSession(handler: any) {
  return withIronSessionSsr(async (ctx: any) => {
    // 세션이 존재하면 5분마다만 갱신 (TTXD 변경 최소화)
    if (ctx.req?.session?.user) {
      const now = Date.now();
      const lastSave = ctx.req.session.lastSave || 0;
      const fiveMinutes = 5 * 60 * 1000; // 5분

      if (now - lastSave > fiveMinutes) {
        await ctx.req.session.save();
        ctx.req.session.lastSave = now;
      }
    }
    return handler(ctx);
  }, cookieConfig);
}
