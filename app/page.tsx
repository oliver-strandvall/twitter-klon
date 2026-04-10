import { redirect } from "next/navigation";
import Main from "./components/Main";
import { getDb } from "./lib/db";
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')

  if(!sessionId) {
    return redirect("/login")
  }

  const db = getDb();
  const session = await db.prepare("SELECT * FROM sessions WHERE sessionId = ?").get(sessionId.value);
  const user = await db.prepare("SELECT * FROM users WHERE id = ?").get(session.userId);

  if(!session) {
    return redirect("/login")
  }

  return <Main session={ user } />;
}
