"use client"

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default function UserPage({ params }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; username: string; name: string; followedByUser: boolean; followerCount: number, followingCount: number } | null>(null);
  const [followingUsers, setFollowingUsers] = useState<{ id: number; username: string; name: string }[] | []>([]);
  const [session, setSession] = useState<{ username: string; name: string; id: number } | null>(null);
  const [update, setUpdate] = useState(false);
  const username = use(params).username;

  async function load() {
    const res = await fetch("/api/users/" + username + "/followers");
    if (!res.ok) return;
    const json = await res.json();
    setUser(json.user);
    setFollowingUsers(json.followers);
    setSession(json.session);
  }

  async function handleFollow() {
    const res = await fetch(`/api/users/${username}/follow`, {
      method: "POST",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

  async function handleUnfollow() {
    const res = await fetch(`/api/users/${username}/follow`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
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
            <h1>{username} Followers:</h1>
            <p className="text-gray-500 text-sm">@{user?.name}</p>
          </div>
          <div className="w-full flex justify-between items-center bg-gray-900 p-5 rounded-lg">
            <div className="w-full flex flex-row gap-5 items-center">
              <h1><a href={`/users/${username}/followers`} className="underline">Followers: {user?.followerCount}</a></h1>
              <h1><a href={`/users/${username}/following`} className="underline">Following: {user?.followingCount}</a></h1>
              </div>
              <div>
                <button onClick={handleProfile} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25 cursor-pointer">Profile</button>
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
                  {/* {username !== session?.username ? (
                  !user?.followedByUser ? (
                      <button onClick={handleFollow} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25">Follow</button>
                  ) : (
                      <button onClick={handleUnfollow} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-3 rounded-lg w-25">Unfollow</button>
                  )
                  ) : (
                      <></>
                  )} */}
              </div>
          </div>
          </div>
          </div>
      ))}
      </div>
    </div>
  )
}