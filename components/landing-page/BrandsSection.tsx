"use client";

import Link from "next/link";
import Image from "next/image"; // Optimized Image utility
import yoga from "@/assets/testimonials/test1.jpg";
import hoodie from "@/assets/testimonials/test2.jpg";
import menswear from "@/assets/testimonials/test3.jpg";
import { Reveal } from "./Reveal";

const cases = [
  { img: yoga, title: "Thandi M.", desc: "From BCom grad to junior analyst at a Cape Town fintech." },
  { img: hoodie, title: "Sipho N.", desc: "Placed as a developer in a 12-person Joburg software SME." },
  { img: menswear, title: "Lerato K.", desc: "Started as marketing intern, now leading content for a DTC brand." },
];

export const BrandsSection = () => {
  return (
    <section className="bg-page px-6 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 pb-10 md:flex-row md:items-end">
            <div className="max-w-[640px]">
              <h2 className="text-[40px] font-bold leading-[1.1] text-foreground md:text-[52px]">
                Graduates we've helped <span className="text-gradient">launch</span>
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-foreground/70">
                Real careers, started with the right SME match. Here are a few graduates whose first job became a real launchpad.
              </p>
            </div>
            {/* Fixed: Swapped 'to="/what-we-do"' with 'href="/what-we-do"' */}
            <Link
              href="/what-we-do"
              className="shine rounded-full bg-foreground px-7 py-3.5 text-[15px] font-semibold text-background transition-all duration-300 hover:scale-[1.04]"
            >
              <span className="relative z-10">Hire a graduate</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {cases.map((c, i) => (
            <Reveal as="article" key={i} delay={i * 100}>
              <div className="group relative overflow-hidden rounded-3xl hover-lift" style={{ aspectRatio: "3/4" }}>
                {/* Optimized Next.js Image Integration */}
                <Image 
                  src={c.img} 
                  alt={c.title} 
                  fill
                  sizes="(max-w-768px) 100vw, 33vw"
                  className="image-zoom absolute inset-0 h-full w-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-foreground transition-transform duration-300 group-hover:-translate-y-1">
                  Graduate story
                </span>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                  <div className="text-white transition-transform duration-500 group-hover:-translate-y-1">
                    <h3 className="text-[20px] font-bold">{c.title}</h3>
                    <p className="mt-1 text-[14px] text-white/85">{c.desc}</p>
                  </div>
                  {/* Fixed: Swapped 'to="/about-us"' with 'href="/about-us"' */}
                  <Link 
                    href="/about-us" 
                    className="shrink-0 rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-foreground transition-transform duration-300 group-hover:scale-105"
                  >
                    Read
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
