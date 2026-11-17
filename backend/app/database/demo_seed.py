"""
FRAGMENT FIRST — IDEMPOTENT DEMO SEEDING SCRIPT
Strictly provisions fictional sample data for authorized hackathon demonstration.

Provisions:
1. Demo Victim account (demo.victim@fragmentsfirst.org / SafeHarbor_42)
2. Demo Investigator account (demo.investigator@fragmentsfirst.org / det_vance)
3. Simulated Case 1: Industrial SCADA Anomaly & Substation Outage (Simulated)
4. Simulated Case 2: Metropolitan Transit Signal Discrepancy (Simulated)
5. Submitted & Approved Victim Statement with AI Reconstruction (unclear portions, uncertainties preserved)
6. Private Victim Draft Statement (strictly isolated, NEVER exposed to investigator)
7. Simulated Technical Evidence records & sample files
8. Corroborated Claims & Forensic Verifications
9. Multi-source Chronological Timeline Events
10. Investigative Hypotheses & Tamper-evident Audit Logs
"""

import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from sqlalchemy.orm import Session

# Ensure backend root is on sys.path when executed directly
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal, engine
from app.database.base import Base

from app.models.user import User
from app.models.case import Case
from app.models.statement import Statement
from app.models.reconstruction import Reconstruction
from app.models.evidence import Evidence
from app.models.claim import Claim
from app.models.verification import Verification
from app.models.timeline import Event
from app.models.investigation import Investigation
from app.models.audit_log import AuditLog


