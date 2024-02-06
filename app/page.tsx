import ChatBot from "@/components/chat-bot";
import PrimaryButton from "@/components/primary-button";
import SecondaryButton from "@/components/secondary-button";
import SocialLinks from "@/components/social-links";
import { User } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      <div className="w-full py-16 flex flex-col items-center gap-1 md:gap-3 md:py-32">
        <div className="flex flex-col items-center">
          <h1 className="lg:text-2xl">Marcos Fitzsimons</h1>
          <h2 className="text-2xl lg:text-4xl">Front-End Developer</h2>
        </div>
        <SocialLinks />
        <div className="flex items-center gap-3 py-10">
          <PrimaryButton />
          <SecondaryButton
            href="/about"
            icon={<User className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.3} />}
          >
            About me
          </SecondaryButton>
        </div>
        <ChatBot />
      </div>
    </main>
  );
}
