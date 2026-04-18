"use client";

import React from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "./ui/scroll-area";
import { User, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerFooter,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
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

const AI_AVATAR_SRC =
  "https://www.gstatic.com/lamda/images/sparkle_resting_v2_darkmode_2bdb7df2724e450073ede.gif";

const DIALOG_DESCRIPTION =
  "Chat with an AI about Marcos's experience, projects, and availability.";

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
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { messages, status, sendMessage, stop } = useChat({
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (messages.length > 0) {
      setIsOpen(true);
    }
  }, [messages.length]);

  const handleSubmit = ({ text }: PromptInputMessage) => {
    if (!text?.trim() || isLoading) return;
    sendMessage({
      role: "user",
      parts: [{ type: "text", text }],
    });
  };

  const handleSuggestion = (suggestion: string) => {
    if (isLoading) return;
    setIsOpen(true);
    // Wait for the dialog/drawer to mount before reaching into the textarea.
    setTimeout(() => {
      const textarea = inputWrapperRef.current?.querySelector("textarea");
      if (!textarea) return;
      textarea.value = suggestion;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
    }, 120);
  };

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

  const handleOpenCollapsed = () => setIsOpen(true);
  const handleKeyDownCollapsed = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const messagesList = (
    <>
      {messages.map((message) => {
        const content = getMessageText(message);
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={cn(
              "mb-3 flex flex-col gap-1",
              isUser ? "items-end" : "w-fit items-start",
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
                  src={AI_AVATAR_SRC}
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
                  : "ml-6 rounded-tl-[3px] border-secondary/50 bg-secondary/40",
              )}
            >
              {isUser ? (
                <p className="rounded-none px-4 py-2 text-xs md:text-sm text-white">
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
          <Image src={AI_AVATAR_SRC} alt="AI gif" width={22} height={22} />
          <span className="animate-pulse text-xs text-muted-foreground">
            generating...
          </span>
        </div>
      )}
      <div ref={bottomRef} />
    </>
  );

  const suggestionsCarousel = (
    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
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
  );

  const inputArea = (
    <div ref={inputWrapperRef} className="relative w-full">
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
            className="text-base text-white placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm"
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
  );

  return (
    <div className="relative mx-auto w-[min(95%,650px)] after:pointer-events-none after:absolute after:inset-px after:rounded-2xl after:shadow-highlight after:shadow-gray-300/20 after:transition-colors">
      <section className="flex flex-col rounded-2xl border border-white/10 bg-background/60 p-0 backdrop-blur-md transition-all duration-300 ease-out">
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenCollapsed}
          onKeyDown={handleKeyDownCollapsed}
          className="flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 transition-colors hover:bg-white/5"
        >
          <input
            type="text"
            readOnly
            tabIndex={-1}
            placeholder="Ask me anything..."
            className="flex-1 cursor-pointer bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none"
          />
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors"
          >
            <Send className="h-4 w-4" />
          </span>
        </div>
      </section>

      {isDesktop ? (
        <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
            <DialogPrimitive.Content
              onPointerDownOutside={(e) => e.preventDefault()}
              className={cn(
                "fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden",
                "h-[85vh] w-[min(90vw,900px)] rounded-2xl",
                "border border-white/10 bg-background/95 shadow-2xl backdrop-blur-md",
                "duration-300",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                "data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4",
              )}
            >
              <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-1.5 text-sm text-white">
                  <Image
                    src={AI_AVATAR_SRC}
                    alt="AI gif"
                    width={22}
                    height={22}
                  />
                  <DialogPrimitive.Title className="text-sm font-normal leading-none tracking-normal text-white">
                    AI Chatbot
                  </DialogPrimitive.Title>
                </div>
                <DialogPrimitive.Description className="sr-only">
                  {DIALOG_DESCRIPTION}
                </DialogPrimitive.Description>
                <DialogPrimitive.Close
                  aria-label="Close chat"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                >
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              </header>

              <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
                <ScrollArea className="h-full w-full pr-2">
                  {messagesList}
                </ScrollArea>
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 p-4">
                {suggestionsCarousel}
                {inputArea}
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      ) : (
        <Drawer
          open={isOpen}
          onOpenChange={setIsOpen}
          shouldScaleBackground={false}
        >
          <DrawerContent
            onPointerDownOutside={(e) => e.preventDefault()}
            className="flex h-[90dvh] max-h-[90dvh] flex-col overflow-hidden border-white/10 bg-background/95 backdrop-blur-md"
          >
            <DrawerHeader className="mt-2 flex shrink-0 flex-row items-center justify-between border-b border-white/10 px-4 py-3 text-left">
              <div className="flex items-center gap-1.5 text-sm text-white">
                <Image
                  src={AI_AVATAR_SRC}
                  alt="AI gif"
                  width={22}
                  height={22}
                />
                <DrawerTitle className="text-sm font-normal leading-none tracking-normal text-white">
                  AI Chatbot
                </DrawerTitle>
              </div>
              <DrawerDescription className="sr-only">
                {DIALOG_DESCRIPTION}
              </DrawerDescription>
              <DrawerClose
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <X className="h-4 w-4" />
              </DrawerClose>
            </DrawerHeader>

            <div className="flex min-h-0 flex-1 flex-col px-4 pt-3">
              <ScrollArea className="h-full w-full pr-2">
                {messagesList}
              </ScrollArea>
            </div>

            <DrawerFooter className="shrink-0 gap-3 border-t border-white/10 p-4 pt-4">
              {suggestionsCarousel}
              {inputArea}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default ChatBot;
