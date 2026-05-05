import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function POST(request: Request, 
  { params }: RouteContext<'/api/users/[username]/follow'>
  ) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const { username } = await params;
    const createdAt = new Date().getTime()

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const sessionId = sessionCookie.value;

    const db = getDb();
    const session = db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

    if(!session) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    if(!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId);

    if(!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    if (username === user.username) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = db.prepare("SELECT * FROM followers WHERE followerId = ? AND followingId = ?").get(user.username, username);

    if (existingFollow) {
        return NextResponse.json(
            { error: "Already following this user" },
            { status: 400 }
        );
    }
    
    db.prepare("INSERT INTO followers (followerId, followingId, createdAt) VALUES (?, ?, ?)").run(user.username, username, createdAt);

    return NextResponse.json(
        { message: "User followed" },
        { status: 200 }
    );

    } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      { error: (err as Error)?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, 
  { params }: RouteContext<'/api/users/[username]/follow'>
  ) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session");
    const { username } = await params;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const sessionId = sessionCookie.value;

    const db = getDb();
    const session = db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

    if(!session) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId);

    if(!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    const existingFollow = db.prepare("SELECT * FROM followers WHERE followerId = ? AND followingId = ?").get(user.username, username);

    if (!existingFollow) {
        return NextResponse.json(
            { error: "Follow not found" },
            { status: 404 }
        );
    }

    db.prepare("DELETE FROM followers WHERE followerId = ? AND followingId = ?").run(user.username, username);
    return NextResponse.json(
        { message: "User unfollowed" },
        { status: 200 }
    );

  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      { error: (err as Error)?.message || "Server error" },
      { status: 500 }
    );
  }
}