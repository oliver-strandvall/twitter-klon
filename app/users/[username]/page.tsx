"use client"

import { AiOutlineLike, AiFillLike } from "react-icons/ai"
import { use, useEffect, useState } from "react";

type PageProps = Promise<{ username: string }>

export default function UserPage({ params }: PageProps) {
  const [data, setData] = useState<{ id: number; content: string; userId: number; createdAt: number; userName: string, name: string, likeCount: number, likedByUser: boolean }[] | []>([]);
  const [user, setUser] = useState<{ id: number; username: string; name: string } | null>(null);
  const [session, setSession] = useState<{ username: string; name: string; id: number } | null>(null);
  const [update, setUpdate] = useState(false);
  const username = use(params).username;

  function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7)
    if(days < 30) return `${weeks}w ago`;

    const months = Math.floor(days / 30)
    if(days < 365) return `${months}mo ago`;

    const years = Math.floor(days / 365)
    return `${years}y ago`;
  }

  async function load() {
    const res = await fetch("/api/users/" + username);
    if (!res.ok) return;
    const json = await res.json();
    setData(json.posts || []);
    setUser(json.user)
    setSession(json.session)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/posts?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

    async function likePost(id: number) {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "POST",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

  async function unlikePost(id: number) {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

  useEffect(() => {
    load();
  }, [update]);

  return(
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-800 text-white p-5">
      <div className="bg-gray-950 p-5 rounded-lg w-full flex flex-row justify-between">
        <h1>{username}'s Posts:</h1>
        <h1>@{user?.name || username}</h1>
      </div>
      <div className="w-full m-5 flex flex-col gap-5 rounded-lg">
      {data.map((post) => (
          <div key={post.id} className="bg-gray-900 p-5 rounded-lg flex justify-between items-center">
            <div className="flex flex-col flex-wrap gap-2">
              <h1>{post.content}</h1>
              <div className="flex flex-row gap-2 items-center">
                {!post.likedByUser && (
                  <button onClick={() => likePost(post.id)} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10"><AiOutlineLike size={25} /></button>
                )}
                {post.likedByUser && (
                  <button onClick={() => unlikePost(post.id)} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10"><AiFillLike size={25} /></button>
                )}
                <p className="mt-1.5">{post.likeCount}</p>
              </div>
            </div>
            <div className="flex justify-between gap-5 items-center">
              <p>{timeAgo(post.createdAt)}</p>
              {session?.id === post.userId && (
                <button onClick={() => handleDelete(post.id)} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-2 rounded-lg w-20 h-12">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}