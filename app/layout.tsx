import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font";
import "./globals.css";
import Header from "@/components/header";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
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
        className={`${GeistSans.className} relative min-h-screen overflow-x-hidden antialiased`}
      >
        <div className="relative mx-auto flex w-[min(95%,750px)] flex-col items-center justify-center">
          <Header />
          <Nav />
          <div className="w-full pb-24">{props.children}</div>
          <Footer />
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
