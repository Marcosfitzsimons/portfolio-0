import ChatBot from "@/components/chat-bot";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import SocialLinks from "@/components/social-links";
import { sora } from "@/components/fonts";
import { User } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="flex w-full flex-col items-center gap-1 py-16 md:gap-3 md:py-32">
        <div className="flex flex-col items-center duration-700 animate-in fade-in slide-in-from-bottom-4">
          <h1 className={`${sora.className} font-semibold lg:text-2xl`}>
            Marcos Fitzsimons
          </h1>
          <h2 className={`${sora.className} text-2xl font-bold lg:text-4xl`}>
            Full Stack Developer
          </h2>
        </div>

        <div
          className="duration-700 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "150ms" }}
        >
          <SocialLinks />
        </div>

        <div
          className="flex items-center gap-3 py-10 duration-700 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "300ms" }}
        >
          <PrimaryButton />
          <SecondaryButton
            href="/about"
            icon={<User className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.3} />}
          >
            About me
          </SecondaryButton>
        </div>

        <div
          className="w-full duration-700 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: "450ms" }}
        >
          <ChatBot />
        </div>
      </div>
    </main>
  );
}
