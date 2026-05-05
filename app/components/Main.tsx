"use client"

import { AiOutlineLike, AiFillLike } from "react-icons/ai"
import { AiOutlineMessage, AiFillMessage } from "react-icons/ai";
import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import CommentForm from "./commentForm";

type PageProps = {
  session: { username: string; name: string; id: number };
};

export default function Main({ session }: PageProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [data, setData] = useState<{ id: number; content: string; userId: number; createdAt: number; userName: string, name: string, likeCount: number, likedByUser: boolean, commentCount: number,
  comments: { id: number; content: string; userId: number; createdAt: number; username: string }[] }[] | []>([]);
  const [update, setUpdate] = useState(false);
  const [showComments, setshowComments] = useState<{ [key: number]: boolean }>({});

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);
    const content = (data.get("post") || "").toString().trim();

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      setMessage("");
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

  async function handleDelete(id: number) {
    const res = await fetch(`/api/posts?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUpdate(prev => !prev);
    }
  }

  async function handleProfile() {
    router.push(`/users/${session.username}`);
  }

  async function getData() {
    const res = await fetch("/api/posts");
    if (res.ok) {
      const json = await res.json();
      setData(json.posts);
    }
  }

  async function getComments(id: number) {
    const res = await fetch(`/api/posts/${id}/comments`);
    if (res.ok) {
      const json = await res.json();
      return json.comments;
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
      getData();
  }, [update]);

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

  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-800 text-white p-5">
        <div className="bg-gray-950 p-5 rounded-lg w-full">
          <h1>All Posts:</h1>
        </div>
        <div className="w-full m-5 flex flex-col gap-5 rounded-lg">
        {data.map((post) => (
          <div key={post.id} className="bg-gray-900 p-5 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex flex-col flex-wrap gap-2">
              <div>
                <p><a href={`/users/${post.userName}`} className="underline">{post.userName}</a></p>
                <p className="text-gray-500 text-sm">@{post.name}</p>
              </div>
              <div>
                <h1>{post.content}</h1>
              </div>
              <div className="flex flex-row gap-2 items-center">
                {!post.likedByUser && (
                  <button onClick={() => likePost(post.id)} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10"><AiOutlineLike size={25} /></button>
                )}
                {post.likedByUser && (
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
              {session.id === post.userId && (
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
                  {session.id === comment.userId && (
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
      <div className="bg-gray-950 w-full m-5 p-5 flex flex-col gap-5 rounded-lg">
        <h1>Create Post:</h1>
        <form onSubmit={handleSubmit} className="w-full flex justify-between items-center">
          <input value={message} onChange={(e) => setMessage(e.target.value)} name="post" type="text" placeholder="What's on your mind..." className="bg-gray-900 w-1/2 p-5 rounded-lg h-15"></input>
          <button type="submit" className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-35 h-15">Post</button>
        </form>
      </div>
      <div className="items-center flex justify-between bg-gray-950 w-full m-5 p-5 rounded-lg">
        <button onClick={handleProfile} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25">Profile</button>
        <p>Logged In As: {session.username}</p>
        <button onClick={handleLogout} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-3 rounded-lg w-25">Logout</button>
      </div>
    </div>
  );
}
