"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import CommentForm from "./commentForm";
import Post from "./Post";
import PostForm from "./PostForm";

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
  const [feed, setFeed] = useState<typeof data>([]); 
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showForYou, setShowForYou] = useState(true);

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

  async function getFeed() {
    const res = await fetch("/api/feed");
    if (res.ok) {
      const json = await res.json();
      setFeed(json.feed);
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
      getFeed();
  }, [update]);

  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-800 text-white p-5">
      <div className="w-full flex flex-col gap-5 rounded-lg">
      <div onClick={() => setShowForYou(!showForYou)} className="bg-gray-950 p-5 rounded-lg w-full cursor-pointer">
        <div className="w-full flex justify-between items-center">
          <h1>For You:</h1>
          {!showForYou ? <p>▼</p> : <p>▲</p>}
        </div>
      </div>
      {showForYou && feed.map((post) => (
        <Post key={post.id} post={post} session={session} showComments={showComments} setshowComments={setshowComments} likePost={likePost} unlikePost={unlikePost} handleDelete={handleDelete} handleCommentSubmit={handleCommentSubmit} handleDeleteComment={handleDeleteComment} />
      ))}
      {feed.length === 0 && (
        <div className="p-5 rounded-lg w-full text-center">
          <h1>No posts to show. Follow some users to see their posts here!</h1>
        </div>
      )}
      <div onClick={() => setShowAllPosts(!showAllPosts)} className="bg-gray-950 p-5 rounded-lg w-full cursor-pointer mt-5">
        <div className="w-full flex justify-between items-center">
          <h1>All Posts:</h1>
          {!showAllPosts ? <p>▼</p> : <p>▲</p>}
        </div>
      </div>
      {showAllPosts && data.map((post) => (
        <Post key={post.id} post={post} session={session} showComments={showComments} setshowComments={setshowComments} likePost={likePost} unlikePost={unlikePost} handleDelete={handleDelete} handleCommentSubmit={handleCommentSubmit} handleDeleteComment={handleDeleteComment} />
      ))}
      <PostForm handleSubmit={handleSubmit} message={message} setMessage={setMessage} />
      <div className="items-center flex justify-between bg-gray-950 w-full p-5 rounded-lg">
          <button onClick={handleProfile} className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-25 cursor-pointer">Profile</button>
          <p>Logged In As: {session.username}</p>
          <button onClick={handleLogout} className="bg-red-800 hover:bg-red-700 active:bg-red-600 text-white p-3 rounded-lg w-25 cursor-pointer">Logout</button>
      </div>
      </div>
    </div>
  );
}