def seed_demo_data(db: Session) -> dict:
    """
    Idempotently seeds demo users and fictional demonstration records into the database.
    Returns a dictionary of created or retrieved entity IDs.
    """
    now = datetime.now(timezone.utc)

    # 1. Provision Demo Victim Account
    victim = db.query(User).filter(User.email == settings.DEMO_VICTIM_EMAIL).first()
    if not victim:
        victim = User(
            email=settings.DEMO_VICTIM_EMAIL,
            username=settings.DEMO_VICTIM_USERNAME,
            full_name=settings.DEMO_VICTIM_NAME,
            hashed_password=hash_password(settings.DEMO_VICTIM_PASSWORD),
            role="victim",
            is_active=True,
            created_at=now - timedelta(days=5),
        )
        db.add(victim)
        db.commit()
        db.refresh(victim)
    else:
        # Ensure role is victim
        victim.role = "victim"
        victim.is_active = True
        db.commit()

    # 2. Provision Demo Investigator Account
    investigator = db.query(User).filter(User.email == settings.DEMO_INVESTIGATOR_EMAIL).first()
    if not investigator:
        investigator = User(
            email=settings.DEMO_INVESTIGATOR_EMAIL,
            username=settings.DEMO_INVESTIGATOR_USERNAME,
            full_name=settings.DEMO_INVESTIGATOR_NAME,
            hashed_password=hash_password(settings.DEMO_INVESTIGATOR_PASSWORD),
            role="investigator",
            is_active=True,
            created_at=now - timedelta(days=10),
        )
        db.add(investigator)
        db.commit()
        db.refresh(investigator)
    else:
        # Ensure role is investigator
        investigator.role = "investigator"
        investigator.is_active = True
        db.commit()

    # 3. Provision Demo Case 1: Industrial SCADA Incident (Simulated)
    case_1 = db.query(Case).filter(
        Case.title == "Industrial SCADA Anomaly & Substation Outage (Simulated)"
    ).first()
    if not case_1:
        case_1 = Case(
            title="Industrial SCADA Anomaly & Substation Outage (Simulated)",
            description=(
                "Fictional simulated inquiry into an unauthorized remote logic injection and power grid substation "
                "breaker trip. Designed for cross-source forensic verification between human witness narrative, "
                "SCADA RTU telemetry logs, and perimeter security telemetry."
            ),
            status="in_progress",
            victim_id=victim.id,
            investigator_id=investigator.id,
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(hours=6),
        )
        db.add(case_1)
        db.commit()
        db.refresh(case_1)
    else:
        case_1.victim_id = victim.id
        case_1.investigator_id = investigator.id
        db.commit()

    # 4. Provision Demo Case 2: Metropolitan Transit Signal Discrepancy (Simulated)
    case_2 = db.query(Case).filter(
        Case.title == "Metropolitan Transit Signal Discrepancy (Simulated)"
    ).first()
    if not case_2:
        case_2 = Case(
            title="Metropolitan Transit Signal Discrepancy (Simulated)",
            description=(
                "Simulated intake regarding anomalous track sensor telemetry and emergency braking activation "
                "along the Central Transit Line concourse."
            ),
            status="open",
            victim_id=victim.id,
            investigator_id=investigator.id,
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=2),
        )
        db.add(case_2)
        db.commit()
        db.refresh(case_2)

    # 5. Provision Statements for Case 1
    # Statement 1A: Submitted and finalized witness statement
    stmt_submitted = db.query(Statement).filter(
        Statement.case_id == case_1.id,
        Statement.is_draft == False,
        Statement.version == 1
    ).first()
    if not stmt_submitted:
        stmt_submitted = Statement(
            case_id=case_1.id,
            victim_id=victim.id,
            original_text=(
                "I was working the night dispatch shift at Substation 4 around 21:15 or maybe 21:18. "
                "Suddenly the main feeder breaker tripped and auxiliary alarms started flashing amber and red. "
                "I immediately attempted to execute a manual override bypass from Terminal 3, but the touch console "
                "was locked out and displayed an access rejection error. I saw two white utility vehicles parked near "
                "perimeter Gate 2 that should not have been inside the perimeter at that hour. The supervisor advised "
                "over VHF channel 4 not to touch the physical interlocks until corporate IT incident response arrived, "
                "which took roughly 45 minutes."
            ),
            is_draft=False,
            version=1,
            status="approved",
            created_at=now - timedelta(days=2, hours=4),
            updated_at=now - timedelta(days=1, hours=8),
        )
        db.add(stmt_submitted)
        db.commit()
        db.refresh(stmt_submitted)

    # Statement 1B: PRIVATE VICTIM DRAFT STATEMENT (Must NEVER be visible to investigator)
    stmt_draft = db.query(Statement).filter(
        Statement.case_id == case_1.id,
        Statement.is_draft == True
    ).first()
    if not stmt_draft:
        stmt_draft = Statement(
            case_id=case_1.id,
            victim_id=victim.id,
            original_text=(
                "[CONFIDENTIAL PRIVATE DRAFT — NOT SUBMITTED]\n"
                "Personal notes: Checking my shift logbook from that night. I need to verify whether badge reader B "
                "had its green LED active when I stepped out to the auxiliary battery room around 21:05. "
                "I should not submit this observation until I confirm the access log timestamps."
            ),
            is_draft=True,
            version=2,
            status="draft",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=12),
        )
        db.add(stmt_draft)
        db.commit()
        db.refresh(stmt_draft)

    # 6. Provision AI Reconstruction for Statement 1A (Ethical human-in-the-loop, approved by victim)
    recon = db.query(Reconstruction).filter(Reconstruction.statement_id == stmt_submitted.id).first()
    if not recon:
        recon = Reconstruction(
            statement_id=stmt_submitted.id,
            case_id=case_1.id,
            reconstructed_statement=(
                "At approximately 21:13:40 (corroborated via SCADA RTU event telemetry), the operator was stationed "
                "at Substation 4 Control Room. An unexpected busbar feeder breaker trip occurred at 21:14:02. "
                "The operator attempted a manual override at Terminal 3 at 21:15:20, which was rejected due to an "
                "automated cyber-isolation protocol. Two unauthorized service trucks were observed near perimeter Gate 2 "
                "at 21:17:12. Corporate cybersecurity incident response protocol was communicated via VHF radio channel 4 "
                "at 21:18. Response team arrived on site at 22:02:15 (elapsed time 44 minutes)."
            ),
            unclear_portions=[
                "Exact time of initial breaker trip (estimated 21:15-21:18 by operator, verified as 21:14:02 by telemetry)",
                "Identification of service vehicles and occupants at Gate 2"
            ],
            missing_information=[
                "Authentication audit log of user or automated script that activated the Terminal 3 override lockout",
                "Contractor registration badge logs for Gate 2 entry between 21:00 and 21:20"
            ],
            preserved_uncertainties=[
                "Whether the vehicles were contractor utility trucks or municipal service units",
                "Exact badge serial number used at Gate 2 perimeter reader"
            ],
            requires_victim_review=False,
            is_approved=True,
            victim_feedback=(
                "I have carefully reviewed this chronological narrative. It accurately preserves my observations while "
                "integrating the exact telemetry timestamps. I approve this reconstruction for the official investigation."
            ),
            approved_at=now - timedelta(days=1, hours=8),
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(days=1, hours=8),
        )
        db.add(recon)
        db.commit()
        db.refresh(recon)

    # 7. Provision Simulated Technical Evidence
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Evidence File 1: SCADA Telemetry JSON
    scada_filename = "demo_scada_busbar_telemetry.json"
    scada_path = os.path.join(settings.UPLOAD_DIR, scada_filename)
    if not os.path.exists(scada_path):
        with open(scada_path, "w", encoding="utf-8") as f:
            f.write(
                '{\n'
                '  "substation": "SUB-04",\n'
                '  "busbar": "FEB-04",\n'
                '  "events": [\n'
                '    {"timestamp": "2026-10-24T21:14:02.114Z", "event": "BREAKER_TRIP", "feeder": "FEB-04", "status": "OPEN", "voltage_kV": 0.0, "source": "REMOTE_RPC_CMD", "src_ip": "192.168.104.55"},\n'
                '    {"timestamp": "2026-10-24T21:15:20.892Z", "event": "AUTH_FAIL", "terminal": "TERMINAL_03", "user": "DISPATCH_04", "reason": "REMOTE_LOCKOUT_ACTIVE"}\n'
                '  ]\n'
                '}\n'
            )

    ev_1 = db.query(Evidence).filter(Evidence.case_id == case_1.id, Evidence.filename == scada_filename).first()
    if not ev_1:
        ev_1 = Evidence(
            case_id=case_1.id,
            uploaded_by=investigator.id,
            title="Substation 4 SCADA RTU Busbar Feeder Telemetry (Simulated)",
            filename=scada_filename,
            original_filename="sub4_feeder_telemetry_20261024.json",
            file_type="json",
            file_path=scada_path,
            file_size=os.path.getsize(scada_path) if os.path.exists(scada_path) else 1024,
            extracted_text=(
                "[21:14:02.114] BREAKER_TRIP FEB-04 STATUS:OPEN VOLTAGE:0.0kV SOURCE:REMOTE_RPC_CMD IP:192.168.104.55\n"
                "[21:15:20.892] AUTH_FAIL TERMINAL_03 USER:DISPATCH_04 REASON:REMOTE_LOCKOUT_ACTIVE"
            ),
            metadata_json={
                "device": "Substation 4 RTU Controller",
                "firmware": "v4.2.1-sec",
                "sha256": "4c99a81e7d2301fa382901b0928e1245fa812034981273918237192847192834",
                "classification": "DEMO_SIMULATION"
            },
            created_at=now - timedelta(days=2),
        )
        db.add(ev_1)
        db.commit()
        db.refresh(ev_1)

    # Evidence File 2: Perimeter CCTV Export
    cctv_filename = "demo_gate2_cctv_log.txt"
    cctv_path = os.path.join(settings.UPLOAD_DIR, cctv_filename)
    if not os.path.exists(cctv_path):
        with open(cctv_path, "w", encoding="utf-8") as f:
            f.write(
                "CAMERA FEED: CAM-G2-04 (Perimeter Gate 2 North Angle)\n"
                "TIMESTAMP: 2026-10-24 21:17:12 UTC\n"
                "ANPR OCR: Vehicle 1 - Utility Service Van (Plate #774-XYK, commercial vinyl logo obscured)\n"
                "ANPR OCR: Vehicle 2 - Dark Dual-Cab Pickup (Plate unreadable due to glare)\n"
                "ACTIVITY: Vehicles stationary at access barrier 21:17:12 - 21:26:45.\n"
            )

    ev_2 = db.query(Evidence).filter(Evidence.case_id == case_1.id, Evidence.filename == cctv_filename).first()
    if not ev_2:
        ev_2 = Evidence(
            case_id=case_1.id,
            uploaded_by=investigator.id,
            title="Perimeter Gate 2 CCTV & Automated Plate Reader Log (Simulated)",
            filename=cctv_filename,
            original_filename="cctv_gate2_anpr_211712.txt",
            file_type="txt",
            file_path=cctv_path,
            file_size=os.path.getsize(cctv_path) if os.path.exists(cctv_path) else 512,
            extracted_text=(
                "CAM-G2-04 ANPR OCR: Vehicle 1 (Plate #774-XYK) and Vehicle 2 (Dark Pickup) logged at Gate 2 at 21:17:12 UTC."
            ),
            metadata_json={
                "camera_id": "CAM-G2-04",
                "resolution": "1920x1080",
                "classification": "DEMO_SIMULATION"
            },
            created_at=now - timedelta(days=2),
        )
        db.add(ev_2)
        db.commit()
        db.refresh(ev_2)

    # 8. Provision Claims from Statement 1A
    claim_1 = db.query(Claim).filter(
        Claim.statement_id == stmt_submitted.id,
        Claim.claim_text.like("%feeder breaker tripped%")
    ).first()
    if not claim_1:
        claim_1 = Claim(
            statement_id=stmt_submitted.id,
            case_id=case_1.id,
            reconstruction_id=recon.id,
            claim_text="Main feeder breaker tripped between 21:15 and 21:18, causing auxiliary panel alarms to activate.",
            original_excerpt="Suddenly the main feeder breaker tripped and auxiliary alarms started flashing amber and red.",
            people=["Night dispatch operator"],
            locations=["Substation 4 Control Room"],
            dates=["2026-10-24"],
            times=["21:15:00"],
            events=["Feeder breaker trip"],
            actions=["Visual alarm observation"],
            uncertainty_notes="Operator recalled time between 21:15 and 21:18; corroborated by SCADA telemetry as 21:14:02.",
            is_approved=True,
            created_at=now - timedelta(days=2),
        )
        db.add(claim_1)
        db.commit()
        db.refresh(claim_1)

    claim_2 = db.query(Claim).filter(
        Claim.statement_id == stmt_submitted.id,
        Claim.claim_text.like("%Terminal 3%")
    ).first()
    if not claim_2:
        claim_2 = Claim(
            statement_id=stmt_submitted.id,
            case_id=case_1.id,
            reconstruction_id=recon.id,
            claim_text="Manual override bypass on Terminal 3 touch console was rejected with an access denial error.",
            original_excerpt="I immediately attempted to execute a manual override bypass from Terminal 3, but the touch console was locked out and displayed an access rejection error.",
            people=["Night dispatch operator"],
            locations=["Terminal 3 Touch Console"],
            dates=["2026-10-24"],
            times=["21:15:20"],
            events=["Override attempt failure"],
            actions=["Manual override input"],
            uncertainty_notes="Console lockout caused by remote lock state.",
            is_approved=True,
            created_at=now - timedelta(days=2),
        )
        db.add(claim_2)
        db.commit()
        db.refresh(claim_2)

    claim_3 = db.query(Claim).filter(
        Claim.statement_id == stmt_submitted.id,
        Claim.claim_text.like("%Gate 2%")
    ).first()
    if not claim_3:
        claim_3 = Claim(
            statement_id=stmt_submitted.id,
            case_id=case_1.id,
            reconstruction_id=recon.id,
            claim_text="Two unauthorized service vehicles parked near perimeter Gate 2 during the outage window.",
            original_excerpt="I saw two white utility vehicles parked near perimeter Gate 2 that should not have been inside the perimeter at that hour.",
            people=["Unidentified vehicle occupants"],
            locations=["Perimeter Gate 2"],
            dates=["2026-10-24"],
            times=["21:17:00"],
            events=["Unauthorized vehicle presence"],
            actions=["Perimeter observation"],
            uncertainty_notes="Vehicle model identified from CCTV as one white service van and one dark pickup.",
            is_approved=True,
            created_at=now - timedelta(days=2),
        )
        db.add(claim_3)
        db.commit()
        db.refresh(claim_3)

    # 9. Provision Verifications (Corroborating claims with evidence)
    ver_1 = db.query(Verification).filter(Verification.claim_id == claim_1.id).first()
    if not ver_1:
        ver_1 = Verification(
            claim_id=claim_1.id,
            case_id=case_1.id,
            status="Supported",
            explanation=(
                "Corroborated by Substation 4 RTU SCADA telemetry recording BREAKER_TRIP FEB-04 at 21:14:02.114 UTC. "
                "The 1-2 minute variance is consistent with human perceptual latency during sudden incident onset."
            ),
            evidence_ids=[ev_1.id],
            limitations=["Operator clock had not been NTP-synced for 72 hours prior to the event"],
            human_review_required=False,
            reviewer_id=investigator.id,
            reviewer_notes="Telemetry fully supports the core factual assertion of an unexpected breaker trip.",
            is_reviewed=True,
            created_at=now - timedelta(days=1, hours=6),
            updated_at=now - timedelta(days=1, hours=6),
        )
        db.add(ver_1)

    ver_2 = db.query(Verification).filter(Verification.claim_id == claim_2.id).first()
    if not ver_2:
        ver_2 = Verification(
            claim_id=claim_2.id,
            case_id=case_1.id,
            status="Supported",
            explanation=(
                "Corroborated by terminal authentication event log recording AUTH_FAIL at 21:15:20.892 UTC on TERMINAL_03 "
                "under reason REMOTE_LOCKOUT_ACTIVE."
            ),
            evidence_ids=[ev_1.id],
            limitations=[],
            human_review_required=False,
            reviewer_id=investigator.id,
            reviewer_notes="Confirmed lockout condition aligned with victim testimony.",
            is_reviewed=True,
            created_at=now - timedelta(days=1, hours=5),
            updated_at=now - timedelta(days=1, hours=5),
        )
        db.add(ver_2)

    ver_3 = db.query(Verification).filter(Verification.claim_id == claim_3.id).first()
    if not ver_3:
        ver_3 = Verification(
            claim_id=claim_3.id,
            case_id=case_1.id,
            status="Partially Supported",
            explanation=(
                "Corroborated by CAM-G2-04 logging two vehicles entering Gate 2 perimeter at 21:17:12 UTC. "
                "However, one vehicle was a white utility van (#774-XYK) and the second was a dark pickup truck, "
                "clarifying the witness's initial recollection of two white vehicles."
            ),
            evidence_ids=[ev_2.id],
            limitations=["Lighting conditions at Gate 2 reduced color discrimination in perimeter perimeter zone"],
            human_review_required=False,
            reviewer_id=investigator.id,
            reviewer_notes="Physical presence of two unauthorized vehicles confirmed; vehicle colors refined.",
            is_reviewed=True,
            created_at=now - timedelta(days=1, hours=4),
            updated_at=now - timedelta(days=1, hours=4),
        )
        db.add(ver_3)

    db.commit()

    # 10. Provision Timeline Events
    existing_events = db.query(Event).filter(Event.case_id == case_1.id).count()
    if existing_events == 0:
        events = [
            Event(
                case_id=case_1.id,
                description="Substation 4 SCADA RTU records remote RPC trip command and busbar feeder breaker opening.",
                date_time_str="2026-10-24 21:14:02 UTC",
                time_precision="exact",
                source_type="evidence",
                source_id=ev_1.id,
                related_claim_ids=[claim_1.id],
                is_uncertain=False,
            ),
            Event(
                case_id=case_1.id,
                description="Control room dispatch operator attempts manual bypass override on Terminal 3 console; blocked by active remote lockout.",
                date_time_str="2026-10-24 21:15:20 UTC",
                time_precision="exact",
                source_type="claim",
                source_id=claim_2.id,
                related_claim_ids=[claim_2.id],
                is_uncertain=False,
            ),
            Event(
                case_id=case_1.id,
                description="Automated ANPR camera CAM-G2-04 captures two unidentified vehicles idling at perimeter Gate 2.",
                date_time_str="2026-10-24 21:17:12 UTC",
                time_precision="exact",
                source_type="evidence",
                source_id=ev_2.id,
                related_claim_ids=[claim_3.id],
                is_uncertain=False,
            ),
            Event(
                case_id=case_1.id,
                description="Corporate cybersecurity incident response vehicle arrives at main entrance and assumes triage command.",
                date_time_str="2026-10-24 22:02:15 UTC",
                time_precision="approximate",
                source_type="statement",
                source_id=stmt_submitted.id,
                related_claim_ids=[],
                is_uncertain=False,
            ),
        ]
        db.add_all(events)
        db.commit()

    # 11. Provision Investigative Hypothesis
    existing_hypo = db.query(Investigation).filter(Investigation.case_id == case_1.id).first()
    if not existing_hypo:
        hypo = Investigation(
            case_id=case_1.id,
            label="Simulated Hypothesis: Remote RPC Infiltration with Perimeter Proximity Staging",
            hypothesis_text=(
                "The breaker trip was initiated via an unauthenticated remote RPC call from internal IP 192.168.104.55. "
                "The presence of service vehicles at Gate 2 between 21:17 and 21:26 suggests localized wireless bridge "
                "or physical tap tapping into the Substation 4 field bus network."
            ),
            supporting_evidence_ids=[ev_1.id, ev_2.id],
            conflicting_evidence_ids=[],
            assumptions=[
                "IP 192.168.104.55 was leased to field maintenance Wi-Fi access point",
                "Vehicles at Gate 2 were not dispatched on official municipal maintenance orders"
            ],
            missing_information=[
                "Forensic memory dump from Terminal 3 console",
                "Full registration history for plate #774-XYK"
            ],
            is_counterfactual=False,
            created_at=now - timedelta(days=1),
        )
        db.add(hypo)
        db.commit()

    # 12. Provision Tamper-evident Audit Logs
    existing_logs = db.query(AuditLog).filter(AuditLog.target_type == "Case", AuditLog.target_id == case_1.id).count()
    if existing_logs == 0:
        logs = [
            AuditLog(
                action="CASE_CREATED",
                target_type="Case",
                target_id=case_1.id,
                user_id=victim.id,
                details=f"Demo Case '{case_1.title}' initialized by victim participant.",
                ip_address="127.0.0.1",
                timestamp=now - timedelta(days=3),
            ),
            AuditLog(
                action="STATEMENT_SUBMITTED",
                target_type="Statement",
                target_id=stmt_submitted.id,
                user_id=victim.id,
                details="Formal witness statement v1.0 submitted and digitally consented.",
                ip_address="127.0.0.1",
                timestamp=now - timedelta(days=2, hours=4),
            ),
            AuditLog(
                action="RECONSTRUCTION_APPROVED",
                target_type="Reconstruction",
                target_id=recon.id,
                user_id=victim.id,
                details="Victim reviewed and approved AI chronological reconstruction.",
                ip_address="127.0.0.1",
                timestamp=now - timedelta(days=1, hours=8),
            ),
            AuditLog(
                action="EVIDENCE_CORROBORATED",
                target_type="Verification",
                target_id=ver_1.id,
                user_id=investigator.id,
                details="Investigator Det. Vance verified Claim #1 against SCADA telemetry.",
                ip_address="127.0.0.1",
                timestamp=now - timedelta(days=1, hours=6),
            ),
        ]
        db.add_all(logs)
        db.commit()

    return {
        "victim_id": victim.id,
        "investigator_id": investigator.id,
        "case_1_id": case_1.id,
        "case_2_id": case_2.id,
        "statement_submitted_id": stmt_submitted.id,
        "statement_draft_id": stmt_draft.id,
        "reconstruction_id": recon.id,
        "evidence_1_id": ev_1.id,
        "evidence_2_id": ev_2.id,
        "claim_1_id": claim_1.id,
        "verification_1_id": ver_1.id,
    }


