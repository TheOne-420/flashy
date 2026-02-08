"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ReactNode } from "react";

export default function HeroCard({
  size = 100,
  url,
  alt,
  content,
  children,
}: {
  size?: number;
  url?: string;
  alt?: string;
  content?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      {/*<Image src={url} width={size} height={size} alt={alt ?? "Card"} />*/}
      <CardContent className="flex h-20 w-fit place-content-center">
        {children}
      </CardContent>
    </Card>
  );
}
