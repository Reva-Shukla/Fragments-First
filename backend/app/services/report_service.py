import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from app.core.config import settings


class ReportService:
    @classmethod
    def generate_pdf_report(
        cls,
        case_data: Dict[str, Any],
        original_statements: List[Dict[str, Any]],
        approved_reconstructions: List[Dict[str, Any]],
        claims: List[Dict[str, Any]],
        evidence_items: List[Dict[str, Any]],
        verifications: List[Dict[str, Any]],
        contradictions: List[Dict[str, Any]],
        timeline_events: List[Dict[str, Any]],
        investigations: List[Dict[str, Any]],
        output_filename: Optional[str] = None
    ) -> str:
        """
        Generates a comprehensive forensic investigation PDF report.
        Strictly segregates original statements, AI reconstructions, factual evidence, and hypotheses.
        """
        os.makedirs(settings.REPORTS_DIR, exist_ok=True)
        timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        case_id = case_data.get("id", "0")
        
        if not output_filename:
            output_filename = f"case_{case_id}_investigation_report_{timestamp_str}.pdf"
            
        file_path = os.path.join(settings.REPORTS_DIR, output_filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        
        # Custom palette
        PRIMARY_COLOR = colors.HexColor("#1A365D")   # Deep Navy
        SECONDARY_COLOR = colors.HexColor("#2B6CB0") # Slate Blue
        ACCENT_WARN = colors.HexColor("#C53030")     # Crimson
        BG_LIGHT = colors.HexColor("#EDF2F7")        # Light Gray
        TEXT_DARK = colors.HexColor("#2D3748")

        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Heading1"],
            fontSize=22,
            leading=26,
            textColor=PRIMARY_COLOR,
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            "ReportSubtitle",
            parent=styles["Normal"],
            fontSize=11,
            leading=14,
            textColor=SECONDARY_COLOR,
            spaceAfter=15
        )

        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=PRIMARY_COLOR,
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True
        )

        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=13,
            textColor=TEXT_DARK
        )

        italic_notice = ParagraphStyle(
            "ItalicNotice",
            parent=styles["Italic"],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#4A5568")
        )

        ethics_box = ParagraphStyle(
            "EthicsNotice",
            parent=styles["Normal"],
            fontSize=8.5,
            leading=12,
            textColor=colors.HexColor("#2C5282")
        )

        story = []

        # 1. Header & Title
        story.append(Paragraph("FRAGMENT FIRST | FORENSIC INVESTIGATION REPORT", subtitle_style))
        story.append(Paragraph(f"Case #{case_id}: {case_data.get('title', 'Untitled Case')}", title_style))
        story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY_COLOR, spaceAfter=12))

        # Case Meta Table
        meta_data = [
            [
                Paragraph("<b>Date Generated:</b>", body_style),
                Paragraph(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), body_style),
                Paragraph("<b>Status:</b>", body_style),
                Paragraph(case_data.get("status", "open").upper(), body_style)
            ],
            [
                Paragraph("<b>Victim ID:</b>", body_style),
                Paragraph(str(case_data.get("victim_id", "N/A")), body_style),
                Paragraph("<b>Investigator ID:</b>", body_style),
                Paragraph(str(case_data.get("investigator_id", "Unassigned")), body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[110, 150, 110, 160])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E0")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # 2. AI Assistance & Ethical Protocols Disclosure
        story.append(Paragraph("<b>MANDATORY AI ASSISTANCE & ETHICS DISCLOSURE:</b>", body_style))
        ethics_text = (
            "This document incorporates trauma-informed AI assistance to reconstruct fragmented statements. "
            "Under platform ethical guidelines: (1) AI does not determine guilt, innocence, or credibility; "
            "(2) Hesitation or fragmented thoughts are never interpreted as deception; "
            "(3) Absence of evidence does not indicate a claim is fabricated; "
            "(4) Final determinations rest solely with qualified human authorities."
        )
        story.append(Paragraph(ethics_text, ethics_box))
        story.append(Spacer(1, 10))

        # 3. Permanent Original Statements
        story.append(Paragraph("1. Original Victim Statement (Permanently Preserved)", section_heading))
        if original_statements:
            for s in original_statements:
                v_text = f"<b>Statement #{s.get('id', '')} (Version {s.get('version', 1)}):</b><br/>{s.get('original_text', '')}"
                story.append(Paragraph(v_text, body_style))
                story.append(Spacer(1, 5))
        else:
            story.append(Paragraph("No original statement recorded.", italic_notice))
        story.append(Spacer(1, 10))

        # 4. Approved Reconstructed Statements
        story.append(Paragraph("2. Victim-Approved Statement Reconstruction", section_heading))
        if approved_reconstructions:
            for r in approved_reconstructions:
                app_status = "Approved by Victim" if r.get("is_approved") else "Pending Victim Approval"
                r_text = f"<b>Reconstruction #{r.get('id', '')} [{app_status}]:</b><br/>{r.get('reconstructed_statement', '')}"
                story.append(Paragraph(r_text, body_style))
                if r.get("preserved_uncertainties"):
                    story.append(Paragraph(f"<i>Preserved Uncertainties:</i> {', '.join(r.get('preserved_uncertainties', []))}", italic_notice))
                story.append(Spacer(1, 5))
        else:
            story.append(Paragraph("No reconstructions approved yet.", italic_notice))
        story.append(Spacer(1, 10))

        # 5. Extracted Atomic Claims
        story.append(Paragraph("3. Extracted Factual Claims", section_heading))
        if claims:
            claims_table_data = [[
                Paragraph("<b>ID</b>", body_style),
                Paragraph("<b>Claim Text</b>", body_style),
                Paragraph("<b>Entities / Uncertainty</b>", body_style)
            ]]
            for c in claims:
                entities = []
                if c.get("people"): entities.append(f"People: {', '.join(c.get('people'))}")
                if c.get("locations"): entities.append(f"Loc: {', '.join(c.get('locations'))}")
                if c.get("times"): entities.append(f"Time: {', '.join(c.get('times'))}")
                if c.get("uncertainty_notes"): entities.append(f"Uncertainty: {c.get('uncertainty_notes')}")
                
                claims_table_data.append([
                    Paragraph(str(c.get("id")), body_style),
                    Paragraph(c.get("claim_text", ""), body_style),
                    Paragraph("<br/>".join(entities) if entities else "None flagged", italic_notice)
                ])
            c_table = Table(claims_table_data, colWidths=[35, 325, 170])
            c_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(c_table)
        else:
            story.append(Paragraph("No factual claims extracted.", italic_notice))
        story.append(Spacer(1, 10))

        # 6. Evidence Inventory
        story.append(Paragraph("4. Evidence Inventory", section_heading))
        if evidence_items:
            ev_data = [[
                Paragraph("<b>ID</b>", body_style),
                Paragraph("<b>Filename / Title</b>", body_style),
                Paragraph("<b>Type</b>", body_style),
                Paragraph("<b>Extracted Content Snippet</b>", body_style)
            ]]
            for ev in evidence_items:
                snippet = (ev.get("extracted_text") or "No text content")[:120].replace("\n", " ") + "..."
                ev_data.append([
                    Paragraph(str(ev.get("id")), body_style),
                    Paragraph(ev.get("original_filename") or ev.get("filename", ""), body_style),
                    Paragraph(ev.get("file_type", "").upper(), body_style),
                    Paragraph(snippet, italic_notice)
                ])
            ev_table = Table(ev_data, colWidths=[35, 160, 65, 270])
            ev_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(ev_table)
        else:
            story.append(Paragraph("No evidence documents currently registered.", italic_notice))
        story.append(Spacer(1, 10))

        # 7. AI Claim Verification Assessments
        story.append(Paragraph("5. Evidence Corroboration & Verification Assessments", section_heading))
        if verifications:
            v_data = [[
                Paragraph("<b>Claim ID</b>", body_style),
                Paragraph("<b>Verification Status</b>", body_style),
                Paragraph("<b>Assessment & Evidence Citations</b>", body_style)
            ]]
            for v in verifications:
                status_val = v.get("status", "Unverified")
                status_color = "#276749" if status_val == "Supported" else ("#C53030" if status_val == "Contradicted" else "#B7791F")
                status_html = f"<font color='{status_color}'><b>{status_val}</b></font>"
                
                exp = f"{v.get('explanation', '')}<br/>"
                if v.get("evidence_ids"):
                    exp += f"<i>Referenced Evidence IDs:</i> {v.get('evidence_ids')}<br/>"
                if v.get("limitations"):
                    exp += f"<i>Limitations:</i> {', '.join(v.get('limitations'))}"

                v_data.append([
                    Paragraph(str(v.get("claim_id")), body_style),
                    Paragraph(status_html, body_style),
                    Paragraph(exp, body_style)
                ])
            v_table = Table(v_data, colWidths=[60, 120, 350])
            v_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(v_table)
        else:
            story.append(Paragraph("No claim verifications performed yet.", italic_notice))
        story.append(Spacer(1, 10))

        # 8. Potential Discrepancies & Contradictions
        story.append(Paragraph("6. Identified Informational Divergences", section_heading))
        if contradictions:
            for c in contradictions:
                disc_text = (
                    f"<b>Discrepancy [{c.get('contradiction_id', 'DISC')}]:</b> {c.get('discrepancy_explanation', '')}<br/>"
                    f"<i>Conflicting Claim IDs:</i> {c.get('conflicting_claim_ids', [])} | "
                    f"<i>Relevant Evidence:</i> {c.get('relevant_evidence_ids', [])}<br/>"
                    f"<i>Uncertainties:</i> {', '.join(c.get('uncertainties', []))}"
                )
                story.append(Paragraph(disc_text, body_style))
                story.append(Spacer(1, 5))
        else:
            story.append(Paragraph("No critical contradictory evidence discovered between records.", italic_notice))
        story.append(Spacer(1, 10))

        # 9. Chronological Timeline
        story.append(Paragraph("7. Chronological Incident Timeline", section_heading))
        if timeline_events:
            t_data = [[
                Paragraph("<b>Date / Time</b>", body_style),
                Paragraph("<b>Precision</b>", body_style),
                Paragraph("<b>Event Description</b>", body_style)
            ]]
            for ev in timeline_events:
                t_data.append([
                    Paragraph(ev.get("date_time_str") or "Unknown", body_style),
                    Paragraph(ev.get("time_precision", "approximate").capitalize(), italic_notice),
                    Paragraph(ev.get("description", ""), body_style)
                ])
            t_table = Table(t_data, colWidths=[110, 80, 340])
            t_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), BG_LIGHT),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E0")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_table)
        else:
            story.append(Paragraph("No timeline events plotted.", italic_notice))
        story.append(Spacer(1, 10))

        # 10. Alternative Hypotheses & Counterfactual Analysis
        story.append(Paragraph("8. Alternative Investigative Hypotheses & Counterfactuals", section_heading))
        if investigations:
            for inv in investigations:
                h_type = "COUNTERFACTUAL ANALYSIS" if inv.get("is_counterfactual") else "INVESTIGATIVE HYPOTHESIS"
                h_text = (
                    f"<b>[{h_type}] {inv.get('label', '')}:</b><br/>"
                    f"{inv.get('hypothesis_text', '')}<br/>"
                    f"<i>Assumptions:</i> {', '.join(inv.get('assumptions', []))}<br/>"
                    f"<i>Missing Information Required:</i> {', '.join(inv.get('missing_information', []))}"
                )
                story.append(Paragraph(h_text, body_style))
                story.append(Spacer(1, 6))
        else:
            story.append(Paragraph("No alternative hypotheses documented.", italic_notice))
        story.append(Spacer(1, 15))

        # Footer Signature & Disclaimer
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E0"), spaceAfter=10))
        story.append(Paragraph(
            "CONFIDENTIAL LEGAL WORK PRODUCT - FOR AUTHORIZED HUMAN INVESTIGATIVE AND LEGAL USE ONLY. "
            "Fragment First Platform strictly prohibits using AI reconstruction outputs to determine individual credibility.",
            italic_notice
        ))

        doc.build(story)
        return file_path


report_service = ReportService()
