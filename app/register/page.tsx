"use client"

import React, { useState } from 'react'
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("name") || "").toString().trim();
    const username = (data.get("username") || "").toString().trim();
    const password = (data.get("password") || "").toString().trim();

    if (!name || !username || !password) {
      alert("Please fill all fields.");
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, name, password }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result?.error || "Register failed.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-gray-800">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-gray-800">
        <div className="bg-gray-900 p-5 rounded-lg w-100">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 justify-center items-center">
              <h1 className="text-white text-2xl">Register</h1>
              <input name="name" type="text" placeholder="Name" className="border border-white p-2 rounded-lg w-full" />
              <input name="username" type="text" placeholder="Username" className="border border-white p-2 rounded-lg w-full" />
              <input name="password" type="password" placeholder="Password" className="border border-white p-2 rounded-lg w-full" />
              <a href="/login" className="text-white underline">Login</a>
              <button type="submit" className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-full">Register</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

