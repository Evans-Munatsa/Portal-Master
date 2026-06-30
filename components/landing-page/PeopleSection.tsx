"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Target, Zap, Users, Heart, ArrowRight, Trophy,
  Search, UserX, Clock, AlertCircle, EyeOff, Frown,
} from "lucide-react";
import { Reveal } from "./Reveal";

const positives = [
  { icon: Target, title: "Better matches", body: "Skills-based screening means SMEs meet candidates who can actually do the job from day one." },
  { icon: Zap, title: "Faster hiring", body: "Curated shortlists in days, not months — without sacrificing quality or fit." },
  { icon: Users, title: "Real opportunity", body: "Graduates get access to roles that go beyond CV filters and old-school networks." },
  { icon: Heart, title: "Mentor support", body: "Every placement gets onboarding tools and mentor pairing for a stronger first year." },
  { icon: ArrowRight, title: "Long-term retention", body: "Better matching plus structured onboarding means hires actually stick around." },
  { icon: Trophy, title: "Real impact", body: "Every successful placement chips away at South Africa's youth unemployment crisis." },
];

const negatives = [
  { icon: Search, title: "Endless CV piles", body: "Drowning in applications with no clear way to spot real talent or potential." },
  { icon: UserX, title: "Wrong-fit hires", body: "Hiring on gut feel leads to costly mistakes and high early-stage turnover." },
  { icon: EyeOff, title: "Hidden talent", body: "Graduates outside traditional networks get overlooked, no matter how capable." },
  { icon: Frown, title: "Poor onboarding", body: "First-jobbers thrown in the deep end churn out before they ever hit their stride." },
  { icon: Clock, title: "Slow processes", body: "Months-long hiring cycles burn out SMEs and lose the best graduates to competitors." },
  { icon: AlertCircle, title: "No support", body: "Without mentorship, graduates struggle and SMEs don't see ROI on the hire." },
];

export const PeopleSection = () => {
  const [on, setOn] = useState(true);
  const items = on ? positives : negatives;

  return (
    <section className="bg-page px-6 py-20 md:py-28">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="grid gap-10 pb-12 md:grid-cols-2 md:items-end">
            <h2 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[44px] font-bold leading-[1.05] text-foreground md:text-[64px]">
              <span>When SMEs</span>
              <span className={`transition-colors duration-500 ${!on ? "text-foreground" : "text-foreground/30"}`}>don't</span>
              <button
                onClick={() => setOn(!on)}
                role="switch"
                aria-checked={on}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-500 ${on ? "bg-emerald-600 shadow-[0_0_30px_-5px_rgba(5,150,105,0.5)]" : "bg-foreground/20"}`}
              >
                <span
                  className={`inline-block h-9 w-9 transform rounded-full bg-white shadow transition-all duration-500 ${on ? "translate-x-12" : "translate-x-1"}`}
                />
              </button>
              <span className={`transition-colors duration-500 ${on ? "text-foreground" : "text-foreground/30"}`}>do</span>
              <span>hire with us.</span>
            </h2>
            <div className="flex flex-col items-start gap-6 md:items-end">
              <p className="max-w-[420px] text-[16px] leading-relaxed text-foreground/70 md:text-right">
                Toggle to see the difference between traditional graduate hiring and the LaunchPath way.
              </p>
              {/* Fixed: Swapped 'to="/about-us"' with 'href="/about-us"' */}
              <Link
                href="/about-us"
                className="shine rounded-full bg-foreground px-7 py-3.5 text-[15px] font-semibold text-background transition-all duration-300 hover:scale-[1.04]"
              >
                <span className="relative z-10">About Us</span>
              </Link>
            </div>
          </div>
        </Reveal>

        <div key={on ? "pos" : "neg"} className="grid gap-6 md:grid-cols-3">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white p-7 ring-1 ring-foreground/10 hover-lift animate-[fade-in-up_.5s_ease-out_both]"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${on ? "bg-emerald-600/10 text-emerald-700" : "bg-foreground/5 text-foreground/40"}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-[18px] font-bold text-foreground">{it.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-foreground/70">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
