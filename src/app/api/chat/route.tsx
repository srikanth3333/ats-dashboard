import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, role, name, skills } = await req.json();

  const systemPrompt = {
    role: "system",
    content: `You are a helpful AI interviewer for the role of ${role}. The candidate is ${name}. ask questions short and sweet on these skills: ${skills?.join(
      ", "
    )}. Start with a friendly greeting and follow-up questions should depend on the candidate's answers. End the interview with a polite goodbye when the time is almost up time.`,
  };

  const finalMessages = [systemPrompt, ...messages];

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: finalMessages,
  });

  return result.toDataStreamResponse({
    headers: {
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
    },
  });
}
