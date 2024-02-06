import SocialLink from "@/components/social-link";
import { Mail, Linkedin, Github } from "lucide-react";
import CopyToClipboard from "react-copy-to-clipboard";
import MailButton from "./mail-button";

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-4">
      <SocialLink href="https://github.com/Marcosfitzsimons">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border">
          <Github className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
        </span>
      </SocialLink>
      <MailButton />
      <SocialLink href="https://www.linkedin.com/in/marcos-fitzsimons-70a010208/">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border">
          <Linkedin className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
        </span>
      </SocialLink>
    </div>
  );
};

export default SocialLinks;
