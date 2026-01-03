"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import Image from "next/image";
import { toast } from "sonner";

type WelcomeMessage = {
  id: string;
  role: "assistant";
  text: string;
};

const ChatBot = () => {
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const [input, setInput] = React.useState("");

  const { messages, status, sendMessage } = useChat({
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const welcomeMessage: WelcomeMessage = {
    id: "welcome",
    role: "assistant",
    text: "Hi, ask something about me! 👋",
  };

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
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
    <section className="flex w-[min(95%,650px)] flex-col gap-2">
      <ScrollArea className="h-[220px] w-full px-3 py-1 sm:h-[250px]">
        {/* Welcome message */}
        <div className="mb-2 flex w-fit flex-col gap-1">
          <div className="flex select-none items-center gap-1 text-sm ">
            <Image
              src="https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif"
              alt="AI gif"
              width={22}
              height={22}
            />
            <span>AI Chatbot</span>
          </div>
          <ScrollArea className="ml-6 flex max-h-32 flex-col gap-1 rounded-lg rounded-tl-[3px] border border-primary/30 bg-primary/20">
            <p className="rounded-none px-4 py-1.5 text-xs md:text-sm">
              {welcomeMessage.text}
            </p>
          </ScrollArea>
        </div>

        {/* Chat messages */}
        {messages.map((message) => {
          const content = getMessageText(message);

          return (
            <div key={message.id} className="mb-2 flex w-fit flex-col gap-1">
              {message.role === "user" ? (
                <div className="flex select-none items-center gap-1 text-sm text-muted-foreground">
                  <User strokeWidth="1.5" className="aspect-square w-5" />
                  <span>You</span>
                </div>
              ) : (
                <div className="flex select-none items-center gap-1 text-sm ">
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
                  "ml-6 flex max-h-32 flex-col gap-1 rounded-lg rounded-tl-[3px] border",
                  message.role === "user"
                    ? "bg-secondary/60"
                    : "border-primary/30 bg-primary/20",
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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="relative flex w-full items-center">
          <Input
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Which technologies do you use?"
            disabled={isLoading}
            className="w-full text-xs md:text-sm"
            maxLength={160}
            minLength={3}
          />
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild className="absolute right-2 top-0.5">
                <Button
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    }),
                    "h-9 w-9 rounded-lg bg-transparent p-0 text-muted-foreground hover:bg-secondary",
                  )}
                  type="submit"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send question</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="rounded-sm text-xs">
                Send question
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </section>
  );
};

export default ChatBot;
