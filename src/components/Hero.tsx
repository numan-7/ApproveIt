import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

export default function Hero() {
  const { openSidebar } = useSidebar();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/image.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="container mx-auto lg:mx-16 px-4 relative z-20">
        <div className="max-w-3xl mx-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight tracking-tighter inline-block">
            Streamlining
            <br />
            <span className="inline-block">Approvals</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl">
            Transform your workflow with intelligent approval management. Get instant visibility and control.
          </p>
          <Button
            className="bg-white/95 text-lime-950 hover:bg-white/90 text-lg h-12 px-8 rounded-full group"
            onClick={openSidebar}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}