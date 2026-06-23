"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud, FileText, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1 State
  const [name, setName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Step 2 State
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/candidate/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          professional_title: professionalTitle,
          experience_level: experienceLevel,
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          phone,
        }),
      });
      if (res.ok) setStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleResumeSubmit = async () => {
    if (!resumeFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const res = await fetch("/api/candidate/resume", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStep(3);
        setTimeout(() => {
          router.push("/candidate/dashboard");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Tracker */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 1 ? "bg-[#7145FF] text-white" : "bg-slate-200 text-slate-500"}`}
            >
              1
            </span>
            <span className={step >= 1 ? "text-[#7145FF]" : "text-slate-500"}>
              Profile Info
            </span>
          </div>
          <div className="w-12 h-px bg-slate-300"></div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 2 ? "bg-[#7145FF] text-white" : "bg-slate-200 text-slate-500"}`}
            >
              2
            </span>
            <span className={step >= 2 ? "text-[#7145FF]" : "text-slate-500"}>
              Upload Resume
            </span>
          </div>
          <div className="w-12 h-px bg-slate-300"></div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${step >= 3 ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}
            >
              3
            </span>
            <span className={step >= 3 ? "text-green-600" : "text-slate-500"}>
              AI Matching
            </span>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Welcome to LaunchPath
            </h2>
            <p className="text-slate-500 mb-6">
              Let&apos;s set up your candidate profile to find the best
              opportunities.
            </p>
            <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Professional Title
                </label>
                <input
                  required
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                >
                  <option>Junior (0-2 years)</option>
                  <option>Mid-Level (3-5 years)</option>
                  <option>Senior (5+ years)</option>
                  <option>Lead / Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  placeholder="e.g. +1 (555) 012-3456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  LinkedIn Profile URL (Optional)
                </label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  GitHub Profile URL (Optional)
                </label>
                <input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                  placeholder="https://github.com/username"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-2.5 rounded-lg font-medium hover:bg-[#5b32e6] transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Continue to Resume"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Resume */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Upload your Resume
            </h2>
            <p className="text-slate-500 mb-6">
              Our AI will instantly parse your skills and match you with active
              jobs.
            </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${isDragActive ? "border-[#7145FF] bg-violet-50" : "border-slate-300 hover:border-[#7145FF] bg-slate-50"}`}
            >
              <input {...getInputProps()} />
              {!resumeFile ? (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-[#7145FF] mb-4" />
                  <p className="text-slate-700 font-medium">
                    Drag & drop your PDF resume here
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    or click to browse files
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="w-12 h-12 text-blue-600 mb-4" />
                  <p className="text-slate-800 font-bold">{resumeFile.name}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to
                    change
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleResumeSubmit}
              disabled={!resumeFile || loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#7145FF] text-white py-2.5 rounded-lg font-medium hover:bg-[#5b32e6] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Loading..." : "Analyze and Match Jobs"}
            </button>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 3 && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Profile Complete!
            </h2>
            <p className="text-slate-500">
              Redirecting to your AI-powered job dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
