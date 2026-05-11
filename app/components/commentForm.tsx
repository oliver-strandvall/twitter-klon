"use client"

import { useState, type FormEvent } from "react";

type CommentFormProps = {
  postId: number;
  onCommentSubmit: (content: string, postId: number) => Promise<void> | void;
};

export default function CommentForm({ postId, onCommentSubmit }: CommentFormProps) {
  const [comment, setComment] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = comment.trim();
    if (!content) return;

    await onCommentSubmit(content, postId);
    setComment("");
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex justify-between items-center mt-5">
      <input value={comment} onChange={(e) => setComment(e.target.value)} name="comment" type="text" placeholder="Add a comment..." className="bg-gray-950 w-1/2 p-5 rounded-lg h-15"/>
      <button type="submit" className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-35 h-15 cursor-pointer">Post</button>
    </form>
  );
}
