"use client";

import Link from "next/link";
import Image from "next/image"; // Optimized Image utility
import { GraduationCap, Briefcase, Target, Rocket, Users } from "lucide-react";
import o1 from "@/assets/models/models1.jpg";
import o2 from "@/assets/models/models2.jpg";
import o3 from "@/assets/models/models3.jpg";
import { Reveal } from "./Reveal";

const cards = [
  { img: o1, title: "We vet", desc: "Every candidate is screened by a real person, not just an algorithm. We check skills, attitude, communication, and readiness to work.", tag: "Graduate-first", icon: GraduationCap },
  { img: o2, title: "We Match", desc: "You tell us what you actually need. We send a shortlist of candidates who fit — usually within five working days.", tag: "SME-friendly", icon: Briefcase },
  { img: o3, title: "We make it affodable", desc: " Our pricing is built for SMEs, not corporate recruitment budgets.", tag: "Skills-matched", icon: Target },
];

export const OfferSection = () => {
  return (
    <section id="what-we-do" className="bg-page px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 pb-10 md:flex-row md:items-end">
            <div className="max-w-[640px]">
              <h2 className="text-[40px] font-bold leading-[1.1] text-foreground md:text-[52px]">A simpler way to hire junior talent.</h2>
              <p className="mt-5 text-[16px] leading-relaxed text-foreground/70">
                LaunchPath is a recruitment platform built for South African employers who need to hire well without burning weeks doing it. We do three things, and we do them properly:
              </p>
            </div>
            
            {/* Fixed: Swapped 'to="/contact"' with 'href="/contact"' */}
            <Link
              href="/contact"
              className="shine group rounded-full bg-foreground px-7 py-3.5 text-[15px] font-semibold text-background transition-all duration-300 hover:scale-[1.04] hover:shadow-lg"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Request Candidates
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal as="article" key={i} delay={i * 80}>
                <div
                  className="group relative h-full overflow-hidden rounded-3xl hover-lift cursor-pointer"
                  style={{ aspectRatio: "1/1" }}
                >
                  {/* Optimized Next.js Image Integration */}
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="image-zoom absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/90" />
                  <span className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-foreground transition-transform duration-300 group-hover:-translate-y-1">
                    <Icon className="h-4 w-4" />
                    {c.tag}
                  </span>
                  <div className="absolute bottom-5 left-5 right-32 text-white transition-transform duration-500 group-hover:-translate-y-1">
                    <h3 className="text-[20px] font-bold">{c.title}</h3>
                    <p className="mt-1 text-[14px] text-white/85">{c.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
