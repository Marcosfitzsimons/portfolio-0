interface SocialLinkProps {
  children: React.ReactNode;
  href: string;
}

const SocialLink = ({ children, href }: SocialLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      className="bg-card relative rounded-full transition-colors after:absolute after:pointer-events-none after:inset-px after:rounded-full after:shadow-highlight after:transition-colors  after:shadow-gray-300/20  focus-within:after:shadow-gray-300/50 hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </a>
  );
};

export default SocialLink;
