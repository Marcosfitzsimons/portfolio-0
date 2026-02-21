import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font";
import "./globals.css";
import Header from "@/components/header";
import Nav from "@/components/nav";
import Blob from "@/components/blob";

const GeometricBackground = dynamic(
  () => import("@/components/geometric-background"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: {
    template: "%s - Marcos Fitzsimons",
    default: "Portfolio - Marcos Fitzsimons",
  },
  description:
    "Explore a web developer's portfolio of elegant, user-centric websites showcasing creativity, functionality, and seamless user experiences",
  metadataBase: new URL("https://www.marcosfitzsimons.com.ar"),
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} relative mx-auto flex w-[min(95%,650px)] flex-col items-center justify-center overflow-x-hidden antialiased`}
      >
        <Header />
        <Nav />
        <div className="w-full">{props.children}</div>
        <span className="group fixed bottom-2 right-2 text-xs text-muted-foreground transition-colors hover:text-white">
          Made w. <span className="group-hover:animate-pulse">🤍</span> by
          Marcos Fitzsimons
        </span>
        <Blob />
        <GeometricBackground />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
