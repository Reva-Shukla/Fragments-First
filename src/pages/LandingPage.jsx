import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Heart, 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  FileText, 
  Fingerprint
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <nav className="landing-nav">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#294D6B] to-[#172D46] border border-[#C5A77B]/60 flex items-center justify-center text-[#C5A77B] shadow-sm">
            <Heart className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="font-brand text-xl font-bold tracking-tight text-white">Fragment First</span>
            <span className="hidden sm:inline-block ml-3 font-mono text-[10px] text-[#C5A77B] tracking-wider uppercase">
              Trauma-Informed Incident Documentation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/victim/login" className="btn btn-ghost btn-sm" id="landing-login-btn">
            Victim Sign In
          </Link>
          <Link to="/victim/register" className="btn btn-rose btn-sm" id="landing-register-btn">
            Begin Safely
          </Link>
          <Link 
            to="/authority/login" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-[#E8E4DC] transition-all"
            id="landing-authority-nav-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A77B]" />
            <span>Authority Portal</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero relative z-10">
        <div className="hero-badge">
          <Lock className="w-3.5 h-3.5 text-[#C5A77B]" />
          <span>Private · Trauma-Informed · AI-Assisted Narrative Synthesis</span>
        </div>

        <h1 className="hero-title">
          Your words matter.
          <br />
          <span className="gradient-word">Even the broken ones.</span>
        </h1>

        <p className="hero-desc">
          Fragment First is a secure, dignity-first space where you can share what happened — in pieces,
          in your own time, in your own words. AI helps reconstruct fragmented memories into coherent narratives,
          but you always stay in complete control of what is finalized.
        </p>

        <div className="hero-actions">
          <Link to="/victim/register" className="btn btn-rose btn-lg" id="hero-get-started-btn">
            <span>Begin Safely</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link to="/victim/login" className="btn btn-ghost btn-lg" id="hero-signin-btn">
            Sign In to My Space
          </Link>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="notice notice-muted max-w-lg text-left shadow-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A77B] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#172D46] font-semibold">Honest Privacy Guarantee:</strong>
                <span className="text-xs text-[#5E7A91] block mt-0.5 leading-relaxed">
                  Your drafts remain strictly private. Display identities are pseudonymous aliases, and no unapproved reconstructions are ever transmitted to authorities.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Entry Cards — Two Unified Doors */}
      <div className="hero-cards relative z-10">
        {/* Victim Door */}
        <Link to="/victim/register" className="entry-card victim-card group" id="landing-victim-card">
          <div className="entry-card-icon">
            <Heart className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="entry-card-title flex items-center justify-between">
            <span>I need to share something</span>
            <ArrowRight className="w-5 h-5 text-[#294D6B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="entry-card-desc">
            Submit fragmented thoughts, incomplete memories, or audio recordings in a calm, non-interrogative environment. AI reconstructs clear narratives with your explicit review and approval.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-blue">Private Space</span>
            <span className="badge badge-amber">Self-Paced</span>
          </div>
        </Link>

        {/* Authority Door */}
        <Link to="/authority/login" className="entry-card authority-card group" id="landing-authority-card">
          <div className="entry-card-icon">
            <Fingerprint className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="entry-card-title flex items-center justify-between">
            <span>I am an investigator</span>
            <ArrowRight className="w-5 h-5 text-[#C5A77B] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="entry-card-desc">
            Access the official multi-agency investigation authority to review approved statements, cross-verify claims against SCADA/CAD telemetry, and generate forensic evidentiary dockets.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="badge badge-amber">Official Personnel</span>
            <span className="badge badge-blue">CJIS Compliant</span>
          </div>
        </Link>
      </div>

      {/* Footer Principles */}
      <footer className="relative z-10 border-t border-[#D8D2C6]/80 bg-white/70 backdrop-blur-md py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 text-xs text-[#5E7A91]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A77B]" />
            <span className="font-medium text-[#172D46]">No credibility scoring — ever</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#294D6B]" />
            <span className="font-medium text-[#172D46]">Original words preserved verbatim</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E6B52]" />
            <span className="font-medium text-[#172D46]">You approve before finalization</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#C5A77B]" />
            <span className="font-medium text-[#172D46]">AI assists, humans decide</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
