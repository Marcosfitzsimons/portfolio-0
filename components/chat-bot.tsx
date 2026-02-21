"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "./ui/scroll-area";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import Image from "next/image";
import { toast } from "sonner";

const SUGGESTIONS = [
  "What technologies do you use?",
  "What's your experience level?",
  "Are you open to new opportunities?",
  "Do you work remotely?",
  "What projects have you built?",
  "What's your availability to start?",
];

const ChatBot = () => {
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const inputWrapperRef = React.useRef<HTMLDivElement | null>(null);

  const { messages, status, sendMessage, stop } = useChat({
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = ({ text }: PromptInputMessage) => {
    if (!text.trim() || isLoading) return;
    sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
  };

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return;
    const textarea = inputWrapperRef.current?.querySelector("textarea");
    if (!textarea) return;
    textarea.value = suggestion;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  };

  // Helper to extract text content from message parts
  const getMessageText = (message: (typeof messages)[0]): string => {
    if (Array.isArray(message.parts)) {
      return message.parts
        .filter(
          (part): part is { type: "text"; text: string } =>
            part.type === "text",
        )
        .map((part) => part.text)
        .join("");
    }
    return "";
  };

  return (
    <section className="mx-auto flex w-[min(95%,650px)] flex-col gap-2">
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-in-out",
          messages.length > 0
            ? "max-h-[200px] opacity-100"
            : "mt-10 max-h-0 opacity-0",
        )}
      >
        <ScrollArea className="h-[180px] w-full px-3 py-1">
          {messages.map((message) => {
            const content = getMessageText(message);

            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={cn(
                  "mb-2 flex flex-col gap-1",
                  isUser ? "items-end" : "w-fit items-start",
                )}
              >
                {isUser ? (
                  <div className="flex select-none items-center gap-1 text-sm text-muted-foreground">
                    <User strokeWidth="1.5" className="aspect-square w-5" />
                    <span>You</span>
                  </div>
                ) : (
                  <div className="flex select-none items-center gap-1 text-sm">
                    <Image
                      src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"
                      alt="AI gif"
                      width={22}
                      height={22}
                    />
                    <span>AI Chatbot</span>
                  </div>
                )}
                <ScrollArea
                  className={cn(
                    "flex max-h-32 flex-col gap-1 rounded-lg border",
                    isUser
                      ? "mr-6 rounded-tr-[3px] bg-secondary/60"
                      : "ml-6 rounded-tl-[3px] border-primary/30 bg-primary/20",
                  )}
                >
                  <p className="rounded-none px-4 py-1.5 text-xs md:text-sm">
                    {content}
                  </p>
                </ScrollArea>
              </div>
            );
          })}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-1 pb-4 text-sm">
              <Image
                src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"
                alt="AI gif"
                width={22}
                height={22}
              />
              <span className="animate-pulse text-xs text-muted-foreground">
                generating...
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </ScrollArea>
      </div>
      <Suggestions>
        {SUGGESTIONS.map((s) => (
          <Suggestion
            key={s}
            suggestion={s}
            onClick={handleSuggestion}
            disabled={isLoading}
          />
        ))}
      </Suggestions>
      <div
        ref={inputWrapperRef}
        className="relative w-full before:pointer-events-none before:absolute before:-inset-1 before:rounded-[20px] before:border before:border-purple-500/70 before:opacity-0 before:ring-2 before:ring-purple-500/10 before:transition focus-within:before:opacity-100"
      >
        <PromptInput onSubmit={handleSubmit} className="w-full">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Pick a suggestion or ask anything about me…"
              disabled={isLoading}
              maxLength={160}
              minLength={3}
              className="text-xs md:text-sm"
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputTools>
              <PromptInputSubmit
                status={status}
                onStop={stop}
                size="sm"
                className="rounded-xl px-3"
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </section>
  );
};

export default ChatBot;
