import VictimLayout from '../../components/victim/VictimLayout';
import { 
  HeartHandshake, 
  Inbox, 
  Brain, 
  ShieldAlert, 
  PhoneCall,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'How Fragment First Works',
    icon: Sparkles,
    color: '#C5A77B',
    items: [
      'You write your account in your own words — fragments, incomplete sentences, approximate times, and partial memories are all valid.',
      'Your statement is saved exactly as you enter it and is never altered or overwritten.',
      'You can save a private draft at any time and return later. Drafts are never transmitted to authorities.',
      'When you feel ready, you choose to submit. Only submitted statements are shared with authorized personnel.',
      'You always remain in total control of what is finalized and shared.',
    ],
  },
  {
    title: 'What Happens After You Submit',
    icon: Inbox,
    color: '#294D6B',
    items: [
      'Your submitted statement is stored securely in an immutable chain-of-custody format associated with your case docket.',
      'Authorized investigators assigned to your case can access your submitted statements.',
      'An AI reconstruction may be generated to help investigators understand your account more clearly.',
      'You will be asked to review and approve any AI reconstruction before it is treated as final.',
      'You can request corrections or revisions to the AI version at any time.',
      'No case status updates or interrogative notifications are displayed in this interface — this remains your private sanctuary.',
    ],
  },
  {
    title: 'What AI Does',
    icon: Brain,
    color: '#C5A77B',
    items: [
      'AI assists by structuring fragmented statements into readable chronological narratives.',
      'It preserves all uncertainties, hesitations, and approximate times exactly as you expressed them.',
      'It explicitly marks unclear portions and highlights what could not be determined.',
      'It never invents or hallucinates facts that were not in your original statement.',
      'It never scores credibility, believability, or truthfulness.',
    ],
  },
  {
    title: 'What AI Does NOT Do',
    icon: ShieldAlert,
    color: '#9B2C2C',
    items: [
      'AI does not invent, extrapolate, or fabricate any facts or events.',
      'AI does not determine guilt, innocence, liability, or credibility.',
      'AI does not make judicial or investigative decisions — all determinations are made by human legal professionals.',
      'AI reconstructions are never automatically submitted or finalized without your explicit review and sign-off.',
      'AI does not access your device, microphone, camera, or location in the background.',
    ],
  },
  {
    title: 'Getting Human Assistance',
    icon: HeartHandshake,
    color: '#1E6B52',
    items: [
      'If you need human support, please speak with the support worker, victim advocate, or legal representative who provided access to this platform.',
      'Fragment First is a documentation tool and does not provide legal counsel, psychological therapy, or immediate emergency dispatch.',
      'In an urgent emergency, contact your local emergency services (911 or local equivalent) immediately.',
      'If you experience a technical error, note the reference number and contact your assigned case manager.',
    ],
  },
];

export default function HelpGuidance() {
  return (
    <VictimLayout>
      <div className="page-header">
        <h1 className="page-header-title">Help &amp; Guidance</h1>
        <p className="page-header-subtitle">
          Everything you need to know regarding platform boundaries, evidentiary integrity, and how your privacy is protected.
        </p>
      </div>

      <div className="notice notice-cerulean shadow-xs mb-8">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#294D6B] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-[#172D46] font-semibold text-sm">You are in complete control.</strong>
            <p className="text-[#5E7A91] mt-0.5 mb-0">
              Nothing is shared without your explicit authorization. There is no time limit and no penalty for pausing. Take breaks whenever you need to.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="card hover:border-[#C5A77B]/80 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs"
                  style={{
                    backgroundColor: `${s.color}15`,
                    borderColor: `${s.color}40`,
                    color: s.color
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-serif-clean text-base font-bold text-[#172D46] mb-0">
                  {s.title}
                </h2>
              </div>
              <ul className="info-list text-xs space-y-2">
                {s.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Emergency Notice Card */}
      <div className="card mt-6 bg-[#FDF0EE] border-[#E8B4B4] shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#E8B4B4] flex items-center justify-center text-[#9B2C2C]">
            <PhoneCall className="w-4 h-4" />
          </div>
          <h2 className="font-serif-clean text-base font-bold text-[#9B2C2C] mb-0">
            Immediate Crisis &amp; Emergency Notice
          </h2>
        </div>
        <p className="text-xs text-[#9B2C2C] font-semibold leading-relaxed mb-1">
          If you or someone else is in immediate danger, please do not use this documentation portal — contact emergency services (911, 999, 112, or local authorities) immediately.
        </p>
        <p className="text-[11px] text-[#5E7A91] mb-0">
          Fragment First is an incident narrative documentation system. It does not monitor live emergencies or dispatch emergency responders.
        </p>
      </div>
    </VictimLayout>
  );
}