def main():
    """CLI runner: python -m app.database.demo_seed"""
    print("=" * 60)
    print("  FRAGMENT FIRST — IDEMPOTENT DEMO SEEDING SCRIPT")
    print("=" * 60)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        results = seed_demo_data(db)
        print("\n[SUCCESS] Demo dataset successfully seeded.")
        print(f"  • Demo Victim Account:       {settings.DEMO_VICTIM_EMAIL} (ID: {results['victim_id']})")
        print(f"  • Demo Investigator Account: {settings.DEMO_INVESTIGATOR_EMAIL} (ID: {results['investigator_id']})")
        print(f"  • Demo Cases Provisioned:    Case #{results['case_1_id']}, Case #{results['case_2_id']}")
        print(f"  • Submitted Statement:       Statement #{results['statement_submitted_id']} (Approved)")
        print(f"  • Isolated Private Draft:    Statement #{results['statement_draft_id']} (Hidden from Investigator)")
        print(f"  • Technical Evidence:        Evidence #{results['evidence_1_id']}, Evidence #{results['evidence_2_id']}")
        print(f"  • Verified Claims:           Claim #{results['claim_1_id']} (Verification #{results['verification_1_id']})")
        print("\nAll fictional demo records are labeled '(Simulated)' or '[DEMO]'.")
    except Exception as e:
        print(f"\n[ERROR] Seeding failed: {e}", file=sys.stderr)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
