/**
 * FRAGMENT FIRST - Synthetic Investigation Data
 * STRICTLY FOR AUTHORIZED INVESTIGATION DEMO & TRAINING PURPOSES
 * Multi-Agency Integration: 911 Dispatch, Police CAD, Metro CCTV, EMS, Hospital ER
 */

export const SYNTHETIC_CASES = [
  {
    id: "CASE-2026-8841",
    title: "Downtown Metro Station Plaza Incident - Armed Disturbance & Crushed Exit",
    incidentType: "Public Transit Emergency / Crowd Surge",
    jurisdiction: "Metro Transit Police & District 4 Central Command",
    leadInvestigator: "Det. Elena Vance (Badge #7492)",
    assignedTeam: ["Det. Elena Vance", "Forensic Tech Marcus Lin", "Counsel Rachel Stern"],
    dateOccurred: "2026-10-24T21:12:00Z",
    dateIntake: "2026-10-24T21:45:00Z",
    status: "Active Investigation", // Intake, Pending Review, Active Investigation, Verification Phase, Completed
    clearanceLevel: "RESTRICTED // LAW ENFORCEMENT SENSITIVE",
    priority: "HIGH",
    victimId: "VIC-8841-A",
    victimPseudonym: "Witness-A (J. Mercer)",
    summary: "At approximately 21:12 local time, an audible percussion shockwave inside Metro Station Central Plaza triggered a crowd surge toward West Concourse Exit 3. Victim sustained blunt impact trauma and claims emergency fire doors were electronically bolted from the outside. Corroboration across 5 municipal feeds reveals sequence of automated lock triggers vs. manual overrides.",
    
    // Page 4: Statement Review Data
    statements: {
      raw: `I was standing near the ticket kiosk at around 9:15 or maybe 9:18 when I heard a really loud blast near the center stairs. It didn't sound like fireworks, more like a metallic explosion. People started screaming and shoving toward the exit gates. I tried to push through West Exit Gate 3, but the red panic bars wouldn't budge. I saw two transit officers standing by the escalators who didn't open the gates; they were just shouting on their radios. A dark jacket guy pushed me down into the turnstile. I was stuck there for at least 15 minutes before the ambulance guys pulled me onto a stretcher. The fire alarm wasn't even ringing when the doors locked.`,
      
      aiReconstructed: `At approximately 21:12:40 (reconstructed from ticket validator logs), the individual was situated adjacent to Concourse Kiosk #4. An acoustic percussive event occurred at 21:13:05 originating 22 meters southwest at Escalator Bank B. The individual retreated west toward Emergency Exit Gate W-3. Egress was obstructed at 21:14:15 due to delayed magnetic release. Two Transit Police officers (Unit 402) were engaged in active threat containment at Escalator B from 21:13:50 to 21:16:30. A secondary physical impact occurred at 21:15:10 during crowd compaction. Emergency Medical Service Unit 12 arrived at station concourse at 21:24:20, administering care and initiating extraction at 21:27:00 (elapsed time ~12 minutes). Automated fire suppression alarm strobe initiated at 21:13:30.`,
      
      victimApproved: `At approximately 21:13, while at ticket kiosk #4, I heard a loud metallic bang near the stairs. Everyone surged toward West Gate 3. When I reached the gate, the door wouldn't open immediately despite people hitting the push bar. Two officers were visible near the escalators directing people away. During the crush, someone in a dark coat knocked me against the turnstile barrier. I waited on the ground until paramedics arrived around 9:25 PM. I confirm this accurately captures my sequence of experience.`,
      
      victimApprovalMetadata: {
        isApproved: true,
        approvedTimestamp: "2026-10-26T14:30:00Z",
        verifiedMethod: "Secure Legal Portal (Cryptographic MFA Token)",
        digitalSignature: "SIG-VIC8841-SHA256-4b89e21df90a",
      },
      
      versionHistory: [
        { version: "v1.0", author: "Emergency Intake Voice Transcript", date: "2026-10-24 22:15:00", notes: "Direct speech-to-text ingested via dispatch helpline" },
        { version: "v1.1", author: "FRAGMENT AI Chrono-Aligner", date: "2026-10-25 03:10:00", notes: "Multi-feed cross-referencing with ticket telemetry and CAD logs" },
        { version: "v1.2", author: "Det. Elena Vance", date: "2026-10-25 11:20:00", notes: "Investigator clarified kiosk identifier & unit dispatch numbers" },
        { version: "v2.0", author: "Victim (Witness-A)", date: "2026-10-26 14:30:00", notes: "Official victim review & legal concurrence with verified amendments" }
      ],

      // Diff elements between raw and AI reconstruction
      phraseAnalysis: [
        {
          type: "unclear",
          original: "around 9:15 or maybe 9:18",
          reconstructed: "At approximately 21:12:40",
          explanation: "Initial witness estimate diverged by ~3-5 minutes. Reconstructed precisely via Ticket Kiosk #4 tap-in telemetry at 21:12:38.",
          status: "Resolved by Telemetry"
        },
        {
          type: "change",
          original: "metallic explosion",
          reconstructed: "acoustic percussive event",
          explanation: "Standardized objective terminology. Acoustic sensors recorded a high-pressure CO2 canister rupture from maintenance cart, not high explosives.",
          status: "Forensically Corroborated"
        },
        {
          type: "unclear",
          original: "red panic bars wouldn't budge",
          reconstructed: "Egress obstructed due to delayed magnetic release",
          explanation: "Fire door controller logs show fail-safe magnetic latch held for 42 seconds after alarm trip due to uncalibrated failsafe relay.",
          status: "Mechanically Verified"
        },
        {
          type: "missing",
          original: "two transit officers didn't open the gates",
          reconstructed: "Two Transit Police officers (Unit 402) engaged in active threat containment",
          explanation: "Missing context in raw statement: Officers were 35m away establishing protective perimeter against suspected shooter, unable to physically reach gate W-3.",
          status: "CAD & Bodycam Corroborated"
        },
        {
          type: "change",
          original: "stuck there for at least 15 minutes",
          reconstructed: "elapsed extraction time ~12 minutes",
          explanation: "Trauma time dilation accounted for; EMS arrived at concourse at 21:24:20 and packaged patient at 21:27:00.",
          status: "EMS CAD Corroborated"
        },
        {
          type: "missing",
          original: "The fire alarm wasn't even ringing",
          reconstructed: "Automated fire strobe initiated at 21:13:30",
          explanation: "Auditory alarm was in delayed staging mode for first 60 seconds; visual strobes were active, explaining auditory discrepancy.",
          status: "SCADA Alarm Log Corroborated"
        }
      ]
    },

    // Page 5: Evidence Explorer Items
    evidence: [
      {
        id: "EVD-8841-01",
        title: "Metro Station CCTV Cam #14 - West Concourse",
        source: "Metro Transit Security SCADA",
        sourceType: "Surveillance Video",
        timestamp: "2026-10-24T21:12:15Z",
        clockDrift: "±42 seconds (Uncalibrated analog NTP)",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        fileType: "MP4 / H.264",
        fileSize: "412.4 MB",
        custodyOfficer: "Forensic Tech M. Lin",
        chainOfCustody: [
          { date: "2026-10-24 22:45", actor: "Transit Dispatch", action: "Stream exported from NVR Server 02" },
          { date: "2026-10-25 01:20", actor: "M. Lin", action: "SHA-256 seal & secure vault deposit" }
        ],
        linkedClaims: ["CLM-01", "CLM-03", "CLM-04"],
        summary: "Captures crowd surge toward West Gate 3. Visible magnetic lock fail-safe delay. Victim knockdown at turnstile visible at 21:15:10."
      },
      {
        id: "EVD-8841-02",
        title: "911 Emergency Audio Recording & CAD Dispatch #9914",
        source: "City 911 Communications",
        sourceType: "Emergency Audio & Telemetry",
        timestamp: "2026-10-24T21:13:12Z",
        clockDrift: "±0.4 seconds (GPS Synchronized)",
        hash: "7d793037a0760186574b0282f2f435e70f16100e324898606523082155ae863d",
        fileType: "WAV & XML CAD",
        fileSize: "18.2 MB",
        custodyOfficer: "Dispatcher #114 / Det. Vance",
        chainOfCustody: [
          { date: "2026-10-24 21:30", actor: "Emergency Comm Center", action: "CAD incident 9914 generated" },
          { date: "2026-10-24 23:00", actor: "Det. Vance", action: "Evidence imported to FRAGMENT dossier" }
        ],
        linkedClaims: ["CLM-01", "CLM-02"],
        summary: "First 911 call reporting 'gunshots/explosion' at Metro Station. CAD assigns Priority 1 response to Transit Units 402 and 408."
      },
      {
        id: "EVD-8841-03",
        title: "Body-Worn Camera (BWC) - Transit Officer Unit 402",
        source: "Metro Transit Police Dept",
        sourceType: "Police Bodycam",
        timestamp: "2026-10-24T21:13:48Z",
        clockDrift: "±1.2 seconds (Axon GPS Sync)",
        hash: "b5a2c96250612366ac8b2731f6142aab44d5441377e361722f7e4e5f50",
        fileType: "MP4 / Encrypted",
        fileSize: "1.24 GB",
        custodyOfficer: "Sgt. D. Kowalski",
        chainOfCustody: [
          { date: "2026-10-25 00:15", actor: "Docking Station 4", action: "Automatic cryptographic upload" }
        ],
        linkedClaims: ["CLM-03", "CLM-04"],
        summary: "Officer footage shows containment stance at Escalator B. Radio traffic confirms belief of armed suspect. Audio captures crowd shouts and blocked gate shouts."
      },
      {
        id: "EVD-8841-04",
        title: "Station Door Access & Fire Controller Event Log (SCADA)",
        source: "Transit Infrastructure Ops",
        sourceType: "Sensor & Telemetry Log",
        timestamp: "2026-10-24T21:11:00Z to 21:30:00Z",
        clockDrift: "±15.0 seconds (Local PLC clock)",
        hash: "12ca3b45f67a890b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
        fileType: "CSV / Structured Log",
        fileSize: "4.8 MB",
        custodyOfficer: "Systems Engineer K. Thorne",
        chainOfCustody: [
          { date: "2026-10-25 08:30", actor: "K. Thorne", action: "Controller PLC audit dump" }
        ],
        linkedClaims: ["CLM-02", "CLM-05"],
        summary: "Critical evidentiary record: Gate W-3 magnetic lock received drop signal at 21:13:32, but hardware relay contact stayed energized until 21:14:14 (42 second fail-safe lag)."
      },
      {
        id: "EVD-8841-05",
        title: "EMS Run Sheet & Ambulance GPS Telemetry (Unit 12)",
        source: "County Emergency Medical Services",
        sourceType: "Paramedic Triage Log",
        timestamp: "2026-10-24T21:16:04Z",
        clockDrift: "±0.8 seconds (Cellular AVL)",
        hash: "98fa7c6d5e4b3a210fedcba9876543210abcdef1234567890abcdef123456789",
        fileType: "ePCR PDF / NEMSIS XML",
        fileSize: "8.1 MB",
        custodyOfficer: "Paramedic Supv. J. Ortiz",
        chainOfCustody: [
          { date: "2026-10-24 22:50", actor: "Paramedic J. Ortiz", action: "Submitted to ePCR regional database" }
        ],
        linkedClaims: ["CLM-04", "CLM-06"],
        summary: "Paramedic arrival at station perimeter 21:20:10; physical contact with Witness-A at 21:24:20. Noted left rib contusion and cervical strain. Transport to St. Jude Trauma."
      },
      {
        id: "EVD-8841-06",
        title: "St. Jude Hospital ER Trauma Admission Record",
        source: "St. Jude Regional Medical Center",
        sourceType: "Hospital ER Record",
        timestamp: "2026-10-24T21:42:00Z",
        clockDrift: "±0.5 seconds (Hospital Cerner NTP)",
        hash: "4567abcdef0123456789fedcba0987654321abcdef0123456789fedcba098765",
        fileType: "HL7 Clinical Document",
        fileSize: "3.2 MB",
        custodyOfficer: "Records Custodian H. Patel",
        chainOfCustody: [
          { date: "2026-10-25 09:00", actor: "Legal Liaison H. Patel", action: "Transmitted under subpoena 26-LE-41" }
        ],
        linkedClaims: ["CLM-06"],
        summary: "Documents blunt compressive thoracic trauma consistent with barrier pinning. Toxicology screen negative for intoxicants."
      }
    ],

    // Page 6: Claim Verification Matrix
    // Strictly adhering to: SUPPORTED, CONTRADICTED, PARTIALLY SUPPORTED, UNVERIFIED
    // Ethical mandate: Never claim LLM determines lying; verify against logs/physical evidence.
    claims: [
      {
        id: "CLM-01",
        claimText: "A loud explosion occurred near the center stairs at approximately 9:15-9:18 PM.",
        category: "Initiating Incident",
        status: "PARTIALLY SUPPORTED", // SUPPORTED, CONTRADICTED, PARTIALLY SUPPORTED, UNVERIFIED
        confidence: 0.88,
        corroboratingEvidenceIds: ["EVD-8841-02", "EVD-8841-03", "EVD-8841-04"],
        missingInformation: "Acoustic audio signature from high-frequency microphone at Kiosk #4 was corrupted during power spike.",
        explanation: "A loud acoustic event is corroborated at 21:13:05 (diverging by 3-5 minutes from witness estimate). Forensic pressure logs reveal a high-pressure CO2 pneumatic tank burst, not an intentional explosive ordnance. Witness time perception discrepancy is characteristic of acute stress shock."
      },
      {
        id: "CLM-02",
        claimText: "Emergency fire panic bars at West Exit Gate 3 were locked/unopenable when crowd surged.",
        category: "Egress Barrier",
        status: "SUPPORTED",
        confidence: 0.96,
        corroboratingEvidenceIds: ["EVD-8841-01", "EVD-8841-04"],
        missingInformation: "Maintenance inspection log for relay module R-41 for preceding 90 days has not yet been produced by transit subcontractor.",
        explanation: "SCADA PLC log #404 confirms magnetic lock held 42 seconds after emergency initiation due to relay contact weld/friction. CCTV footage directly shows multiple persons attempting to depress the push bar with no door movement between 21:13:35 and 21:14:14."
      },
      {
        id: "CLM-03",
        claimText: "Two transit police officers refused to open the exit gates and stood by idly.",
        category: "Officer Response",
        status: "CONTRADICTED",
        confidence: 0.94,
        corroboratingEvidenceIds: ["EVD-8841-01", "EVD-8841-03"],
        missingInformation: "Audio transcript of radio channel TAC-3 during minutes 21:14:00 to 21:15:00 is awaiting formal declassification.",
        explanation: "Bodycam and CCTV establish officers were not stationed at West Gate 3, but at Escalator Bank B (35m distant) engaging active containment protocol under dispatch assumption of an active shooter. Evidence demonstrates physical separation, not refusal to open doors. Witness perspective was understandably limited by angle and crowd density."
      },
      {
        id: "CLM-04",
        claimText: "Victim was shoved into the turnstile by another individual and trapped for at least 15 minutes.",
        category: "Trauma & Egress",
        status: "PARTIALLY SUPPORTED",
        confidence: 0.89,
        corroboratingEvidenceIds: ["EVD-8841-01", "EVD-8841-05", "EVD-8841-06"],
        missingInformation: "Identification of the individual in the dark coat who collided with the victim has not been established.",
        explanation: "CCTV Cam #14 verifies physical knockdown against the turnstile at 21:15:10 during high-density crowd compression. Elapsed time between knockdown and EMS triage extraction was 11 minutes 50 seconds (21:15:10 to 21:27:00), which reasonably approximates the victim's subjective estimate of 'at least 15 minutes'."
      },
      {
        id: "CLM-05",
        claimText: "The fire alarm was not functioning when the exit doors failed to open.",
        category: "System Warning",
        status: "CONTRADICTED",
        confidence: 0.92,
        corroboratingEvidenceIds: ["EVD-8841-01", "EVD-8841-04"],
        missingInformation: "Decibel meter telemetry at Kiosk 4 to quantify ambient crowd noise vs audio siren output.",
        explanation: "Station SCADA system logged strobe alarm activation at 21:13:30. CCTV Cam #14 captures visible xenon strobe flashes at that instant. However, audible sirens operated on a 60-second staging delay per municipal transit evacuation protocol, which explains why the victim did not hear acoustic sirens during the initial panic."
      },
      {
        id: "CLM-06",
        claimText: "Victim sustained severe blunt thoracic trauma and chest contusion from the gate obstruction.",
        category: "Medical Corroboration",
        status: "SUPPORTED",
        confidence: 0.98,
        corroboratingEvidenceIds: ["EVD-8841-05", "EVD-8841-06"],
        missingInformation: "Follow-up orthopaedic radiological report scheduled for 2026-11-04.",
        explanation: "St. Jude Hospital ER admission report (EVD-8841-06) and EMS run sheet (EVD-8841-05) confirm acute thoracic compressive trauma, left-sided 5th-6th rib fissure fractures, and subcutaneous bruising matching turnstile edge geometry."
      },
      {
        id: "CLM-07",
        claimText: "A third individual was seen carrying an incendiary ignition device near the kiosk.",
        category: "Perpetrator Action",
        status: "UNVERIFIED",
        confidence: 0.35,
        corroboratingEvidenceIds: [],
        missingInformation: "High-angle Concourse camera blindspot between Column D-2 and Ticket Kiosk 4. Awaiting forensic debris residue analysis.",
        explanation: "No available video feed, sensor reading, or other witness statement currently corroborates an incendiary device. Physical debris collected by bomb squad yielded only non-toxic inert CO2 refrigerant and rust flakes. Status remains strictly unverified pending laboratory spectrometer results."
      }
    ],

    // Page 7: Incident Timeline Data (5 distinct multi-agency services)
    timeline: [
      {
        id: "TL-01",
        service: "Victim Report",
        serviceColor: "text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]",
        originalTimestamp: "2026-10-24 21:15:00",
        correctedTimestamp: "2026-10-24 21:12:38",
        clockUncertainty: "±180s (Subjective memory estimate)",
        eventTitle: "Victim Ingress at Kiosk 4",
        description: "Witness-A enters station and taps smart transit card at Kiosk #4.",
        evidenceRef: "EVD-8841-04 (SCADA Fare Log)",
        syncDelta: "-2m 22s"
      },
      {
        id: "TL-02",
        service: "Emergency Helpline",
        serviceColor: "text-rose-300 bg-rose-950/30 border-rose-500/30",
        originalTimestamp: "2026-10-24 21:13:05",
        correctedTimestamp: "2026-10-24 21:13:05",
        clockUncertainty: "±0.5s (GPS Master Clock)",
        eventTitle: "Acoustic Event & First 911 Call",
        description: "Pneumatic canister ruptures at Escalator B. First 911 call connected from commuter reporting gunfire.",
        evidenceRef: "EVD-8841-02",
        syncDelta: "0s"
      },
      {
        id: "TL-03",
        service: "Police (CAD)",
        serviceColor: "text-sky-300 bg-sky-950/40 border-sky-400/40 shadow-[0_0_8px_rgba(14,165,233,0.25)]",
        originalTimestamp: "2026-10-24 21:13:30",
        correctedTimestamp: "2026-10-24 21:13:30",
        clockUncertainty: "±0.4s (CAD Master Sync)",
        eventTitle: "Priority 1 Dispatch to Transit Unit 402",
        description: "CAD broadcasts active shooter code. Units 402 and 408 take containment positions at Escalator B.",
        evidenceRef: "EVD-8841-02 / EVD-8841-03",
        syncDelta: "0s"
      },
      {
        id: "TL-04",
        service: "Victim Report",
        serviceColor: "text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]",
        originalTimestamp: "2026-10-24 21:16:00",
        correctedTimestamp: "2026-10-24 21:13:45",
        clockUncertainty: "±120s (Estimated by witness)",
        eventTitle: "Crowd Surge Reaches West Gate 3",
        description: "Hundreds surge toward West Gate 3. Red push bar remains locked due to delayed magnetic release.",
        evidenceRef: "EVD-8841-01 (CCTV-14)",
        syncDelta: "-2m 15s"
      },
      {
        id: "TL-05",
        service: "Police (CAD)",
        serviceColor: "text-sky-300 bg-sky-950/40 border-sky-400/40 shadow-[0_0_8px_rgba(14,165,233,0.25)]",
        originalTimestamp: "2026-10-24 21:14:14",
        correctedTimestamp: "2026-10-24 21:14:14",
        clockUncertainty: "±15s (Station PLC Clock)",
        eventTitle: "West Gate 3 Magnetic Lock Releases",
        description: "After 42-second lag, emergency door drops open under manual hydraulic assist; crowd begins spilling out.",
        evidenceRef: "EVD-8841-04 (SCADA)",
        syncDelta: "0s"
      },
      {
        id: "TL-06",
        service: "Victim Report",
        serviceColor: "text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]",
        originalTimestamp: "2026-10-24 21:17:00",
        correctedTimestamp: "2026-10-24 21:15:10",
        clockUncertainty: "±60s (Subjective memory)",
        eventTitle: "Victim Knockdown at Turnstile",
        description: "Witness-A is pushed backward by surging crowd into metal turnstile divider.",
        evidenceRef: "EVD-8841-01 (CCTV-14)",
        syncDelta: "-1m 50s"
      },
      {
        id: "TL-07",
        service: "Ambulance (EMS)",
        serviceColor: "text-sky-300 bg-sky-950/40 border-sky-400/40 shadow-[0_0_8px_rgba(14,165,233,0.25)]",
        originalTimestamp: "2026-10-24 21:16:04",
        correctedTimestamp: "2026-10-24 21:16:04",
        clockUncertainty: "±0.8s (EMS CAD Dispatch)",
        eventTitle: "EMS Unit 12 Dispatched",
        description: "Paramedic Unit 12 assigned to Mass Casualty Incident triage point at West Concourse Plaza.",
        evidenceRef: "EVD-8841-05",
        syncDelta: "0s"
      },
      {
        id: "TL-08",
        service: "Ambulance (EMS)",
        serviceColor: "text-sky-300 bg-sky-950/40 border-sky-400/40 shadow-[0_0_8px_rgba(14,165,233,0.25)]",
        originalTimestamp: "2026-10-24 21:24:20",
        correctedTimestamp: "2026-10-24 21:24:20",
        clockUncertainty: "±2s (Paramedic On-Scene Tablet)",
        eventTitle: "EMS Triage Contact with Victim",
        description: "Paramedics stabilize Witness-A, apply cervical collar, and administer oxygen.",
        evidenceRef: "EVD-8841-05",
        syncDelta: "0s"
      },
      {
        id: "TL-09",
        service: "Hospital (ER)",
        serviceColor: "text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]",
        originalTimestamp: "2026-10-24 21:42:00",
        correctedTimestamp: "2026-10-24 21:42:00",
        clockUncertainty: "±0.5s (Cerner HL7 Ingest)",
        eventTitle: "St. Jude ER Trauma Admission",
        description: "Victim admitted under Trauma Alert Code Yellow; X-rays confirm rib compression fractures.",
        evidenceRef: "EVD-8841-06",
        syncDelta: "0s"
      }
    ],

    // Page 8: Cross-Service Correlation Data (React Flow Nodes & Edges)
    correlationData: {
      nodes: [
        {
          id: "node-911",
          type: "serviceNode",
          position: { x: 50, y: 120 },
          data: {
            agency: "Emergency 911 Helpline",
            agencyType: "Helpline / Dispatch",
            eventId: "CAD-9914",
            timestamp: "21:13:05",
            status: "Verified",
            details: "Caller reports explosive sound & panic at Metro Center. Automatic caller geolocate within 15m radius.",
            badgeColor: "border-rose-500/50 bg-rose-950/40 text-rose-300 shadow-[0_0_10px_rgba(255,0,127,0.25)]",
            icon: "PhoneCall"
          }
        },
        {
          id: "node-police",
          type: "serviceNode",
          position: { x: 380, y: 40 },
          data: {
            agency: "Police CAD / Unit 402",
            agencyType: "Law Enforcement",
            eventId: "CAD-UNIT-402",
            timestamp: "21:13:30",
            status: "Verified",
            details: "Officers Vance & Kowalski deploy ballistic shields at Escalator B assuming active shooter.",
            badgeColor: "border-sky-400/50 bg-sky-950/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.25)]",
            icon: "ShieldAlert"
          }
        },
        {
          id: "node-scada",
          type: "serviceNode",
          position: { x: 380, y: 220 },
          data: {
            agency: "Metro SCADA Infrastructure",
            agencyType: "Transit System IoT",
            eventId: "PLC-GATE-W3",
            timestamp: "21:13:32",
            status: "Corroborated",
            details: "Fire alarm trigger sent unlock command to Gate W-3. Relay R-41 mechanical lag 42s.",
            badgeColor: "border-sky-400/50 bg-sky-950/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.25)]",
            icon: "Cpu"
          }
        },
        {
          id: "node-cctv",
          type: "serviceNode",
          position: { x: 720, y: 130 },
          data: {
            agency: "Transit Video Surveillance",
            agencyType: "Visual Evidence",
            eventId: "CCTV-CAM-14",
            timestamp: "21:14:02",
            status: "Corroborated",
            details: "Cam 14 records crowd pileup against Gate W-3 and victim pinned against turnstile barrier at 21:15:10.",
            badgeColor: "border-sky-400/50 bg-sky-950/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.25)]",
            icon: "Video"
          }
        },
        {
          id: "node-ems",
          type: "serviceNode",
          position: { x: 1040, y: 50 },
          data: {
            agency: "EMS Paramedic Unit 12",
            agencyType: "Medical First Response",
            eventId: "RUN-EMS-12",
            timestamp: "21:24:20",
            status: "Verified",
            details: "Extraction of Witness-A from turnstile area. Triage tag: Priority Yellow (Thoracic trauma).",
            badgeColor: "border-sky-400/50 bg-sky-950/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.25)]",
            icon: "Ambulance"
          }
        },
        {
          id: "node-hospital",
          type: "serviceNode",
          position: { x: 1040, y: 250 },
          data: {
            agency: "St. Jude Hospital ER",
            agencyType: "Trauma Receiving Facility",
            eventId: "ER-MED-8841",
            timestamp: "21:42:00",
            status: "Verified",
            details: "Direct admission. Rib fractures and compressive trauma documented. Discharged after 48h observation.",
            badgeColor: "border-rose-500/50 bg-rose-950/40 text-rose-300 shadow-[0_0_10px_rgba(255,0,127,0.25)]",
            icon: "Building2"
          }
        }
      ],
      edges: [
        {
          id: "edge-911-police",
          source: "node-911",
          target: "node-police",
          label: "CAD Automatic Dispatch (25s latency)",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#0ea5e9", strokeWidth: 2 },
          data: { correlationReason: "Dispatcher linked caller GPS coords to Transit Substation sector 4", confidence: "0.99", uncertainty: "Low (Direct digital bridge)" }
        },
        {
          id: "edge-911-scada",
          source: "node-911",
          target: "node-scada",
          label: "Coincident Alarm Ingest",
          type: "smoothstep",
          style: { stroke: "#ff007f", strokeWidth: 2, strokeDasharray: "5,5" },
          data: { correlationReason: "SCADA acoustic sensor tripped within 2 seconds of 911 initial ring", confidence: "0.85", uncertainty: "Moderate (SCADA clock drift ±15s)" }
        },
        {
          id: "edge-police-cctv",
          source: "node-police",
          target: "node-cctv",
          label: "Tactical Geofence Correlation",
          type: "smoothstep",
          style: { stroke: "#0ea5e9", strokeWidth: 2 },
          data: { correlationReason: "Bodycam GPS matches Cam 14 field-of-view edge timestamp", confidence: "0.94", uncertainty: "Low" }
        },
        {
          id: "edge-scada-cctv",
          source: "node-scada",
          target: "node-cctv",
          label: "Physical Lock Delay Visible on Video",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#ff007f", strokeWidth: 2.5 },
          data: { correlationReason: "PLC relay energized state exactly spans the 42s video window where crowd is blocked at Gate 3", confidence: "0.98", uncertainty: "Very Low" }
        },
        {
          id: "edge-cctv-ems",
          source: "node-cctv",
          target: "node-ems",
          label: "Triage Extrication Visual Log",
          type: "smoothstep",
          style: { stroke: "#0ea5e9", strokeWidth: 2 },
          data: { correlationReason: "EMS uniform badges & stretcher ingress matched to Cam 14 video frame at 21:24:20", confidence: "0.97", uncertainty: "Low" }
        },
        {
          id: "edge-ems-hospital",
          source: "node-ems",
          target: "node-hospital",
          label: "Patient Handover Chain of Custody",
          type: "smoothstep",
          animated: true,
          style: { stroke: "#0ea5e9", strokeWidth: 2 },
          data: { correlationReason: "Barcoded patient wristband ID 8841-A transmitted from ambulance tablet to Cerner ER EHR", confidence: "1.00", uncertainty: "Zero (Direct cryptographic handoff)" }
        }
      ]
    },

    // Page 9: Root Cause Analysis Data (Ranked Hypotheses)
    rootCauses: [
      {
        id: "HYP-01",
        rank: 1,
        title: "Mechanical Relay Stiction in Gate W-3 Failsafe Circuit Combined with Perceived Threat Surge",
        category: "Equipment Failure & Secondary Panic",
        probabilityScore: 92,
        confidenceLevel: "HIGH FORENSIC CERTAINTY",
        supportingEvidence: [
          "SCADA PLC log shows 42-second lag between drop command and relay de-energization (EVD-8841-04)",
          "CCTV Cam 14 visually confirms crowd hitting static panic bar until 21:14:14 release (EVD-8841-01)",
          "Maintenance cart acoustic debris confirms CO2 tank valve failure, not explosive payload"
        ],
        contradictingEvidence: [
          "None found in hardware records or physical inspections"
        ],
        missingInformation: [
          "Subcontractor maintenance logs for the 30-day pre-incident inspection cycle for Relay Module R-41",
          "Metallurgical assessment of relay contact contactor pads"
        ],
        uncertaintyRating: "±4% (Limited to whether relay weld was electrical arcing or mechanical binding)",
        sourceReferences: ["SCADA PLC Log EVD-8841-04", "Metro CCTV EVD-8841-01", "Forensic Lab Report LAB-26-90"]
      },
      {
        id: "HYP-02",
        rank: 2,
        title: "Human Operator Override Delay during Transit Police Lockdown Protocol",
        category: "Operational / Protocol Misalignment",
        probabilityScore: 34,
        confidenceLevel: "LOW TO MODERATE CERTAINTY",
        supportingEvidence: [
          "CAD log shows Transit Unit 402 called 'possible active shooter' at 21:13:30 (EVD-8841-02)",
          "Emergency doors are equipped with a central dispatch manual security interlock"
        ],
        contradictingEvidence: [
          "Transit Dispatch console logs prove no manual 'Force Locked' command was initiated from central desk",
          "SCADA audit confirms PLC autonomously initiated the unlock sequence, ruling out human veto"
        ],
        missingInformation: [
          "Audio recordings of Transit Sergeant's direct cell phone calls during first 4 minutes"
        ],
        uncertaintyRating: "±18% (Requires declassified radio logs)",
        sourceReferences: ["CAD XML Log EVD-8841-02", "Transit Dispatch Audit Dump"]
      },
      {
        id: "HYP-03",
        rank: 3,
        title: "Malicious Physical Jamming of West Concourse Panic Bar from Exterior",
        category: "Intentional Tampering / Sabotage",
        probabilityScore: 6,
        confidenceLevel: "UNSUBSTANTIATED / NEAR ZERO PROBABILITY",
        supportingEvidence: [
          "Initial witness statement speculated that doors were 'bolted from outside'"
        ],
        contradictingEvidence: [
          "External plaza security camera Cam #03 shows zero individuals near exterior of Gate W-3 at 21:13",
          "Exterior latch assembly showed zero tool marks, pry damage, or foreign obstructions upon physical forensics",
          "Door released immediately once internal relay dropped voltage"
        ],
        missingInformation: [
          "None required; physical inspection strongly excludes exterior interference"
        ],
        uncertaintyRating: "±2%",
        sourceReferences: ["Plaza Exterior CCTV Cam #03", "Crime Scene Forensics Physical Exam #CS-44"]
      }
    ],

    // Page 10: Official Investigation Report Data (includes embedded What-If analysis)
    report: {
      reportId: "REP-2026-8841-FINAL",
      generatedDate: "2026-10-30T16:00:00Z",
      classification: "OFFICIAL LAW ENFORCEMENT REPORT // FOR COURT ADMISSION",
      reportingAuthority: "Metro Transit Police Department & Forensic Sciences Directorate",
      signatories: [
        { name: "Det. Elena Vance", title: "Lead Investigator", badge: "#7492", signedDate: "2026-10-30 16:45" },
        { name: "Dr. Alistair Finch", title: "Chief Forensic Systems Analyst", badge: "#F-319", signedDate: "2026-10-30 17:10" }
      ],
      executiveSummary: "This formal investigation synthesizes multi-agency electronic telemetry, physical forensics, and victim testimony regarding the crowd surge and crush injury incident at Metro Station Central Plaza on 2026-10-24. Cross-corroboration proves an unintended pneumatic canister rupture mimicked gunfire, inducing a rapid egress surge toward West Gate 3. Egress was mechanically impeded for 42 seconds due to an electrical relay delay in the fire failsafe loop, leading directly to compressive crush injuries sustained by Witness-A against the turnstile barrier. Claims of active police refusal or external sabotage are disproven by physical logs.",
      limitations: [
        "CCTV Camera #14 experienced a uncalibrated local clock drift of approximately ±42 seconds; all video timestamps were mathematically normalized against GPS CAD master logs.",
        "Acoustic sensor at Kiosk #4 suffered localized memory buffer underrun, requiring reliance on secondary acoustic reflections from Escalator Bank B.",
        "In accordance with legal integrity mandates, algorithmic claim verification assesses evidentiary corroboration only and does NOT evaluate human psychological veracity or intent."
      ],
      counterfactualWhatIfs: [
        {
          id: "WIF-01",
          scenarioTitle: "What if Relay R-41 had operated within the standard 2.5s NFPA failsafe window?",
          impactAnalysis: "Crowd density at West Gate 3 would have peaked at 1.8 persons/m² instead of 5.4 persons/m². Simulated bottleneck models indicate 0% probability of turnstile barrier pinning, virtually eliminating thoracic crush trauma for Witness-A.",
          confidence: "94% Hydraulic Simulation Confidence"
        },
        {
          id: "WIF-02",
          scenarioTitle: "What if Station Central CAD had broadcasted 'Pneumatic Hazard' instead of 'Active Shooter' code?",
          impactAnalysis: "Transit Unit 402 would have proceeded to assist egress management at West Gate rather than establishing a tactical defense perimeter at Escalator B. First responder presence at the gate would have likely assisted in manually forcing the door 20-30 seconds earlier.",
          confidence: "82% Operational Behavioral Model"
        },
        {
          id: "WIF-03",
          scenarioTitle: "What if CCTV Cam 14 clock drift had been ±180 seconds rather than ±42 seconds?",
          impactAnalysis: "Preliminary correlation would have temporarily grouped the victim's fall with an unrelated minor trip event at 21:18. Algorithmic cross-verification against ticket kiosk tap-in telemetry was necessary to resolve the 138-second divergence.",
          confidence: "99% Mathematical Telemetry Proof"
        }
      ]
    }
  },

  {
    id: "CASE-2026-9014",
    title: "Harbor Logistics Hub Freight Line Toxic Spill & Evacuation",
    incidentType: "Industrial Hazardous Material Release",
    jurisdiction: "Port Authority Police & State Environmental Division",
    leadInvestigator: "Inspector Donald Reyes (Badge #5122)",
    assignedTeam: ["Inspector Donald Reyes", "Hazmat Specialist Dr. Lin", "Legal Counsel Rachel Stern"],
    dateOccurred: "2026-10-22T04:45:00Z",
    dateIntake: "2026-10-22T05:30:00Z",
    status: "Verification Phase",
    clearanceLevel: "CONFIDENTIAL // REGULATORY PROCEEDINGS",
    priority: "MEDIUM",
    victimId: "VIC-9014-B",
    victimPseudonym: "Dock Worker Foreman (R. Calder)",
    summary: "At 04:45 local, chemical cargo tanker railcar suffered flange failure during shunting, venting anhydrous ammonia gas. Evacuation siren delay of 8 minutes reported. Investigation correlates rail telemetry, atmospheric plume sensors, and worker statements.",
    statements: {
      raw: `I was doing my pre-shift walk at Dock 7 around 4:40 in the morning. All of a sudden I smelled a burning rotten sting that choked my throat. I couldn't see anything because the depot lights were flickering. I ran to the supervisor booth to hit the manual evacuation pull, but the glass box was already smashed and the lever didn't trigger any sirens. I yelled to the crane crew to get down. Nobody from the Port safety team came for twenty minutes while the white vapor cloud spread over the railhead. My lungs were on fire.`,
      aiReconstructed: `At 04:42:15, the individual was conducting pre-shift walk near Track 7. Atmospheric chemical sensor NH3-09 registered 45 PPM anhydrous ammonia at 04:43:02, escalating to 280 PPM at 04:44:50. Power fluctuation recorded on Depot Sector 3 lighting circuit at 04:43:40. The individual accessed Supervisor Booth 7B at 04:46:10. Manual pull station was mechanically actuated; however, telemetry log shows the circuit breaker CB-14 had tripped 8 minutes prior, disabling the localized horn. Port Hazmat Unit 3 was dispatched at 04:52:00 following automated perimeter fence sensor trip (elapsed response time 9 minutes 45 seconds). Victim evacuated by dock safety truck at 04:59:10.`,
      victimApproved: `I confirm that I smelled ammonia near Dock 7 around 4:42 AM. The lights were unstable and the manual alarm lever failed to sound the siren because of the power circuit issue. I evacuated with assistance around 5:00 AM.`,
      victimApprovalMetadata: {
        isApproved: true,
        approvedTimestamp: "2026-10-25T11:00:00Z",
        verifiedMethod: "Legal Department Secure Portal",
        digitalSignature: "SIG-VIC9014-SHA256-88aa11bc76e3"
      },
      versionHistory: [
        { version: "v1.0", author: "Voice Interview Transcript", date: "2026-10-22 06:15", notes: "Emergency room bedside intake" },
        { version: "v1.1", author: "FRAGMENT AI Chrono-Aligner", date: "2026-10-22 14:00", notes: "Synchronized with SCADA NH3 sensor telemetry" },
        { version: "v2.0", author: "Foreman R. Calder", date: "2026-10-25 11:00", notes: "Approved with clarification on breaker trip" }
      ],
      phraseAnalysis: [
        {
          type: "change",
          original: "depot lights were flickering",
          reconstructed: "Power fluctuation on Depot Sector 3 lighting circuit",
          explanation: "SCADA power telemetry logged voltage sag from 480V to 310V at 04:43:40 due to compressor short.",
          status: "Sensor Verified"
        },
        {
          type: "unclear",
          original: "lever didn't trigger any sirens",
          reconstructed: "circuit breaker CB-14 tripped disabling localized horn",
          explanation: "Hardware pull station functioned, but local acoustic bell was de-energized by breaker trip.",
          status: "Electrical Forensics Verified"
        }
      ]
    },
    evidence: [
      {
        id: "EVD-9014-01",
        title: "SCADA Ammonia Gas Sensor Log (Sensors NH3-01 to NH3-12)",
        source: "Port Authority Environmental SCADA",
        sourceType: "Sensor & Telemetry Log",
        timestamp: "2026-10-22T04:40:00Z",
        clockDrift: "±1.0s (NTP Master)",
        hash: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
        fileType: "CSV Log",
        fileSize: "14.2 MB",
        custodyOfficer: "Hazmat Tech S. Wei",
        chainOfCustody: [{ date: "2026-10-22 06:00", actor: "S. Wei", action: "Vault ingest" }],
        linkedClaims: ["CLM-9014-01"],
        summary: "Documents spike from 0 to 320 PPM ammonia gas between 04:43 and 04:47."
      }
    ],
    claims: [
      {
        id: "CLM-9014-01",
        claimText: "Manual evacuation pull station at Booth 7B failed to activate audible warning siren.",
        category: "Safety Equipment",
        status: "SUPPORTED",
        confidence: 0.97,
        corroboratingEvidenceIds: ["EVD-9014-01"],
        missingInformation: "Substation breaker maintenance schedule.",
        explanation: "Electrical audit proves circuit breaker CB-14 was open, isolating siren horn power. Mechanical switch closed correctly."
      }
    ],
    timeline: [
      {
        id: "TL-9014-01",
        service: "Victim Report",
        serviceColor: "text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-[0_0_8px_rgba(255,0,127,0.25)]",
        originalTimestamp: "2026-10-22 04:40:00",
        correctedTimestamp: "2026-10-22 04:42:15",
        clockUncertainty: "±120s",
        eventTitle: "Odor Detected at Track 7",
        description: "Foreman detects chemical vapor and retreats to booth.",
        evidenceRef: "EVD-9014-01",
        syncDelta: "-2m 15s"
      }
    ],
    correlationData: {
      nodes: [
        {
          id: "node-dock-scada",
          type: "serviceNode",
          position: { x: 100, y: 100 },
          data: {
            agency: "Port SCADA Sensor",
            agencyType: "Chemical Sensor",
            eventId: "NH3-SPIKE-09",
            timestamp: "04:43:02",
            status: "Corroborated",
            details: "320 PPM surge registered at Dock 7 rail line.",
            badgeColor: "border-sky-400/50 bg-sky-950/40 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.25)]",
            icon: "Cpu"
          }
        }
      ],
      edges: []
    },
    rootCauses: [
      {
        id: "HYP-9014-01",
        rank: 1,
        title: "Defective PTFE Gasket on Tank Car Shunt Coupling under Low Ambient Temperature",
        category: "Equipment Degradation",
        probabilityScore: 88,
        confidenceLevel: "HIGH FORENSIC CERTAINTY",
        supportingEvidence: ["Metallurgical lab report on fractured flange bolt", "Temperature logs showing 28°F frost conditions"],
        contradictingEvidence: [],
        missingInformation: ["Pre-shipment railcar inspection manifest from originating terminal"],
        uncertaintyRating: "±5%",
        sourceReferences: ["State Hazmat Lab File HAZ-9014"]
      }
    ],
    report: {
      reportId: "REP-2026-9014-PRELIM",
      generatedDate: "2026-10-28T09:00:00Z",
      classification: "CONFIDENTIAL // STATE REGULATORY PROCEEDINGS",
      reportingAuthority: "State Environmental Emergency Bureau",
      signatories: [{ name: "Inspector Donald Reyes", title: "Lead Hazmat Inspector", badge: "#5122", signedDate: "2026-10-28 10:00" }],
      executiveSummary: "Preliminary investigation establishes tank flange mechanical failure with localized siren electrical circuit breaker interruption. No intentional tampering detected.",
      limitations: ["Plume dispersion modeling depends on incomplete micro-wind data from Berth 4 anemometer."],
      counterfactualWhatIfs: [
        {
          id: "WIF-9014-01",
          scenarioTitle: "What if Circuit Breaker CB-14 had not tripped?",
          impactAnalysis: "Audible evacuation siren would have initiated at 04:46:10, providing workers with an additional 6 minutes of evacuation buffer.",
          confidence: "91% Operational Confidence"
        }
      ]
    }
  }
];

