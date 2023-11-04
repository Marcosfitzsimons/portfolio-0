import type { Metadata } from "next";
import { GeistSans } from "geist/font";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Portfolio - Marcos Fitzsimons",
  description: "Portfolio web...",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${GeistSans.className} mx-auto w-[min(95%,650px)]`}>
        <Header />
        {props.children}
        <Footer />
        <span className="fixed right-2 bottom-2 text-xs text-muted-foreground transition-colors hover:text-white">
          Made w. 🤍 by Marcos Fitzsimons
        </span>
      </body>
    </html>
  );
}
