import type { Zone } from "../types";
import { sanitiseInput } from "./sanitiseInput";

const API_ENDPOINT = "/api/chat";

/**
 * Sends a sanitised user message plus live zone context to the Gemini proxy
 * and returns the assistant reply.
 */
export async function askConcierge(
  userMessage: string,
  zoneData: Zone[]
): Promise<string> {
  const clean = sanitiseInput(userMessage);
  if (!clean.trim()) {
    return "Please enter a message.";
  }

  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: clean,
      context: JSON.stringify(zoneData),
    }),
  });

  if (!res.ok) {
    throw new Error(`Concierge API error: ${res.status}`);
  }

  const data: { reply: string } = await res.json();
  return data.reply;
}
