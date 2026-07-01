"use client";

import Link from "next/link";
import Image from "next/image"; // Optimized Image integration
import bg from "@/assets/testimonial-bg.jpg";
import avatar from "@/assets/avatar-thomas.jpg";
import { Reveal } from "./Reveal";

export const TestimonialSection = () => {
  return (
    <section className="bg-page px-4 py-10 md:px-8 md:py-16">
      <Reveal>
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] group">
          {/* Optimized Background Image */}
          <Image 
            src={bg} 
            alt="" 
            fill
            sizes="100vw"
            className="image-zoom absolute inset-0 h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-emerald-900/30" />
          
          <div className="relative grid gap-12 p-10 md:grid-cols-2 md:p-16">
            <div className="flex flex-col justify-between gap-12">
              <h2 className="text-[40px] font-bold leading-[1.05] text-white md:text-[56px]">
                What SMEs and graduates say about LaunchPath
              </h2>
              <div>
                {/* Fixed: Swapped 'to="/contact"' with 'href="/contact"' */}
                <Link
                  href="/contact"
                  className="shine inline-block rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.04]"
                >
                  <span className="relative z-10">Start hiring</span>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col gap-8 text-white">
              <svg viewBox="0 0 80 80" className="h-12 w-12 opacity-90 animate-[float_6s_ease-in-out_infinite]" aria-hidden>
                <circle cx="40" cy="40" r="38" stroke="white" strokeWidth="2" fill="none" />
                <path d="M28 44c0-8 6-14 14-14M40 44c0-8 6-14 14-14" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <blockquote className="text-[18px] leading-[1.6] text-white md:text-[20px]">
              {"\"We hired three graduates through LaunchPath in under six weeks. The matching was sharp, the screening saved us hours, and every single one is still with us a year later. It's the best hiring decision we've made as a small team.\""}
            </blockquote>

              
              <div className="flex items-center gap-4">
                {/* Optimized Avatar Image Layout */}
                <Image 
                  src={avatar} 
                  alt="Naledi Mokoena" 
                  width={56} 
                  height={56} 
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/30" 
                />
                <div>
                  <p className="text-[16px] font-bold">Naledi Mokoena</p>
                  <p className="text-[14px] text-white/80">Founder, Veld Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
