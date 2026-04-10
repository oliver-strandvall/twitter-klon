import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { createId } from "@paralleldrive/cuid2";

export async function POST(request: Request) {
  const expiresAt = new Date().getTime() + 60 * 60 * 24 * 1000
  const { username, password } = await request.json();
  if (!username || !password) return NextResponse.json({ error: "username and password required" }, { status: 400 });

  const db = getDb();
  const user = db.prepare("SELECT id, name, username FROM users WHERE username = ? AND password = ?").get(username, password);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const sessionId = createId()

  const result = db
    .prepare(
      "INSERT INTO sessions (sessionId, userId, expiresAt) VALUES (?, ?, ?)"
    )
  .run(sessionId, user.id, expiresAt);

  const res = NextResponse.json({ user });
  res.cookies.set("session", sessionId, { path: "/", maxAge: 60 * 60 * 24});

  return res
}