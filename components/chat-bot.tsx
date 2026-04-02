"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "./ui/scroll-area";
import { User, ChevronDown, Send } from "lucide-react";
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
    <div className="relative mx-auto w-[min(95%,650px)] after:pointer-events-none after:absolute after:inset-px after:rounded-2xl after:shadow-highlight after:shadow-gray-300/20 after:transition-colors">
      <section
        className={cn(
          "flex flex-col rounded-2xl border border-white/10 bg-background/60 backdrop-blur-md transition-all duration-300 ease-out",
          isExpanded ? "gap-3 p-4" : "p-0"
        )}
      >
        {/* Collapsed View */}
        {!isExpanded && (
          <div
            onClick={handleExpand}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5 rounded-2xl"
          >
            <input
              type="text"
              readOnly
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none cursor-pointer"
            />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
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
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
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
                        "mb-3 flex flex-col gap-1",
                        isUser ? "items-end" : "w-fit items-start"
                      )}
                    >
                      {isUser ? (
                        <div className="flex select-none items-center gap-1 text-sm text-muted-foreground">
                          <User strokeWidth="1.5" className="aspect-square w-5" />
                          <span>You</span>
                        </div>
                      ) : (
                        <div className="flex select-none items-center gap-1 text-sm text-white">
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
                            ? "mr-6 rounded-tr-[3px] border-primary/30 bg-primary/15"
                            : "ml-6 rounded-tl-[3px] border-secondary/50 bg-secondary/40"
                        )}
                      >
                        <p className={cn(
                          "rounded-none px-4 py-2 text-xs md:text-sm",
                          isUser ? "text-white" : "text-muted-foreground"
                        )}>
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

            {/* Suggestions */}
            <Suggestions>
              {SUGGESTIONS.map((s) => (
                <Suggestion
                  key={s}
                  suggestion={s}
                  onClick={handleSuggestion}
                  disabled={isLoading}
                  className="border-white/10 bg-secondary/50 text-white hover:bg-secondary hover:text-white"
                />
              ))}
            </Suggestions>

            {/* Input Area */}
            <div
              ref={inputWrapperRef}
              className="relative w-full"
            >
              <PromptInput onSubmit={handleSubmit} className="w-full border-white/10 bg-secondary/30">
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Pick a suggestion or ask anything about me..."
                    disabled={isLoading}
                    maxLength={160}
                    minLength={3}
                    className="text-xs text-white placeholder:text-muted-foreground md:text-sm"
                  />
                </PromptInputBody>
                <PromptInputFooter className="justify-end">
                  <PromptInputTools>
                    <PromptInputSubmit
                      status={status}
                      onStop={stop}
                      size="sm"
                      className="rounded-xl bg-primary px-3 text-primary-foreground hover:bg-primary/90"
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