// Page 11: Immutable Audit Logs
export const INITIAL_AUDIT_LOGS = [
  {
    id: "AUD-2026-9901",
    timestamp: "2026-10-31T15:45:12Z",
    caseId: "CASE-2026-8841",
    actionType: "EVIDENCE_ACCESSED",
    user: "det.vance@metro-authority.gov",
    role: "Lead Detective",
    ipAddress: "10.240.18.42 (Internal LAN / VPN Tunnel)",
    details: "Downloaded high-resolution copy of CCTV Cam #14 (EVD-8841-01) with cryptographic verification",
    tamperProofHash: "9a7d32c918ef001ab43d526718cf2a096c4b7891234567890abcdef123456789",
    blockNumber: 48921,
    severity: "INFO"
  },
  {
    id: "AUD-2026-9900",
    timestamp: "2026-10-31T14:20:00Z",
    caseId: "CASE-2026-8841",
    actionType: "CLAIM_VERIFIED",
    user: "m.lin@metro-forensics.gov",
    role: "Forensic Specialist",
    ipAddress: "10.240.18.55 (Internal LAN)",
    details: "Updated Claim CLM-02 status to 'SUPPORTED' based on SCADA PLC relay delay telemetry",
    tamperProofHash: "8b6c21b807de990fa32c415607be19085b3a6780123456789abcdef012345678",
    blockNumber: 48920,
    severity: "CRITICAL"
  },
  {
    id: "AUD-2026-9899",
    timestamp: "2026-10-31T12:05:44Z",
    caseId: "CASE-2026-8841",
    actionType: "STATEMENT_DIFF_REVIEW",
    user: "det.vance@metro-authority.gov",
    role: "Lead Detective",
    ipAddress: "10.240.18.42 (Internal LAN)",
    details: "Completed comparative review between raw intake audio transcript and AI chronological reconstruction",
    tamperProofHash: "7a5b10a706cd880e921b304506ad08074a295679012345678abcdef901234567",
    blockNumber: 48919,
    severity: "INFO"
  },
  {
    id: "AUD-2026-9898",
    timestamp: "2026-10-31T09:30:10Z",
    caseId: "CASE-2026-8841",
    actionType: "WHAT_IF_SIMULATION",
    user: "r.stern@metro-legal.gov",
    role: "Legal Oversight Counsel",
    ipAddress: "10.240.19.12 (Legal Division VLAN)",
    details: "Executed counterfactual hydraulic simulation WIF-01 (Gate W-3 failsafe window sensitivity)",
    tamperProofHash: "6f4a099605bc770d810a2934059c070639184568901234567abcdef890123456",
    blockNumber: 48918,
    severity: "INFO"
  },
  {
    id: "AUD-2026-9897",
    timestamp: "2026-10-30T17:15:00Z",
    caseId: "CASE-2026-8841",
    actionType: "REPORT_GENERATED",
    user: "det.vance@metro-authority.gov",
    role: "Lead Detective",
    ipAddress: "10.240.18.42 (Internal LAN)",
    details: "Generated official signed report REP-2026-8841-FINAL with digital certificate",
    tamperProofHash: "5e39988504ab660c70991823048b060528073457890123456abcdef789012345",
    blockNumber: 48917,
    severity: "CRITICAL"
  },
  {
    id: "AUD-2026-9896",
    timestamp: "2026-10-30T16:02:18Z",
    caseId: "GLOBAL",
    actionType: "AUTHORITY_LOGIN",
    user: "det.vance@metro-authority.gov",
    role: "Lead Detective",
    ipAddress: "10.240.18.42 (Internal LAN)",
    details: "MFA Authentication successful via Hardware Token (FIDO2 / YubiKey ID 4910)",
    tamperProofHash: "4d288774039a550b69880712037a050417962346789012345abcdef678901234",
    blockNumber: 48916,
    severity: "SECURITY"
  }
];
