"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CopyToClipboard from "react-copy-to-clipboard";

const EMAIL = "marcosfitzsimons@gmail.com";

const MailButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const handleIsCopied = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <Tooltip>
      <Popover>
        <div className="relative transition-colors after:pointer-events-none after:absolute after:inset-px after:rounded-[15.5px] after:shadow-highlight after:shadow-gray-300/20 after:transition-colors focus-within:after:shadow-gray-300/50">
          <TooltipTrigger asChild>
            <PopoverTrigger className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary/40 hover:text-white">
              <Mail className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
            </PopoverTrigger>
          </TooltipTrigger>
        </div>
        <PopoverContent side="top">
          <div className="flex flex-col">
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              <Mail className="h-4 w-4" />
              Send me an email
            </a>
            <CopyToClipboard text={EMAIL}>
              <button
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                onClick={handleIsCopied}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy email address
                  </>
                )}
              </button>
            </CopyToClipboard>
          </div>
        </PopoverContent>
      </Popover>
      <TooltipContent>Get in touch</TooltipContent>
    </Tooltip>
  );
};

export default MailButton;
