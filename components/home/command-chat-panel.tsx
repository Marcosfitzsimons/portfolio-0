import PortfolioAgent from "@/components/portfolio-agent";
import { ShinyIcon, SPARKLES_SVG } from "@/components/shiny-text";
import StarBorder from "@/components/star-border";

export const CommandChatPanel = () => (
  <StarBorder
    as="section"
    color="#d7c8ff"
    speed="6s"
    thickness={2}
    className="block w-full"
    innerClassName="flex flex-col gap-5 p-5 text-left !border-[#2a2a2a] !bg-[#0f0f10] !bg-none"
  >
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
      <ShinyIcon
        svg={SPARKLES_SVG}
        size={14}
        speed={2.4}
        color="#a1a1aa"
        shineColor="#d7c8ff"
      />
      <span>ask marcos</span>
    </div>

    <div className="flex flex-col gap-2">
      <h2 className="text-balance text-2xl font-semibold leading-tight text-white">
        Skip the scroll. Just ask.
      </h2>
      <p className="text-sm leading-6 text-zinc-400">
        Trained on this portfolio. Ask about projects, stack, experience, or
        whether I am available for the next build.
      </p>
    </div>

    <PortfolioAgent />
  </StarBorder>
);
