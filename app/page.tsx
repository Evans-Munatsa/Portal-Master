import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Briefcase, FileCheck, Globe, Shield, Sparkles } from "lucide-react";
import LaunchPathLogo from "@/components/LaunchPathLogo";

// new components
import heroImg from "@/assets/models/models1.jpg";
import { Header } from "@/components/landing-page/Header";
import { TeamSection } from "@/components/landing-page/TeamSection";
import { OfferSection } from "@/components/landing-page/OfferSection";
import { StrategySection } from "@/components/landing-page/StrategySection";
import { TestimonialSection } from "@/components/landing-page/TestimonialSection";
import { BrandsSection } from "@/components/landing-page/BrandsSection";
import { PeopleSection } from "@/components/landing-page/PeopleSection";
import { ContactFooter } from "@/components/landing-page/ContactFooter";
import { Reveal } from "@/components/landing-page/Reveal";

const PartnerLogo = ({ name, variant }: { name: string; variant: number }) => (
  <svg viewBox="0 0 160 28" className="h-6 w-auto transition-opacity duration-300 hover:opacity-100" aria-label={name}>
    {variant === 0 && <circle cx="14" cy="14" r="10" fill="none" stroke="white" strokeWidth="2" />}
    {variant === 1 && <rect x="4" y="4" width="20" height="20" rx="4" fill="none" stroke="white" strokeWidth="2" />}
    {variant === 2 && <path d="M4 22V6l10 16V6" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />}
    {variant === 3 && <path d="M14 4l10 18H4z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />}
    <text x="32" y="19" fill="white" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">{name}</text>
  </svg>
);

const Hero = () => (
  <section className="relative min-h-screen w-full overflow-hidden">
    {/* Optimized Next.js Image Component */}
    <Image 
      src={heroImg} 
      alt="Young graduates collaborating" 
      fill
      priority
      sizes="100vw"
      className="absolute inset-0 h-full w-full object-cover scale-110 animate-[fade-in_1.4s_ease-out_both]" 
    />
    
    <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/30" aria-hidden />

    {/* Floating ambient orbs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-[float_8s_ease-in-out_infinite]" />
      <div className="absolute right-10 top-1/4 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: "2s" }} />
    </div>

    <Header variant="light" />

    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-end px-6 pb-16 pt-40 md:px-14 md:pb-20">
      <div className="max-w-[900px] text-white">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90 backdrop-blur-sm ring-1 ring-white/20 animate-[fade-in-up_.7s_ease-out_both]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-[pulse-ring_2.4s_ease-out_infinite] rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span> 
          Tackling African youth unemployment
        </span>

        <h1 className="mt-6 text-[44px] leading-[1.05] font-bold sm:text-[58px] md:text-[68px]">
          <span className="block animate-[blur-in_.9s_cubic-bezier(.2,.7,.2,1)_both]">
            Hire graduates who are ready for real work
          </span>
        </h1>

        <p className="mt-8 max-w-[680px] text-[17px] leading-relaxed text-white/90 md:text-[18px] animate-[fade-in-up_.9s_ease-out_both]" style={{ animationDelay: "350ms" }}>
          LaunchPath helps South African companies hire vetted graduates and junior professionals in days, not months. We screen the people. You meet the ones who fit.
        </p>

        {/* Next.js Link updates */}
        <div className="mt-10 flex flex-wrap gap-4 animate-[fade-in-up_.9s_ease-out_both]" style={{ animationDelay: "500ms" }}>
          <Link href="/login" className="shine group inline-flex items-center gap-2 rounded-full bg-[#5D3FD3] px-9 py-4 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.5)]">
            <span className="relative z-10">Join as a Employer</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link href="/login" className="rounded-full bg-white/10 px-9 py-4 text-[15px] font-semibold text-white backdrop-blur-sm ring-1 ring-white/30 transition-all duration-300 hover:bg-white/20 hover:scale-[1.04]">
            Join as a Candidate
          </Link>
        </div>
      </div>

      <div className="mt-16 md:mt-24 animate-[fade-in_1.2s_ease-out_both]" style={{ animationDelay: "700ms" }}>
        <p className="text-[14px] font-medium text-white">Trusted by SMEs hiring across Cape Town, Joburg, Durban and remote teams nationally.</p>
      </div>
    </div>

    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/70">
      <span className="text-[11px] uppercase tracking-[0.3em]">Scroll</span>
      <span className="h-10 w-[1px] bg-gradient-to-b from-white/70 to-transparent animate-[float_2s_ease-in-out_infinite]" />
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
    <Hero />
    <Reveal as="section" step={0}><TeamSection /></Reveal>
    <Reveal as="section" step={1}><OfferSection /></Reveal>
    <Reveal as="section" step={1}><StrategySection /></Reveal>
    <Reveal as="section" step={1}><TestimonialSection /></Reveal>
    <Reveal as="section" step={1}><BrandsSection /></Reveal>
    <Reveal as="section" step={1}><PeopleSection /></Reveal>
    <Reveal as="section" step={1}><ContactFooter /></Reveal>
  </main>
  );
}
