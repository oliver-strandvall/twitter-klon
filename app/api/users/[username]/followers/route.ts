import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { cookies } from 'next/headers'

export async function GET(
    request: Request,
    { params }: RouteContext<'/api/users/[username]/followers'>
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

        const followers = db.prepare("SELECT * FROM users WHERE username IN (SELECT followerId FROM followers WHERE followingId = ?)").all(user.username);

        const currentUser = db.prepare("SELECT username FROM users WHERE id = ?").get(session.userId);

        const followerCount = db.prepare("SELECT COUNT(*) as count FROM followers WHERE followingId = ?").get(user.username);
        const followedByUser = db.prepare("SELECT * FROM followers WHERE followerId = ? AND followingId = ?").get(currentUser.username, username);
        const followingCount = db.prepare("SELECT COUNT(*) as count FROM followers WHERE followerId = ?").get(user.username);

        user.followerCount = followerCount?.count || 0;
        user.followingCount = followingCount?.count || 0;
        user.followedByUser = followedByUser != null;

        console.log(user);
        return NextResponse.json(
            { followers, user, session: { username: currentUser.username } },
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