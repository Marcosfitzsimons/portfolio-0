interface SocialLinkProps {
  children: React.ReactNode;
  href: string;
}

const SocialLink = ({ children, href }: SocialLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      className="relative rounded-2xl bg-secondary/50 text-secondary-foreground backdrop-blur-sm transition-colors after:pointer-events-none after:absolute after:inset-px after:rounded-[15.5px] after:shadow-highlight after:shadow-gray-300/20  after:transition-colors focus-within:after:shadow-gray-300/50 hover:bg-secondary/40 hover:text-white"
    >
      {children}
    </a>
  );
};

export default SocialLink;
