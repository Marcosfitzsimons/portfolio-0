import SocialLink from "@/components/social-link";
import { FileDown, Github, Linkedin } from "lucide-react";
import MailButton from "./mail-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SocialLinks = () => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <SocialLink
              href="https://github.com/Marcosfitzsimons"
              aria-label="View Marcos Fitzsimons on GitHub"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                aria-hidden="true"
              >
                <Github className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </span>
            </SocialLink>
          </TooltipTrigger>
          <TooltipContent>View my GitHub profile</TooltipContent>
        </Tooltip>
        <MailButton />
        <Tooltip>
          <TooltipTrigger asChild>
            <SocialLink
              href="https://www.linkedin.com/in/marcos-fitzsimons-70a010208/"
              aria-label="View Marcos Fitzsimons on LinkedIn"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                aria-hidden="true"
              >
                <Linkedin className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </span>
            </SocialLink>
          </TooltipTrigger>
          <TooltipContent>{"Let's connect"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <SocialLink href="/cv.pdf" download aria-label="Download CV">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                aria-hidden="true"
              >
                <FileDown className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </span>
            </SocialLink>
          </TooltipTrigger>
          <TooltipContent>Download my CV</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default SocialLinks;
