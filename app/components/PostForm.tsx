import React from 'react'

type PostFormProps = {
    handleSubmit: any,
    message: string,
    setMessage: any,
}

export default function PostForm({ handleSubmit, message, setMessage }: PostFormProps) {
  return (
    <div className="w-full mt-5">
        <div className="bg-gray-950 w-full p-5 flex flex-col gap-5 rounded-lg">
        <h1>Create Post:</h1>
        <form onSubmit={handleSubmit} className="w-full flex justify-between items-center">
            <input value={message} onChange={(e) => setMessage(e.target.value)} name="post" type="text" placeholder="What's on your mind..." className="bg-gray-900 w-1/2 p-5 rounded-lg h-15"></input>
            <button type="submit" className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-35 h-15 cursor-pointer">Post</button>
        </form>
        </div>
    </div>
  )
}
