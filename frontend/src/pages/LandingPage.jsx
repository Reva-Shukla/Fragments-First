import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="sidebar-brand-name" style={{ fontSize: '20px' }}>Fragment First</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/victim/login" className="btn btn-ghost btn-sm" id="landing-login-btn">Sign In</Link>
          <Link to="/victim/register" className="btn btn-primary btn-sm" id="landing-register-btn">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span>🔒</span>
          <span>Private · Trauma-Informed · AI-Assisted</span>
        </div>

        <h1 className="hero-title">
          Your words matter.
          <br />
          <span className="gradient-word">Even the broken ones.</span>
        </h1>

        <p className="hero-desc">
          Fragment First is a private space where you can share what happened — in pieces,
          in your own time, in your own words. AI helps make sense of the fragments, but
          you always stay in control.
        </p>

        <div className="hero-actions">
          <Link to="/victim/register" className="btn btn-primary btn-lg" id="hero-get-started-btn">
            Begin Safely
          </Link>
          <Link to="/victim/login" className="btn btn-ghost btn-lg" id="hero-signin-btn">
            Sign In
          </Link>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div className="notice notice-muted" style={{ maxWidth: '500px', textAlign: 'left' }}>
            <strong style={{ color: 'var(--white-dim)' }}>Privacy note:</strong> Your account is linked
            to your contact information for verification purposes, but your display identity is
            a private alias you choose. No identifying information is shown publicly.
          </div>
        </div>
      </section>

      {/* Entry cards */}
      <div className="hero-cards" style={{ margin: '0 auto' }}>
        <Link to="/victim/register" className="entry-card victim-card" id="landing-victim-card">
          <div className="entry-card-icon cerulean">🧩</div>
          <div className="entry-card-title">I need to share something</div>
          <p className="entry-card-desc">
            Submit fragmented thoughts, incomplete memories, or voice recordings. AI helps
            reconstruct them into readable narratives — with your review and approval.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span className="badge badge-blue">Private Account</span>
            <span className="badge badge-muted">Your pace</span>
          </div>
        </Link>

        <Link to="/authority/login" className="entry-card authority-card" id="landing-authority-card">
          <div className="entry-card-icon rose">🔎</div>
          <div className="entry-card-title">I am an investigator</div>
          <p className="entry-card-desc">
            Access the authority dashboard to review statements, manage cases, run AI analysis,
            verify claims against evidence, and generate forensic reports.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span className="badge badge-rose">Authorized Personnel</span>
          </div>
        </Link>
      </div>

      {/* Footer principles */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 48px',
        display: 'flex',
        gap: '48px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 'auto',
      }}>
        {[
          { icon: '🚫', text: 'No credibility scoring — ever' },
          { icon: '🔒', text: 'Original words preserved forever' },
          { icon: '✋', text: 'You approve before anything is finalized' },
          { icon: '🧠', text: 'AI assists, humans decide' },
        ].map((p) => (
          <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--white-muted)' }}>
            <span>{p.icon}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
