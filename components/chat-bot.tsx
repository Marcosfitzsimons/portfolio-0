"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "./ui/scroll-area";
import { User, ChevronDown } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = React.useState(false);

  const { messages, status, sendMessage, stop } = useChat({
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-expand when there are messages
  React.useEffect(() => {
    if (messages.length > 0) {
      setIsExpanded(true);
    }
  }, [messages.length]);

  const handleSubmit = ({ text }: PromptInputMessage) => {
    if (!text.trim() || isLoading) return;
    sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
  };

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return;
    setIsExpanded(true);
    const textarea = inputWrapperRef.current?.querySelector("textarea");
    if (!textarea) return;
    textarea.value = suggestion;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  };

  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      // Focus the textarea after expansion
      setTimeout(() => {
        const textarea = inputWrapperRef.current?.querySelector("textarea");
        textarea?.focus();
      }, 100);
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
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
    <div className="relative mx-auto w-[min(95%,650px)]">
      <section
        className={cn(
          "flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm transition-all duration-300 ease-out",
          isExpanded ? "gap-3 p-4" : "p-0"
        )}
      >
        {/* Collapsed View */}
        {!isExpanded && (
          <div
            onClick={handleExpand}
            className="flex cursor-pointer items-center gap-2 p-3 transition-colors hover:bg-zinc-800/50 rounded-2xl"
          >
            <input
              type="text"
              readOnly
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm text-zinc-400 placeholder:text-zinc-500 outline-none cursor-pointer"
            />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <>
            {/* Collapse Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCollapse}
                className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Collapse chat"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                messages.length > 0
                  ? "max-h-[200px] opacity-100"
                  : "max-h-0 opacity-0"
              )}
            >
              <ScrollArea className="h-[180px] w-full px-1 py-1">
                {messages.map((message) => {
                  const content = getMessageText(message);
                  const isUser = message.role === "user";

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "mb-2 flex flex-col gap-1",
                        isUser ? "items-end" : "w-fit items-start"
                      )}
                    >
                      {isUser ? (
                        <div className="flex select-none items-center gap-1 text-sm text-zinc-400">
                          <User strokeWidth="1.5" className="aspect-square w-5" />
                          <span>You</span>
                        </div>
                      ) : (
                        <div className="flex select-none items-center gap-1 text-sm text-zinc-300">
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
                            ? "mr-6 rounded-tr-[3px] border-zinc-700 bg-zinc-800/80"
                            : "ml-6 rounded-tl-[3px] border-zinc-700 bg-zinc-800/50"
                        )}
                      >
                        <p className="rounded-none px-4 py-1.5 text-xs text-zinc-200 md:text-sm">
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
                    <span className="animate-pulse text-xs text-zinc-400">
                      generating...
                    </span>
                  </div>
                )}
                <div ref={bottomRef} />
              </ScrollArea>
            </div>

            {/* Suggestions */}
            <Suggestions>
              {SUGGESTIONS.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={handleSuggestion}
                  disabled={isLoading}
                  className="border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                />
              ))}
            </Suggestions>

            {/* Input Area */}
            <div
              ref={inputWrapperRef}
              className="relative w-full before:pointer-events-none before:absolute before:-inset-1 before:rounded-[20px] before:border before:border-zinc-600/50 before:opacity-0 before:ring-2 before:ring-zinc-500/10 before:transition focus-within:before:opacity-100"
            >
              <PromptInput onSubmit={handleSubmit} className="w-full border-zinc-700 bg-zinc-800/60">
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Pick a suggestion or ask anything about me..."
                    disabled={isLoading}
                    maxLength={160}
                    minLength={3}
                    className="text-xs text-zinc-200 placeholder:text-zinc-500 md:text-sm"
                  />
                </PromptInputBody>
                <PromptInputFooter className="justify-end">
                  <PromptInputTools>
                    <PromptInputSubmit
                      status={status}
                      onStop={stop}
                      size="sm"
                      className="rounded-xl bg-zinc-700 px-3 text-zinc-200 hover:bg-zinc-600"
                    />
                  </PromptInputTools>
                </PromptInputFooter>
              </PromptInput>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default ChatBot;
