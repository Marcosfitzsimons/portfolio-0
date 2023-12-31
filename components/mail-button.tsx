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
      <div className="relative transition-colors after:absolute after:pointer-events-none after:inset-px after:rounded-[15.5px] after:shadow-highlight after:transition-colors after:shadow-gray-300/20 focus-within:after:shadow-gray-300/50">
        <PopoverTrigger className="bg-secondary/50 backdrop-blur-sm text-secondary-foreground flex h-10 w-10 items-center justify-center rounded-2xl border transition-colors hover:bg-secondary/40 hover:text-white">
          <Mail className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
        </PopoverTrigger>
      </div>
      <PopoverContent side="top">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm">marcosfitzsimons@gmail.com</p>
          <CopyToClipboard text="marcosfitzsimons@gmail.com">
            <button
              className="p-1 rounded-md hover:bg-accent"
              onClick={handleIsCopied}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </CopyToClipboard>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MailButton;
