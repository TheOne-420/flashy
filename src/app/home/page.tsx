"use client";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const session = useSession();
  console.log(session);
  if (!session) return;
  return <div>Hey! {session.data?.user.name}</div>;
}
