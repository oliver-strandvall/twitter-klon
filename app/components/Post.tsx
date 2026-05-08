import React from 'react'
import CommentForm from './commentForm'
import { AiOutlineLike, AiFillLike } from "react-icons/ai"
import { AiOutlineMessage, AiFillMessage } from "react-icons/ai";

type PostProps = {
    post: any,
    session: any,
    showComments: any,
    setshowComments: any,
    likePost:(id: number) => Promise<void> | void,
    unlikePost:(id: number) => Promise<void> | void,
    handleDelete:(id: number) => Promise<void> | void,
    handleCommentSubmit:(content: string, postId: number) => Promise<void> | void,
    handleDeleteComment:(id: number) => Promise<void> | void
}

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

export default function Post({
    post,
    session,
    showComments,
    setshowComments,
    likePost,
    unlikePost,
    handleDelete,
    handleCommentSubmit,
    handleDeleteComment
}: PostProps) {
  return (
    <div className="bg-gray-900 p-5 rounded-lg">
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
                        <button onClick={() => setshowComments((prev: any) => ({ ...prev, [post.id]: false }))} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10 ml-2"><AiFillMessage size={25} /></button>
                    )}
                    {!showComments[post.id] && (
                        <button onClick={() => setshowComments((prev: any) => ({ ...prev, [post.id]: true }))} className="bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white p-2 rounded-lg w-10 h-10 ml-2"><AiOutlineMessage size={25} /></button>
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
        {post.comments?.map((comment: any) => (
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
  )
}
