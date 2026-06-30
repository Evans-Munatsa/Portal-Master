"use client";
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Briefcase, Target, Rocket, ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";

const items = [
  { icon: GraduationCap, title: "Graduate Matching", sub: "Vetted shortlists, ready to interview.", body: "We screen, assess, and shortlist graduates from across South Africa so you only meet people genuinely fit for the role and your team." },
  { icon: Briefcase, title: "SME Hiring Toolkit", sub: "Hire well, even with a lean team.", body: "Job templates, structured interview kits, and offer guidance that help small teams hire confidently without a full HR function." },
  { icon: Target, title: "Practical Skills Assessment", sub: "See ability, not buzzwords.", body: "Short, role-relevant tasks reveal how candidates actually think and work — fairer for graduates and more useful for SMEs." },
  { icon: Rocket, title: "Onboarding & Mentoring", sub: "Turn day one into a real career start.", body: "Onboarding frameworks and mentor pairings improve first-year retention and help graduates hit their stride faster." },
];

export const StrategySection = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-page px-6 pb-24 md:pb-32">
      <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2">
        <Reveal>
          <div className="md:sticky md:top-12 md:self-start">
            <h2 className="text-[40px] font-bold leading-[1.1] text-foreground md:text-[52px]">
              Hiring & growth options
            </h2>
            <p className="mt-5 max-w-[480px] text-[16px] leading-relaxed text-foreground/70">
              Whether you're making your first hire, building a graduate programme, or scaling an early team — we tailor support so you move faster, hire better, and keep your people.
            </p>
            {/* Fixed: Swapped 'to="/contact"' with 'href="/contact"' */}
            <Link
              href="/contact"
              className="shine group mt-8 inline-block rounded-full bg-foreground px-7 py-3.5 text-[15px] font-semibold text-background transition-all duration-300 hover:scale-[1.04]"
            >
              <span className="relative z-10">Talk to us</span>
            </Link>
          </div>
        </Reveal>

        <div className="space-y-5">
          {items.map((it, i) => {
            const Icon = it.icon;
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 80}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={`block w-full rounded-2xl bg-white p-6 text-left ring-1 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md ${
                    isOpen ? "ring-foreground/30 shadow-md" : "ring-foreground/10 hover:ring-foreground/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-500 ${isOpen ? "bg-foreground text-background ring-foreground" : "ring-foreground/15"}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[18px] font-bold text-foreground">{it.title}</h3>
                          <p className="mt-1 text-[15px] text-foreground/70">{it.sub}</p>
                        </div>
                        <ChevronDown
                          className={`mt-1 h-5 w-5 flex-shrink-0 text-foreground/50 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                      <div
                        className="grid transition-all duration-500 ease-out"
                        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <p className="mt-4 text-[15px] leading-relaxed text-foreground/70">{it.body}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
