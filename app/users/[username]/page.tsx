"use client"

import { AiOutlineLike, AiFillLike } from "react-icons/ai"
import { AiOutlineMessage, AiFillMessage } from "react-icons/ai";
import { use, useEffect, useState } from "react";
import CommentForm from "@/app/components/commentForm";

type PageProps = {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: PageProps) {
  const [data, setData] = useState<{ id: number; content: string; userId: number; createdAt: number; userName: string, name: string, likeCount: number, likedByUser: boolean, commentCount: number,
  comments: { id: number; content: string; userId: number; createdAt: number; username: string }[] }[] | []>([]);
  const [user, setUser] = useState<{ id: number; username: string; name: string; followedByUser: boolean; followerCount: number } | null>(null);
  const [session, setSession] = useState<{ username: string; name: string; id: number } | null>(null);
  const [update, setUpdate] = useState(false);
  const [showComments, setshowComments] = useState<{ [key: number]: boolean }>({});
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

  async function handleCommentSubmit(content: string, id: number) {
    const res = await fetch(`/api/posts/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

  async function handleDeleteComment(id: number) {
    const res = await fetch(`/api/posts/${id}/comment`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
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

  useEffect(() => {
    load();
  }, [update]);

    return (
    <div className="flex flex-col min-h-screen items-center bg-gray-800 text-white p-5">
      <div className="bg-gray-950 p-5 rounded-lg w-full flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row justify-between w-full">
            <h1>{username}</h1>
            <p className="text-gray-500 text-sm">@{user?.name || username}</p>
          </div>
          <div className="flex flex-row gap-5 items-center bg-gray-900 p-5 rounded-lg">
          {username !== session?.username ? (
           !user?.followedByUser ? (
            <button onClick={handleFollow} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25">Follow</button>
          ) : (
            <button onClick={handleUnfollow} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-3 rounded-lg w-25">Unfollow</button>
          )
          ) : (
            <p>You Cant Follow Yourself</p>
          )}
          <h1>Followers: {user?.followerCount}</h1>
          </div>
        </div>
      </div>
        <div className="w-full m-5 flex flex-col gap-5 rounded-lg">
        {data.map((post) => (
          <div key={post.id} className="bg-gray-900 p-5 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex flex-col flex-wrap gap-2">
              <div>
                <h1>{post.content}</h1>
              </div>
              <div className="flex flex-row gap-2 items-center">
                {!post.likedByUser ? (
                  <button onClick={() => likePost(post.id)} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10"><AiOutlineLike size={25} /></button>
                ) : (
                  <button onClick={() => unlikePost(post.id)} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10"><AiFillLike size={25} /></button>
                )}
                <p className="mt-1.5">{post.likeCount}</p>
                {showComments[post.id] && (
                  <button onClick={() => setshowComments(prev => ({ ...prev, [post.id]: false }))} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10 ml-2"><AiFillMessage size={25} /></button>
                )}
                {!showComments[post.id] && (
                  <button onClick={() => setshowComments(prev => ({ ...prev, [post.id]: true }))} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10 ml-2"><AiOutlineMessage size={25} /></button>
                )}
                <p className="mt-1.5">{post.commentCount}</p>
              </div>
            </div>
            <div className="flex justify-between gap-5 items-center">
              <p>{timeAgo(post.createdAt)}</p>
              {session?.id === post.userId && (
                <button onClick={() => handleDelete(post.id)} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-2 rounded-lg w-20 h-12">Delete</button>
              )}
            </div>
            </div>
            {showComments[post.id] && (
            <>
            <CommentForm postId={post.id} onCommentSubmit={handleCommentSubmit} />
            {post.comments?.map((comment) => (
              <div key={comment.id} className="bg-gray-950 p-5 rounded-lg mt-5 flex justify-between items-center">
                <div className="flex justify-between gap-5 items-center">
                  <p><a href={`/users/${comment.username}`} className="underline">{comment.username}</a></p>
                  <p>{comment.content}</p>
                </div>
                <div className="flex justify-between gap-5 items-center">
                <p>{timeAgo(comment.createdAt)}</p>
                  {session?.id === comment.userId && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-2 rounded-lg w-20 h-12">Delete</button>
                  )}
                </div>
              </div>
            ))}
            </>
            )}
          </div>
        ))}
      </div>
      </div>
  )
}