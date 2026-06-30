"use client";

import Link from "next/link";
import Image from "next/image"; // Added for optimized static file rendering
import { usePathname } from "next/navigation"; 
import LaunchPathLogo from "../../assets/logo/launchpath.png";
import { useState } from "react";

export const Logo = ({ color = "white" }: { color?: string }) => {
  // Checks if the text color theme is white (on the dark hero image)
  const isLightText = color === "white";

  return (
    <Link href="/" className="group flex items-center" aria-label="LaunchPath home">
      <div className="relative h-[38px] sm:h-[46px] w-auto transition-all duration-500 group-hover:rotate-[-2deg] group-hover:scale-[1.03]">
        <Image
          src={LaunchPathLogo}
          alt="LaunchPath Logo"
          height={46} // High-res target height
          priority
          className={`h-full w-auto object-contain transition-all duration-300 ${
            isLightText ? "" : "brightness-95 contrast-125"
          }`}
        />
      </div>
    </Link>
  );
};

const navItems = [
  { label: "Home", href: "/" },
  { label: "What We Do", href: "/what-we-do" },
  { label: "About us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
];

interface HeaderProps {
  variant?: "light" | "dark";
}

export const Header = ({ variant = "light" }: HeaderProps) => {
  const pathname = usePathname();
  const onDark = variant === "light"; // light variant = on dark hero image

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-14 md:py-8">
        <Logo color={onDark ? "white" : "hsl(var(--foreground))"} />
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-6 py-3 text-[15px] font-medium transition ${
                  active
                    ? "bg-[#5D3FD3] text-white"
                    : onDark
                      ? "text-white/95 hover:text-white"
                      : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/register"
          className="shine group relative overflow-hidden rounded-full bg-[#5D3FD3] px-6 py-3 text-[15px] font-semibold text-white transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] md:px-7 md:py-3.5"
        >
          <span className="relative z-10">Visit Portal</span>
        </Link>
      </div>
    </header>
  );
};
