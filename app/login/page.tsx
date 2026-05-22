"use client"

import React, { useState } from 'react'
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);
    const username = (data.get("username") || "").toString().trim();
    const password = (data.get("password") || "").toString().trim();

    if (!username || !password) {
      alert("Please enter username and password.");
      return;
    }

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert(result?.error || "Login failed");
      return;
    }

    router.push("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-gray-800">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-gray-800">
        <div className="bg-gray-900 p-5 rounded-lg min-w-75 max-w-125 w-full">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 justify-center items-center">
              <h1 className="text-white text-2xl">Login</h1>
              <input name="username" type="text" placeholder="Username" className="border border-white p-2 rounded-lg w-full text-white" />
              <input name="password" type="password" placeholder="Password" className="border border-white p-2 rounded-lg w-full text-white" />
              <a href="/register" className="text-white underline">Sign Up</a>
              <button type="submit" className="bg-blue-800 hover:bg-blue-700 active:bg-blue-600 text-white p-3 rounded-lg w-full">Login</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
