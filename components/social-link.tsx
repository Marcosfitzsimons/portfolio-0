interface SocialLinkProps {
  children: React.ReactNode;
  href: string;
}

const SocialLink = ({ children, href }: SocialLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      className="bg-secondary/50 backdrop-blur-sm text-secondary-foreground relative rounded-2xl transition-colors after:absolute after:pointer-events-none after:inset-px after:rounded-[15.5px] after:shadow-highlight after:transition-colors  after:shadow-gray-300/20 focus-within:after:shadow-gray-300/50 hover:bg-secondary/40 hover:text-white"
    >
      {children}
    </a>
  );
};

export default SocialLink;
