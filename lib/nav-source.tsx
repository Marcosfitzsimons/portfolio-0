import { FolderOpenDot, Home, User } from "lucide-react";

export const navLinks = [
  {
    name: "Works",
    icon: <FolderOpenDot className="h-5 w-5" />,
    href: "/works",
  },
  {
    name: "Home",
    icon: <Home className="h-5 w-5" />,
    href: "/",
  },
  {
    name: "Me",
    icon: <User className="h-5 w-5" />,
    href: "/about",
  },
];
