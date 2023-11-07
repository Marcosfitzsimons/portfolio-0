import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Blob from "@/components/blob";

export const metadata: Metadata = {
  title: "Portfolio - Marcos Fitzsimons",
  description: "Portfolio web...",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} relative overflow-x-hidden mx-auto w-[min(95%,650px)] flex flex-col items-center justify-center`}
      >
        <Header />
        <div className="w-full">{props.children}</div>
        <Footer />
        <span className="fixed right-2 bottom-2 text-xs text-muted-foreground transition-colors hover:text-white">
          Made w. 🤍 by Marcos Fitzsimons
        </span>
        <Blob />
      </body>
    </html>
  );
}
