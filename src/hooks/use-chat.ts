"use client";

import { generateInterviewResponse } from "@/app/jobseeker/actions/action";
import { useCallback, useState } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

interface ChatBodyBase {
  role: string;
  name: string;
  skills: string[];
}

interface UseInterviewChatOptions {
  body: ChatBodyBase;
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useChat({ body, onFinish, onError }: UseInterviewChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      // if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        role: "user",
        content: input,
        id: Date.now().toString(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      try {
        const result = await generateInterviewResponse(
          newMessages,
          body.role,
          body.name,
          body.skills
        );

        if (result.success && result.text) {
          const assistantMessage: Message = {
            role: "assistant",
            content: result.text,
            id: (Date.now() + 1).toString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (onFinish) {
            onFinish(assistantMessage);
          }
        } else {
          const error = new Error(
            result.error || "Failed to generate response"
          );
          if (onError) {
            onError(error);
          } else {
            console.error("Interview error:", error);
          }
        }
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Unknown error occurred");
        if (onError) {
          onError(err);
        } else {
          console.error("Interview error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, isLoading, body, onFinish, onError]
  );

  const append = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateMessages = useCallback(
    (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
      if (typeof newMessages === "function") {
        setMessages((prev) => newMessages(prev));
      } else {
        setMessages(newMessages);
      }
    },
    []
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    append,
    setMessages: updateMessages,
  };
}
