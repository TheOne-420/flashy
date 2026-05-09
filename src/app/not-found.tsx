"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-primary px-4">
      <div className="text-center">
        <h1 className="font-bbh text-9xl text-white">404</h1>

        <p className="mt-4 text-2xl text-white">
          {`Sorry, looks like this page doesn't exist.`}
        </p>

        <p className="mt-2 text-lg text-white/70">
          Try visiting our home page.
        </p>

        <Link
          href="/home"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-primary transition-all hover:scale-105"
        >
          <Home className="h-5 w-5" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
