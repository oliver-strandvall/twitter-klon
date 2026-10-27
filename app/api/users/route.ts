import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, name, password } = body || {};

    if (username.length < 2 || name.length < 2 || password.length < 2) {
      return NextResponse.json(
        { error: "Content missing or too short" },
        { status: 400 }
      );
    }

    if(username.length > 15 || name.length > 15) {
      return NextResponse.json(
        { error: "Content too long" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        "INSERT INTO users (name, username, password) VALUES (?, ?, ?)"
      )
      .run(name, username, password);

    return NextResponse.json(
      { id: result.lastInsertROWID, username, name },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || "Server error" },
      { status: 500 }
    );
  }
}