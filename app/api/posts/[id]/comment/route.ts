import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function POST(request: Request, 
  { params }: RouteContext<'/api/posts/[id]/comment'>
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

    const body = await request.json();
    const { content } = body;
    const createdAt = new Date().getTime()

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

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId);
    if(!user) {
      return NextResponse.json(
        { error: "Invalid user" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    
    db.prepare("INSERT INTO comments (content, userId, postId, createdAt, username) VALUES (?, ?, ?, ?, ?)").run(content, userId, id, createdAt, user.username);
    return NextResponse.json(
        { message: "Comment added" },
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

export async function GET(request: Request) {
  try {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const sessionId = sessionCookie.value;

  const db = getDb();
  const session = await db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

  if(!session) {
    return NextResponse.json(
      { error: "Invalid user" },
      { status: 401 }
    );
  }

  const comments = db.prepare("SELECT * FROM comments ORDER BY createdAt ASC").all();

  return NextResponse.json(
    { comments },
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
  { params }: RouteContext<'/api/posts/[id]/comment'>
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

    const result = db.prepare("DELETE FROM comments WHERE id = ? AND userId = ?").run(id, session.userId);

    if(result.changes === 0) {
      return NextResponse.json(
        { error: "Comment not found or you don't have permission to delete this comment" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Comment deleted with ID: " + id },
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