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

        const session = db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId);

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

        const posts = db.prepare("SELECT * FROM posts WHERE userId = ? ORDER BY createdAt DESC").all(user.id);

        for (const post of posts) {
            post.likeCount = likesMap[post.id] || 0;
            post.commentCount = commentsMap[post.id] || 0;
            post.likedByUser = likedByUserMap[post.id] == true;

            post.comments = db
                .prepare("SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC")
                .all(post.id);
        }

        const currentUser = db.prepare("SELECT username FROM users WHERE id = ?").get(session.userId);

        const followerCount = db.prepare("SELECT COUNT(*) as count FROM followers WHERE followingId = ?").get(user.username);
        const followedByUser = db.prepare("SELECT * FROM followers WHERE followerId = ? AND followingId = ?").get(currentUser.username, username);

        user.followerCount = followerCount?.count || 0;
        user.followedByUser = followedByUser != null;

        return NextResponse.json(
            { posts, user, session: { username: currentUser.username } },
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