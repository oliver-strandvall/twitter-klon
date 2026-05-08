import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

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

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId);

  if(!user) {
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

  const feed = db.prepare("SELECT * FROM posts WHERE userName IN (SELECT followingId FROM followers WHERE followerId = ?) ORDER BY createdAt DESC").all(user.username);

  for (const post of feed) {
    post.likeCount = likesMap[post.id] || 0;
    post.commentCount = commentsMap[post.id] || 0;
    post.likedByUser = likedByUserMap[post.id] == true;

    post.comments = db
      .prepare("SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC")
      .all(post.id);
  }

  return NextResponse.json(
    { feed },
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