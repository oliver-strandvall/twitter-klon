"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import CommentForm from "./commentForm";
import Post from "./Post";

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
      getFeed();
  }, [update]);

  return (
    <div className="flex flex-col min-h-screen items-center bg-gray-800 text-white p-5">
      <div className="w-full m-5 flex flex-col gap-5 rounded-lg">
      <div className="bg-gray-950 p-5 rounded-lg w-full">
        <h1>For You:</h1>
      </div>
      {feed.map((post) => (
        <Post key={post.id} post={post} session={session} showComments={showComments} setshowComments={setshowComments} likePost={likePost} unlikePost={unlikePost} handleDelete={handleDelete} handleCommentSubmit={handleCommentSubmit} handleDeleteComment={handleDeleteComment} />
      ))}
      <div onClick={() => setShowAllPosts(!showAllPosts)} className="bg-gray-950 p-5 rounded-lg w-full cursor-pointer">
        <h1>All Posts:</h1>
      </div>
      {showAllPosts && data.map((post) => (
        <Post key={post.id} post={post} session={session} showComments={showComments} setshowComments={setshowComments} likePost={likePost} unlikePost={unlikePost} handleDelete={handleDelete} handleCommentSubmit={handleCommentSubmit} handleDeleteComment={handleDeleteComment} />
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
