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
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ShinyText, { ShinyIcon, SPARKLES_SVG } from "./shiny-text";
import { AnimatePresence, motion } from "motion/react";

const AI_LABEL = "Marcos AI";
const INTRO_TEXT =
  "Hey! I'm Marcos's AI. Ask me anything about my work, stack, projects, or availability.";

const DIALOG_DESCRIPTION =
  "Chat with an AI about Marcos's experience, projects, and availability.";

const SHEET_VARIANTS = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.3,
    },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.4, ease: [0.55, 0, 0.65, 0.2] },
  },
} as const;

const SHEET_CHILD_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
} as const;

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
  const [showIntro, setShowIntro] = React.useState(false);
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

  // Show intro callout after the open animation finishes, hide once user engages or after a beat.
  React.useEffect(() => {
    if (!isOpen || messages.length > 0) {
      setShowIntro(false);
      return;
    }
    const showTimer = window.setTimeout(() => setShowIntro(true), 450);
    const hideTimer = window.setTimeout(() => setShowIntro(false), 6500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isOpen, messages.length]);

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
              <div className="flex select-none items-center gap-1.5 text-sm text-white">
                <ShinyIcon
                  svg={SPARKLES_SVG}
                  size={18}
                  speed={2.4}
                  color="#9ca3af"
                  shineColor="#ffffff"
                />
                <span className="sr-only">{AI_LABEL}</span>
              </div>
            )}
            <ScrollArea
              className={cn(
                "flex max-h-[178px] flex-col gap-1 rounded-lg border",
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
        <div className="flex items-center gap-1.5 pb-4 text-sm">
          <ShinyIcon
            svg={SPARKLES_SVG}
            size={16}
            speed={1.5}
            color="#9ca3af"
            shineColor="#ffffff"
          />
          <ShinyText
            text="generating..."
            speed={1.5}
            shineColor="#ffffff"
            color="#9ca3af"
            className="text-xs"
          />
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

  const introCallout = (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
        >
          <div className="pointer-events-auto flex max-w-[90%] items-start gap-2 rounded-2xl border border-white/10 bg-secondary/70 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-md">
            <ShinyIcon
              svg={SPARKLES_SVG}
              size={18}
              speed={2}
              color="#9ca3af"
              shineColor="#ffffff"
              className="mt-0.5"
            />
            <span className="leading-snug">{INTRO_TEXT}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
    <div className="relative w-full after:pointer-events-none after:absolute after:inset-px after:rounded-2xl after:shadow-highlight after:shadow-gray-300/20 after:transition-colors">
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
            className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground outline-none"
          />
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors"
          >
            <Send className="h-4 w-4" />
          </span>
        </div>
      </section>

      {isDesktop ? (
        <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
          <AnimatePresence>
            {isOpen && (
              <DialogPrimitive.Portal forceMount>
                <DialogPrimitive.Overlay asChild forceMount>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  />
                </DialogPrimitive.Overlay>
                <DialogPrimitive.Content asChild forceMount>
                  <motion.div
                    variants={SHEET_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={cn(
                      "fixed bottom-0 left-0 right-0 z-50 mx-auto flex flex-col overflow-hidden",
                      "h-[95vh] w-[min(95vw,1100px)] rounded-t-2xl",
                      "border border-b-0 border-white/10 bg-background/95 shadow-2xl backdrop-blur-md",
                    )}
                  >
                    <motion.header
                      variants={SHEET_CHILD_VARIANTS}
                      className="flex items-center justify-between border-b border-white/10 px-4 py-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-white">
                        <ShinyIcon
                          svg={SPARKLES_SVG}
                          size={20}
                          speed={2.4}
                          color="#9ca3af"
                          shineColor="#ffffff"
                        />
                        <DialogPrimitive.Title className="sr-only">
                          {AI_LABEL}
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
                    </motion.header>

                    <motion.div
                      variants={SHEET_CHILD_VARIANTS}
                      className="relative flex min-h-0 flex-1 flex-col px-4 pt-3"
                    >
                      <ScrollArea className="h-full w-full pr-2">
                        {messagesList}
                      </ScrollArea>
                      {introCallout}
                    </motion.div>

                    <motion.div
                      variants={SHEET_CHILD_VARIANTS}
                      className="flex shrink-0 flex-col gap-3 border-t border-white/10 p-4"
                    >
                      {suggestionsCarousel}
                      {inputArea}
                    </motion.div>
                  </motion.div>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            )}
          </AnimatePresence>
        </DialogPrimitive.Root>
      ) : (
        <Drawer
          open={isOpen}
          onOpenChange={setIsOpen}
          shouldScaleBackground={false}
        >
          <DrawerContent
            className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden rounded-none border-0 bg-background/95 backdrop-blur-md [&>div:first-child]:hidden"
          >
            <DrawerHeader className="mt-2 flex shrink-0 flex-row items-center justify-between border-b border-white/10 px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-sm text-white">
                <ShinyIcon
                  svg={SPARKLES_SVG}
                  size={20}
                  speed={2.4}
                  color="#9ca3af"
                  shineColor="#ffffff"
                />
                <DrawerTitle className="sr-only">{AI_LABEL}</DrawerTitle>
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

            <div className="relative flex min-h-0 flex-1 flex-col px-4 pt-3">
              <ScrollArea className="h-full w-full pr-2">
                {messagesList}
              </ScrollArea>
              {introCallout}
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
