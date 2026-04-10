import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  const db = await getDb();

  if (sessionCookie) {
    await db.prepare("DELETE FROM sessions WHERE sessionId = ?", [sessionCookie]);
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}