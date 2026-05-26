import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s - Marcos Fitzsimons",
    default: "Portfolio - Marcos Fitzsimons",
  },
  description:
    "Explore Marcos Fitzsimons' portfolio of full-stack, AI, cloud, and product work.",
  metadataBase: new URL("https://www.marcosfitzsimons.com.ar"),
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} relative min-h-screen overflow-x-hidden bg-[#050505] text-white antialiased`}
      >
        {props.children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
