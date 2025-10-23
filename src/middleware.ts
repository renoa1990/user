import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/images") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return;
  }
  const { device } = userAgent(req);
  const viewport = device.type === "mobile" ? "M" : "PC";
  url.searchParams.set("viewport", viewport);
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/register") ||
    req.nextUrl.pathname === "/code"
  ) {
    return NextResponse.rewrite(url);
  } else {
    let cookie = req.cookies.get("babel");
    if (!cookie) {
      return NextResponse.redirect(new URL("/", req.url));
    } else {
      return NextResponse.rewrite(url);
    }
  }
}
