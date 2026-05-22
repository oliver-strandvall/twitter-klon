"use client"

import { use, useState, useEffect } from "react";
import { HiHome } from "react-icons/hi";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; username: string; name: string; followedByUser: boolean; followerCount: number, followingCount: number } | null>(null);
  const [followingUsers, setFollowingUsers] = useState<{ id: number; username: string; name: string }[] | []>([]);
  const [session, setSession] = useState<{ username: string; name: string; id: number } | null>(null);
  const [update, setUpdate] = useState(false);
  const username = use(params).username;

  async function load() {
    const res = await fetch("/api/users/" + username + "/following");
    if (!res.ok) return;
    const json = await res.json();
    setUser(json.user);
    setFollowingUsers(json.followingUsers);
    setSession(json.session);
  }

  async function handleProfile() {
    router.push(`/users/${username}`);
  }

  useEffect(() => {
    load();
  }, [update]);

    return (
    <div className="flex flex-col min-h-screen items-center bg-gray-800 text-white p-5">
      <div className="bg-gray-950 p-5 rounded-lg w-full flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row gap-2 items-center">
              <button onClick={() => router.push("/")} className="bg-gray-950 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10 cursor-pointer"><HiHome size={25} /></button>
              <h1 className="text-xl font-bold mt-1.5">{username} Following:</h1>
            </div>
            <p className="text-gray-500 text-sm">@{user?.name}</p>
          </div>
          <div className="w-full flex justify-between items-center bg-gray-900 p-5 rounded-lg">
            <div className="w-full flex flex-row gap-5 items-center">
              <button onClick={handleProfile} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25 cursor-pointer">Profile</button>
              <h1><a href={`/users/${username}/followers`} className="underline">Followers: {user?.followerCount}</a></h1>
              <h1><a href={`/users/${username}/following`} className="underline">Following: {user?.followingCount}</a></h1>
            </div>
          </div>
        </div>
      </div>
        <div className="w-full m-5 flex flex-col gap-5 rounded-lg">
        {followingUsers.map((user) => (
            <div key={user.id} className="bg-gray-900 p-5 rounded-lg">
            <div className="flex justify-between items-center">
            <div className="flex flex-col flex-wrap gap-2">
                <div>
                    <h1><a href={`/users/${user.username}`} className="underline">{user.username}</a></h1>
                    <p className="text-gray-500 text-sm">@{user.name}</p>
                </div>
            </div>
            </div>
            </div>
        ))}
        </div>
    </div>
  )
}