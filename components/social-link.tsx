import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface SocialLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  href: string;
}

const SocialLink = forwardRef<HTMLAnchorElement, SocialLinkProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noreferrer"
        {...props}
        className="relative rounded-2xl bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors after:pointer-events-none after:absolute after:inset-px after:rounded-[15.5px] after:shadow-highlight after:shadow-gray-300/20  after:transition-colors focus-within:after:shadow-gray-300/50 hover:bg-secondary/40 hover:text-white"
      >
        {children}
      </a>
    );
  },
);

SocialLink.displayName = "SocialLink";

export default SocialLink;
