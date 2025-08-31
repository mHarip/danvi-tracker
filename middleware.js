import {NextResponse} from "next/server";

export function middleware(req) {
    const url = req.nextUrl;

    // allow login + api
    if (url.pathname.startsWith("/login") || url.pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // check cookie
    const authed = req.cookies.get("authed")?.value;
    if (authed === "true") {
        return NextResponse.next();
    }

    // redirect if not authed
    return NextResponse.redirect(new URL("/login", req.url));
}