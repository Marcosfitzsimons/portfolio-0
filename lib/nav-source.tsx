import { FolderOpenDot, Home, User } from "lucide-react";

export const navLinks = [
  {
    name: "Works",
    icon: <FolderOpenDot className="w-5 h-5" />,
    href: "/works",
  },
  {
    name: "Home",
    icon: <Home className="w-5 h-5" />,
    href: "/",
  },
  {
    name: "Me",
    icon: <User className="w-5 h-5" />,
    href: "/about",
  },
];
