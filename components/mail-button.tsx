"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CopyToClipboard from "react-copy-to-clipboard";

const MailButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const handleIsCopied = () => {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <Popover>
      <div className="relative transition-colors after:pointer-events-none after:absolute after:inset-px after:rounded-[15.5px] after:shadow-highlight after:shadow-gray-300/20 after:transition-colors focus-within:after:shadow-gray-300/50">
        <PopoverTrigger className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors hover:bg-secondary/40 hover:text-white">
          <Mail className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
        </PopoverTrigger>
      </div>
      <PopoverContent side="top">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm">marcosfitzsimons@gmail.com</p>
          <CopyToClipboard text="marcosfitzsimons@gmail.com">
            <button
              className="rounded-md p-1 hover:bg-accent"
              onClick={handleIsCopied}
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </CopyToClipboard>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MailButton;
