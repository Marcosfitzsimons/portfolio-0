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
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion } from "@/components/ai-elements/suggestion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SUGGESTIONS = [
  {
    text: "What technologies do you use?",
    icon: "💻",
    gradientColor: "rgba(96,165,250,0.25)",
    className:
      "bg-blue-400/10 text-blue-200/90 hover:bg-blue-400/15 hover:text-blue-100",
  },
  {
    text: "What's your experience level?",
    icon: "📊",
    gradientColor: "rgba(52,211,153,0.25)",
    className:
      "bg-emerald-400/10 text-emerald-200/90 hover:bg-emerald-400/15 hover:text-emerald-100",
  },
  {
    text: "Are you open to new opportunities?",
    icon: "🚀",
    gradientColor: "rgba(167,139,250,0.25)",
    className:
      "bg-violet-400/10 text-violet-200/90 hover:bg-violet-400/15 hover:text-violet-100",
  },
  {
    text: "Do you work remotely?",
    icon: "🌍",
    gradientColor: "rgba(251,191,36,0.25)",
    className:
      "bg-amber-400/10 text-amber-200/90 hover:bg-amber-400/15 hover:text-amber-100",
  },
  {
    text: "What projects have you built?",
    icon: "🛠️",
    gradientColor: "rgba(251,113,133,0.25)",
    className:
      "bg-rose-400/10 text-rose-200/90 hover:bg-rose-400/15 hover:text-rose-100",
  },
  {
    text: "What's your availability to start?",
    icon: "📅",
    gradientColor: "rgba(34,211,238,0.25)",
    className:
      "bg-cyan-400/10 text-cyan-200/90 hover:bg-cyan-400/15 hover:text-cyan-100",
  },
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
            className="flex cursor-pointer items-center gap-2 px-3 py-2 transition-colors hover:bg-white/5 rounded-2xl"
          >
            <input
              type="text"
              readOnly
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none cursor-pointer"
            />
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
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
                        {isUser ? (
                          <p className={cn(
                            "rounded-none px-4 py-2 text-xs md:text-sm text-white"
                          )}>
                            {content}
                          </p>
                        ) : (
                          <div className="chat-markdown rounded-none px-4 py-2 text-xs md:text-sm text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {content}
                            </ReactMarkdown>
                          </div>
                        )}
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
            <Carousel
              opts={{ align: "start", dragFree: true }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {SUGGESTIONS.map((s) => (
                  <CarouselItem key={s.text} className="basis-auto pl-2">
                    <Suggestion
                      suggestion={s.text}
                      icon={s.icon}
                      gradientColor={s.gradientColor}
                      onClick={handleSuggestion}
                      disabled={isLoading}
                      className={s.className}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Input Area */}
            <div
              ref={inputWrapperRef}
              className="relative w-full"
            >
              <PromptInput
                onSubmit={handleSubmit}
                className="w-full border-white/10 bg-secondary/30 transition-all duration-200 focus-within:border-white/25 focus-within:bg-secondary/40 focus-within:ring-1 focus-within:ring-white/10"
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    placeholder="Pick a suggestion or ask anything about me..."
                    disabled={isLoading}
                    maxLength={160}
                    minLength={3}
                    className="text-xs text-white placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
                  />
                </PromptInputBody>
                <PromptInputFooter className="justify-end">
                  <PromptInputTools>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
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
