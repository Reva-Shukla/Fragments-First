import VictimLayout from '../../components/VictimLayout';

const SECTIONS = [
  {
    title: 'How Fragment First works',
    icon: '🧩',
    items: [
      'You write your account in your own words — fragments, incomplete sentences, approximate times, and partial memories are all valid.',
      'Your statement is saved exactly as you write it and never altered.',
      'You can save a private draft at any time and continue later. Drafts are never shared.',
      'When you are ready, you choose to submit. Only submitted statements are shared with authorised personnel.',
      'You always remain in control of what is shared and when.',
    ],
  },
  {
    title: 'What happens after you submit',
    icon: '📬',
    items: [
      'Your submitted statement is stored securely and associated with your case.',
      'Authorised investigators assigned to your case can access your submitted statements.',
      'An AI reconstruction may be generated to help investigators understand your account more clearly.',
      'You will be asked to review and approve any AI reconstruction before it is treated as final.',
      'You can request corrections to the AI version at any time.',
      'No case status updates or authority responses are displayed in this interface — this is your private space for documentation.',
    ],
  },
  {
    title: 'What AI does',
    icon: '🤖',
    items: [
      'AI helps reconstruct fragmented statements into readable narratives.',
      'It preserves all uncertainties, hesitations, and approximate times exactly as you expressed them.',
      'It marks unclear portions and highlights what could not be determined.',
      'It never invents information that was not in your original statement.',
      'It never scores credibility or assesses truthfulness.',
    ],
  },
  {
    title: 'What AI does NOT do',
    icon: '🚫',
    items: [
      'AI does not invent, guess at, or fabricate any facts.',
      'AI does not determine guilt, innocence, or credibility.',
      'AI does not make final decisions — all decisions are made by human investigators and legal professionals.',
      'AI reconstructions are never automatically submitted or finalized without your explicit approval.',
      'AI does not access your device, camera, microphone or location in the background.',
    ],
  },
  {
    title: 'Getting assistance',
    icon: '🤝',
    items: [
      'If you need human support, please speak with the legal professional or support worker who referred you to this platform.',
      'Fragment First is a documentation tool and does not provide legal advice, counselling, or emergency services.',
      'In an emergency, contact your local emergency services immediately.',
      'If you experience a technical problem, note the error message and contact the platform support contact provided by your case manager.',
    ],
  },
];

export default function HelpGuidance() {
  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">Help &amp; Guidance</h1>
        <p className="page-header-subtitle">
          Everything you need to know about how this platform works, what you can do, and what happens to your information.
        </p>
      </div>

      <div className="notice notice-cerulean" style={{ marginBottom: '32px' }}>
        <strong>You are in control.</strong> Nothing is shared without your knowledge.
        There is no time pressure. Take breaks whenever you need to.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SECTIONS.map((s) => (
          <div key={s.title} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)' }}>{s.title}</h2>
            </div>
            <ul className="info-list">
              {s.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '24px', borderColor: 'rgba(255,45,107,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>🆘</span>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)' }}>Emergency</h2>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--white-dim)' }}>
          If you are in immediate danger, <strong>do not use this platform — call emergency services</strong>.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--white-muted)', marginTop: '8px' }}>
          Fragment First is a documentation and communication tool. It cannot contact emergency services on your behalf.
        </p>
      </div>
    </VictimLayout>
  );
}
