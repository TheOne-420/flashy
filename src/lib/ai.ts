import type { ParsedCard } from "@/types/flashcard";

const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are a flashcard generator. Convert the given text into high-quality flashcards (question/answer pairs).

Rules:
- Extract key concepts, definitions, facts, and relationships.
- Each card should have a clear "front" (question) and "back" (answer).
- Keep answers concise but complete.
- Return ONLY a JSON array of objects with "front" and "back" fields.
- Return an empty array if no flashcards can be generated.
- Aim for 5-20 cards depending on content length.`;

export async function parseWithAI(text: string): Promise<ParsedCard[]> {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    console.warn("AI_API_KEY not set, falling back to rule-based parsing");
    return [];
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Convert the following text into flashcards:\n\n${text.slice(0, 15000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status, await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) return [];

    const cleaned = content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/g, "")
      .trim();

    const cards: ParsedCard[] = JSON.parse(cleaned);

    if (!Array.isArray(cards)) return [];

    return cards.filter(
      (c) =>
        typeof c.front === "string" &&
        typeof c.back === "string" &&
        c.front.trim().length > 0 &&
        c.back.trim().length > 0,
    );
  } catch (error) {
    console.error("AI parsing error:", error);
    return [];
  }
}
