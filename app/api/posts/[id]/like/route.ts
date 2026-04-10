import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function POST(request: Request, 
  { params }: RouteContext<'/api/posts/[id]/like'>
  ) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    const { id } = await params;

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

    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    const existingLike = db.prepare("SELECT * FROM likes WHERE userId = ? AND postId = ?").get(session.userId, id);

    if (existingLike) {
        return NextResponse.json(
            { error: "Post already liked" },
            { status: 400 }
        );
    }
    
    db.prepare("INSERT INTO likes (userId, postId) VALUES (?, ?)").run(session.userId, id);
    return NextResponse.json(
        { message: "Post liked" },
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
  { params }: RouteContext<'/api/posts/[id]/like'>
  ) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session");
    const { id } = await params;

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

    const existingLike = db.prepare("SELECT * FROM likes WHERE userId = ? AND postId = ?").get(session.userId, id);

    if (!existingLike) {
        return NextResponse.json(
            { error: "Like not found" },
            { status: 404 }
        );
    }

    db.prepare("DELETE FROM likes WHERE id = ?").run(existingLike.id);
    return NextResponse.json(
        { message: "Post unliked" },
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