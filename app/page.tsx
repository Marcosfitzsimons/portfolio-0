import ChatBot from "@/components/chat-bot";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import { sora } from "@/components/fonts";
import { User } from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center gap-1 py-16 md:gap-3 md:py-32">
        <AnimatedContent direction="vertical" delay={0} className="flex flex-col items-center">
          <h1 className={`${sora.className} font-semibold lg:text-2xl`}>
            Marcos Fitzsimons
          </h1>
          <h2 className={`${sora.className} text-2xl font-bold lg:text-4xl`}>
            Full Stack Developer
          </h2>
        </AnimatedContent>

        <AnimatedContent direction="vertical" delay={0.15} className="flex items-center gap-3 py-10">
          <PrimaryButton />
          <SecondaryButton
            href="/about"
            icon={<User className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.3} />}
          >
            About me
          </SecondaryButton>
        </AnimatedContent>

        <AnimatedContent direction="vertical" delay={0.45} className="w-full">
          <ChatBot />
        </AnimatedContent>
      </div>
    </main>
  );
}
