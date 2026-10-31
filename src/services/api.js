import axios from 'axios';
import { SYNTHETIC_CASES, INITIAL_AUDIT_LOGS } from '../data/syntheticCases';

// Base Axios instance configured for FRAGMENT FIRST Authority API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Platform': 'FRAGMENT-FIRST-AUTHORITY',
    'X-Clearance-Level': 'RESTRICTED-LE-SENSITIVE'
  }
});

// Simulated delay helper for realistic enterprise feel
const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback & Mock API Service Layer for frontend development
export const investigationApi = {
  // Case operations
  getCases: async () => {
    await simulateDelay(250);
    return { data: SYNTHETIC_CASES, status: 200 };
  },

  getCaseById: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase, status: 200 };
  },

  // Statement Review operations
  getStatementData: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.statements, status: 200 };
  },

  // Evidence Explorer operations
  getEvidenceList: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.evidence, status: 200 };
  },

  // Claim Verification operations
  getClaims: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.claims, status: 200 };
  },

  updateClaimStatus: async (caseId, claimId, newStatus, explanation) => {
    await simulateDelay(350);
    return {
      data: {
        success: true,
        caseId,
        claimId,
        newStatus,
        explanation,
        updatedAt: new Date().toISOString()
      },
      status: 200
    };
  },

  // Timeline operations
  getTimelineEvents: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.timeline, status: 200 };
  },

  // Correlation operations
  getCorrelationGraph: async (caseId) => {
    await simulateDelay(250);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.correlationData, status: 200 };
  },

  // Root cause operations
  getRootCauses: async (caseId) => {
    await simulateDelay(200);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.rootCauses, status: 200 };
  },

  // Report operations
  getInvestigationReport: async (caseId) => {
    await simulateDelay(300);
    const foundCase = SYNTHETIC_CASES.find(c => c.id === caseId) || SYNTHETIC_CASES[0];
    return { data: foundCase.report, status: 200 };
  },

  // Audit Log operations
  getAuditLogs: async () => {
    await simulateDelay(200);
    return { data: INITIAL_AUDIT_LOGS, status: 200 };
  },

  recordAuditLog: async (logEntry) => {
    await simulateDelay(150);
    return {
      data: {
        ...logEntry,
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        blockNumber: Math.floor(48920 + Math.random() * 1000)
      },
      status: 201
    };
  }
};

export default apiClient;
