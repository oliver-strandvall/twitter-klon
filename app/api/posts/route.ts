import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function POST(request: Request) {
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

    const body = await request.json();
    const { content } = body;
    const createdAt = new Date().getTime()

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

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

    const userId = session.userId;
    const userName = user.username;
    const name = user.name;

    const result = db
      .prepare(
        "INSERT INTO posts (content, userId, createdAt, userName, name) VALUES (?, ?, ?, ?, ?)"
      )
      .run(content, userId, createdAt, userName, name);

    return NextResponse.json(
      { id: result.lastInsertRowid, content },
      { status: 201 }
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
  const session = db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

  if(!session) {
    return NextResponse.json(
      { error: "Invalid user" },
      { status: 401 }
    );
  }

  const likesCounts = db.prepare("SELECT postId, COUNT(*) as count FROM likes GROUP BY postId").all();
  const commentsCounts = db.prepare("SELECT postId, COUNT(*) as count FROM comments GROUP BY postId").all();
  const likedByUser = db.prepare("SELECT postId FROM likes WHERE userId = ?").all(session.userId);
  const likesMap: Record<number, number> = {};
  const commentsMap: Record<number, number> = {};
  const likedByUserMap: Record<number, boolean> = {};

  for (const like of likesCounts) {
    likesMap[like.postId] = like.count;
  }

  for (const comment of commentsCounts) {
    commentsMap[comment.postId] = comment.count;
  }

  for (const post of likedByUser) {
    likedByUserMap[post.postId] = true;
  }

  const posts = db.prepare("SELECT * FROM posts ORDER BY createdAt DESC").all();

  for (const post of posts) {
    post.likeCount = likesMap[post.id] || 0;
    post.commentCount = commentsMap[post.id] || 0;
    post.likedByUser = likedByUserMap[post.id] == true;

    post.comments = db
      .prepare("SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC")
      .all(post.id);
  }

  return NextResponse.json(
    { posts },
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

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session");

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
  
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    const result = db.prepare("DELETE FROM posts WHERE id = ? AND userId = ?").run(id, session.userId);
    if(result.changes === 0) {
      return NextResponse.json(
        { error: "Post not found or you don't have permission to delete this post" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Post deleted with ID: " + id },
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