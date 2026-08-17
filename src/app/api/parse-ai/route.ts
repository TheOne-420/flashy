import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { parseWithAI } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    const cards = await parseWithAI(text);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Parse AI error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
