"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: finalMessages,
      max_tokens: 1000,
    });

    const responseText = result.choices[0]?.message?.content || "";

    return {
      success: true,
      text: responseText,
      usage: result.usage
        ? {
            promptTokens: result.usage.prompt_tokens,
            completionTokens: result.usage.completion_tokens,
            totalTokens: result.usage.total_tokens,
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
