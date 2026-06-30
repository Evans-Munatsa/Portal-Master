"use client";
import { useState } from "react";
import Image from "next/image"; // Optimized Image utility
import Link from "next/link";  // Clean Next Router mapping
import { Phone, Mail } from "lucide-react";
import contactImg from "@/assets/models/models1.jpg";

const ContactField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[13px] font-medium text-white">{label}</label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-2xl bg-dark-input px-5 py-4 text-[15px] text-white placeholder:text-dark-muted outline-none ring-1 ring-dark-border focus:ring-white/60 focus:scale-[1.01] transition-all duration-300";

export const ContactFooter = () => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    employees: "",
    message: "",
  });

  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <section id="contact" className="bg-page px-4 py-10 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-[#5D3FD3] text-dark-foreground">
        <div className="grid gap-10 p-6 md:grid-cols-2 md:gap-12 md:p-10">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Optimized Next.js Image Replacement */}
            <Image
              src={contactImg}
              alt="Aerial view of office"
              fill
              sizes="(max-w-768px) 100vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" aria-hidden />
            <div className="relative flex h-full min-h-[520px] flex-col justify-between p-8 md:p-10">
              <h2 className="max-w-[440px] text-[32px] font-bold leading-[1.15] text-white md:text-[40px]">
                Tell us about your team — we'll line up your next great hire.
              </h2>
              <div className="space-y-4">
                <p className="text-[15px] font-medium text-white">Or reach us directly:</p>
                <a href="tel:+27115550199" className="flex items-center gap-3 text-[20px] font-medium text-white transition-transform duration-300 hover:translate-x-1 md:text-[22px]">
                  <Phone className="h-5 w-5" />
                  +27 11 555 0199
                </a>
                <a href="mailto:hello@launchpath.co.za" className="flex items-center gap-3 text-[20px] font-medium text-white transition-transform duration-300 hover:translate-x-1 md:text-[22px]">
                  <Mail className="h-5 w-5" />
                  hello@launchpath.co.za
                </a>
              </div>
              
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5 p-2 md:p-6">
            <div className="grid grid-cols-2 gap-5">
              <ContactField label="Name">
                <input className={inputClass} placeholder="Jane Smith" value={form.name} onChange={handle("name")} />
              </ContactField>
              <ContactField label="Phone">
                <input className={inputClass} placeholder="Phone" value={form.phone} onChange={handle("phone")} />
              </ContactField>
            </div>

            <ContactField label="Email">
              <input type="email" className={inputClass} placeholder="Email" value={form.email} onChange={handle("email")} />
            </ContactField>

            <div className="grid grid-cols-2 gap-5">
              <ContactField label="Location">
                <select className={`${inputClass} appearance-none`} value={form.location} onChange={handle("location")}>
                  <option value="">Select</option>
                  <option>Johannesburg</option>
                  <option>Cape Town</option>
                  <option>Durban</option>
                  <option>Pretoria</option>
                  <option>Remote</option>
                </select>
              </ContactField>
              <ContactField label="Number of employees">
                <input type="number" min={1} className={inputClass} placeholder="1" value={form.employees} onChange={handle("employees")} />
              </ContactField>
            </div>

            <ContactField label="Message">
              <textarea rows={4} className={`${inputClass} rounded-2xl resize-none`} placeholder="Message" value={form.message} onChange={handle("message")} />
            </ContactField>

            <button type="submit" className="shine group mt-3 w-full rounded-full bg-white py-4 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.4)]">
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                Find my next hire
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </button>
          </form>
        </div>

        {/* Updated all footer redirect arrays to native Next.js Link parameters */}
        <div className="flex flex-col gap-4 border-t border-dark-border px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[15px] text-white">
            <li><Link href="/" className="hover:text-dark-muted">Homepage</Link></li>
            <li><Link href="/what-we-do" className="hover:text-dark-muted">Services</Link></li>
            <li><Link href="/about-us" className="hover:text-dark-muted">About us</Link></li>
            <li><Link href="/contact" className="hover:text-dark-muted">Contact</Link></li>
          </ul>
          <ul className="flex gap-8 text-[15px] text-white">
            <li><Link href="/privacy" className="hover:text-dark-muted">Privacy Made</Link></li>
            <li><Link href="/terms" className="hover:text-dark-muted">Terms</Link></li>
          </ul>
        </div>
      </div>
    </section>
  );
};
