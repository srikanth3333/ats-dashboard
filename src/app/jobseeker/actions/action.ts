"use server";

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function generateInterviewResponse(
  messages: any[],
  role: string,
  name: string,
  skills: string[]
) {
  const systemPrompt = {
    role: "system" as const,
    content: `You are a helpful AI interviewer for the role of ${role}. The candidate is ${name}. ask questions short and sweet on these skills: ${skills?.join(
      ", "
    )}. Start with a friendly greeting and follow-up questions should depend on the candidate's answers. End the interview with a polite goodbye when the time is almost up time.`,
  };

  const finalMessages = [systemPrompt, ...messages];

  try {
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: finalMessages,
      maxTokens: 1000,
    });

    return {
      success: true,
      text: result.text,
      usage: result.usage
        ? {
            promptTokens: result.usage.promptTokens,
            completionTokens: result.usage.completionTokens,
            totalTokens: result.usage.totalTokens,
          }
        : null,
    };
  } catch (error) {
    console.error("Error generating interview response:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate interview response",
    };
  }
}
