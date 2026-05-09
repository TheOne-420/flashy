import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 },
      );
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF files are allowed" },
        { status: 400 },
      );
    }

    const pdfFormData = new FormData();
    pdfFormData.append("file", file);

    const pdfResponse = await fetch(`${PDF_SERVICE_URL}/extract-text`, {
      method: "POST",
      body: pdfFormData,
    });

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.json();
      return NextResponse.json(
        { error: errorData.error || "PDF processing failed" },
        { status: pdfResponse.status },
      );
    }

    const result = await pdfResponse.json();

    return NextResponse.json({
      success: true,
      text: result.text,
      pageCount: result.pageCount,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
