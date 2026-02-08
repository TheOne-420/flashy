import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@base-ui/react";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HoverCard } from "./hover-card";

export function Navbar() {
  const handleLogOut = async () => {
    await authClient.signOut();
    console.log(await authClient.signOut());
    
  };
  const session = useSession();
  console.log(session.data?.user);
  return (
    <div className="hidden w-full flex-col items-center gap-12 bg-primary py-8 md:flex">
      <nav className="relative flex w-full flex-row items-center justify-between lg:max-w-6xl">
        <p className="text-lg">Flashy</p>
        <div className="flex flex-1 place-content-center">
          <Link href="#hero">Hero</Link>
        </div>
        <div className="flex shrink-0 place-content-end gap-2">
          {session.data?.user?.image && (
            <HoverCard>
              <Avatar>
                <AvatarImage src={session.data?.user.image ?? ""} />
              </Avatar>
            </HoverCard>
          )}
          {session.data?.user != null ? (
            <Button
              onClick={handleLogOut}
              className={"flex items-center gap-2 text-red-300"}
            >
              <SignOutIcon className="" /> SignOut
            </Button>
          ) : (
            <Link href="/auth">Join Us</Link>
          )}
        </div>
      </nav>
    </div>
  );
}
