"use client";

import React from "react";
import { questionSchema } from "@/lib/validations/question";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
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
import { generateChatResponse } from "@/app/actions/actions";
import generateRandomId from "@/lib/utils/generateRandomId";
import Image from "next/image";
import { toast } from "sonner";

type FormData = z.infer<typeof questionSchema>;

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const ChatBot = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: generateRandomId(),
      role: "assistant",
      content: "Hi, ask something about me! 👋",
    },
  ]);
  const [loading, setLoading] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: FormData) {
    const { question } = values;
    const userMessage: Message = {
      id: generateRandomId(),
      role: "user",
      content: question,
    };
    setMessages((prev) => [...prev, userMessage]);
    form.setValue("question", "");
    setLoading(true);
    try {
      const answer = await generateChatResponse(question);
      const id = generateRandomId();
      const newMessage: Message = { id, role: "assistant", content: answer };
      setMessages((prev) => [...prev, newMessage]);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error("Something went wrong. Please try again later.");
    }
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="w-[min(95%,650px)] flex flex-col gap-2">
      {messages.length > 0 && (
        <ScrollArea className="h-[220px] w-full py-1 px-3 sm:h-[250px]">
          {messages.map((message) => (
            <div key={message.id} className="w-fit flex flex-col gap-1 mb-2">
              {message.role === "user" ? (
                <div className="select-none flex items-center gap-1 text-sm text-muted-foreground">
                  <User strokeWidth="1.5" className="w-5 aspect-square" />
                  <span>You</span>
                </div>
              ) : (
                <div className="select-none flex items-center gap-1 text-sm ">
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
                  "flex flex-col gap-1 rounded-lg rounded-tl-[3px] ml-6 border max-h-32",
                  message.role === "user"
                    ? "bg-secondary/60"
                    : "bg-primary/20 border-primary/30"
                )}
              >
                <p className="text-xs rounded-none px-4 py-1.5 md:text-sm">
                  {message.content}
                </p>
              </ScrollArea>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-1 text-sm pb-4">
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
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="w-full relative flex items-center">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="Which technologies do you use?"
                      {...field}
                      disabled={loading}
                      className="w-full text-xs md:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                      "rounded-lg bg-transparent text-muted-foreground p-0 h-9 w-9 hover:bg-secondary"
                    )}
                    type="submit"
                    disabled={loading}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send question</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs rounded-sm">
                  Send question
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default ChatBot;
