import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function GET(
    request: Request,
    { params }: RouteContext<'/api/users/[username]'>
    ) {
    try {
        const { username } = await params;
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session");
        if (!sessionCookie) return NextResponse.json(
            { error: "Not authenticated" }, 
            { status: 401 });
        const sessionId = sessionCookie.value;

        const db = getDb();

        const sessionRow = db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

        if(!sessionRow) {
            return NextResponse.json(
                { error: "Invalid user" },
                { status: 401 }
            );
        }

        const session = db.prepare("SELECT id, username, name FROM users WHERE id = ?").get(sessionRow.userId);

        if(!session) {
            return NextResponse.json(
                { error: "Invalid user" },
                { status: 401 }
            );
        }

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const likesCounts = db.prepare("SELECT postId, COUNT(*) as count FROM likes GROUP BY postId").all();
        const likedByUser = db.prepare("SELECT postId FROM likes WHERE userId = ?").all(session.id);
        const likesMap: Record<number, number> = {};

        for (const like of likesCounts) {
            likesMap[like.postId] = like.count;
        }

        const posts = db.prepare("SELECT * FROM posts WHERE userName = ? ORDER BY createdAt DESC").all(username);

        for (const post of posts) {
            post.likeCount = likesMap[post.id] || 0;
            post.likedByUser = likedByUser.some((like: { postId: number }) => like.postId === post.id);
        }

        return NextResponse.json(
            { posts, user, session },
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