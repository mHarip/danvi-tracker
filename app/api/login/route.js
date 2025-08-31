import {NextResponse} from "next/server";

export async function POST(req) {
    const form = await req.formData();
    const code = form.get("code");

    if (code === process.env.APP_PASSCODE) {
        const res = NextResponse.redirect(new URL("/", req.url));
        res.cookies.set("authed", "true", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24,
        });
        return res;
    }

    return NextResponse.json({error: "Unauthorized"}, {status: 401});
}