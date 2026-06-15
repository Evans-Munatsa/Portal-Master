import Link from "next/link";
import { ArrowRight, Briefcase, FileCheck, Globe, Shield, Sparkles } from "lucide-react";
import LaunchPathLogo from "@/components/LaunchPathLogo";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LaunchPathLogo variant="full" />
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-[#7145FF] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#5b32e6] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-950/40 rounded-full border border-violet-100 dark:border-violet-900 mb-6">
                <Sparkles className="w-4 h-4 text-[#7145FF]" />
                <span className="text-xs font-semibold text-[#7145FF] dark:text-violet-300">
                  Next-Gen Recruitment Platform
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-[1.15] mb-6 tracking-tight">
                Launching Careers, <br />
                <span className="text-[#7145FF] bg-gradient-to-r from-[#7145FF] to-[#F7AFF0] bg-clip-text text-transparent">Connecting Talent</span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-normal">
                Optimize your placement velocity. LaunchPath pairs candidates with top employers using high-fidelity 
                AI Job Readiness Credentials and video response assessment tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?type=talent"
                  className="bg-[#7145FF] text-white px-8 py-4 rounded-full font-bold hover:bg-[#5b32e6] transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
                >
                  Find Work <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register?type=client"
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 px-8 py-4 rounded-full font-semibold hover:border-[#7145FF] dark:hover:border-[#7145FF] transition-all flex items-center justify-center gap-2 text-lg"
                >
                  Hire Talent
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-lg">
                  <Shield className="w-4 h-4 text-[#7145FF]" />
                  <span>Verified Credentials</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-lg">
                  <FileCheck className="w-4 h-4 text-[#23F5F0]" />
                  <span className="dark:text-slate-300">AI Readiness Benchmarks</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3.5 py-1.5 rounded-lg">
                  <Globe className="w-4 h-4 text-[#F7AFF0]" />
                  <span>Interactive Streams</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#7145FF] rounded-[2rem] transform rotate-3 opacity-10"></div>
              <div className="absolute inset-0 bg-[#23F5F0] rounded-[2rem] transform -rotate-3 opacity-10"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-xl p-8">
                <div className="space-y-6">
                  {/* Mock UI Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 border border-slate-100 dark:border-slate-800/60 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-[#7145FF] dark:text-violet-300 font-bold text-lg flex-shrink-0 border border-violet-200 dark:border-violet-900">
                      JN
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Jane Ndebele</h3>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                          96% Ready
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Senior Frontend Developer • Cape Town</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">React</span>
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">TypeScript</span>
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">Next.js</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 border border-slate-100 dark:border-slate-800/60 flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#23F5F0]/10 flex items-center justify-center text-[#120A2B] dark:text-[#23F5F0] font-bold text-lg flex-shrink-0 border border-cyan-200 dark:border-cyan-900/45">
                      AK
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Adekunle King</h3>
                        <span className="text-[10px] font-mono font-bold text-[#7145FF] bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-900">
                          92% Ready
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">UX/UI Designer • Cape Town</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">Figma</span>
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 font-medium">User Research</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
