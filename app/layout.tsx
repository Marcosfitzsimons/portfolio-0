import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font";
import "./globals.css";
import Header from "@/components/header";
import Nav from "@/components/nav";
import SocialLinks from "@/components/social-links";
// import Blob from "@/components/blob";

// const GeometricBackground = dynamic(
//   () => import("@/components/geometric-background"),
//   { ssr: false },
// );

const LightPillar = dynamic(() => import("@/components/LightPillar"), {
  ssr: false,
});

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
        className={`${GeistSans.className} relative mx-auto flex w-[min(95%,750px)] flex-col items-center justify-center overflow-x-hidden antialiased`}
      >
        <Header />
        <Nav />
        <div className="w-full">{props.children}</div>
        <div className="fixed bottom-2 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-5">
          <SocialLinks />
          <span className="group text-xs text-muted-foreground transition-colors hover:text-white">
            Made w. <span className="group-hover:animate-pulse">🤍</span> by
            Marcos Fitzsimons
          </span>
        </div>
        {/* <Blob /> */}
        {/* <GeometricBackground /> */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -10,
            pointerEvents: "none",
          }}
        >
          <LightPillar
            topColor="#5227FF"
            bottomColor="#FF9FFC"
            intensity={1}
            rotationSpeed={0.3}
            glowAmount={0.002}
            pillarWidth={3}
            pillarHeight={0.4}
            noiseIntensity={0.5}
            pillarRotation={25}
            interactive={false}
            mixBlendMode="screen"
            quality="high"
          />
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
