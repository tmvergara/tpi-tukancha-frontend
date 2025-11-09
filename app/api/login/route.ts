import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    // Very simple mock: accept any non-empty email/password for demo purposes
    if (!email || !password) {
        return NextResponse.json({ message: "Email and password required" }, { status: 400 });
    }

    const token = "mock-token-123";

    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: "token", value: token, httpOnly: true, path: "/" });
    return res;
}
