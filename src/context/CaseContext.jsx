import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SYNTHETIC_CASES, INITIAL_AUDIT_LOGS } from '../data/syntheticCases';
import { investigationApi } from '../services/api';
import { useAuth } from './AuthContext';

const CaseContext = createContext(null);

export const CaseProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();

  const [cases, setCases]               = useState(SYNTHETIC_CASES);
  const [currentCaseId, setCurrentCaseId] = useState(SYNTHETIC_CASES[0].id);
  const [auditLogs, setAuditLogs]       = useState(INITIAL_AUDIT_LOGS);
  const [casesLoading, setCasesLoading] = useState(false);

  const currentCase = cases.find(c => c.id === currentCaseId) || cases[0];

  // ── Load real cases from backend when authenticated ───────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    setCasesLoading(true);
    investigationApi.getCases()
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setCases(data);
          setCurrentCaseId(data[0].id);
        }
        // If backend returned no cases, synthetic cases remain as default
      })
      .catch(() => {
        // Backend unreachable — keep synthetic data
      })
      .finally(() => setCasesLoading(false));
  }, [isAuthenticated]);

  // ── Audit log recording ───────────────────────────────────────────────────
  const recordAction = useCallback((actionType, details, severity = 'INFO') => {
    const newLog = {
      id:         `AUD-${Date.now().toString().slice(-4)}`,
      timestamp:  new Date().toISOString(),
      caseId:     currentCaseId,
      actionType,
      user:       currentUser ? currentUser.email   : 'system@authority.gov',
      role:       currentUser ? currentUser.title   : 'Investigator',
      ipAddress:  '10.240.18.42 (Internal LAN)',
      details,
      tamperProofHash: Array.from(
        { length: 64 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      blockNumber: (auditLogs[0]?.blockNumber || 48920) + 1,
      severity,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [currentCaseId, currentUser, auditLogs]);

  // ── Claim status update ───────────────────────────────────────────────────
  const updateClaimStatus = useCallback((claimId, newStatus, newExplanation) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id !== currentCaseId) return c;
        const updatedClaims = (c.claims || []).map(claim => {
          if (claim.id !== claimId) return claim;
          return { ...claim, status: newStatus, explanation: newExplanation || claim.explanation };
        });
        return { ...c, claims: updatedClaims };
      })
    );

    recordAction(
      'CLAIM_VERIFIED',
      `Modified Claim [${claimId}] status to ${newStatus}. Corroboration rationale updated.`,
      'CRITICAL'
    );
  }, [currentCaseId, recordAction]);

  // ── Select active case ────────────────────────────────────────────────────
  const selectCase = useCallback((caseId) => {
    const target = cases.find(c => c.id === caseId);
    if (target) {
      setCurrentCaseId(caseId);
      recordAction(
        'CASE_ACCESSED',
        `Switched active investigation scope to case [${caseId}: ${target.title}]`,
        'INFO'
      );
    }
  }, [cases, recordAction]);

  return (
    <CaseContext.Provider
      value={{
        cases,
        currentCase,
        currentCaseId,
        casesLoading,
        selectCase,
        updateClaimStatus,
        auditLogs,
        recordAction,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};
