import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = [
  {
    id: "lead_detective",
    title: "Lead Detective",
    name: "Det. Elena Vance",
    badge: "Badge #7492",
    agency: "Metro Transit Police Department",
    division: "Major Incident Taskforce",
    clearance: "RESTRICTED // LAW ENFORCEMENT SENSITIVE",
    email: "det.vance@metro-authority.gov",
    avatar: "EV"
  },
  {
    id: "forensic_specialist",
    title: "Forensic Specialist",
    name: "Marcus Lin",
    badge: "Forensics #F-441",
    agency: "State Digital & Physical Forensics Lab",
    division: "SCADA & Telemetry Cyber Division",
    clearance: "SECRET // FORENSIC INTEGRITY SEAL",
    email: "m.lin@metro-forensics.gov",
    avatar: "ML"
  },
  {
    id: "legal_counsel",
    title: "Legal Oversight Counsel",
    name: "Rachel Stern, Esq.",
    badge: "Bar #NY-89104",
    agency: "Office of the District Attorney",
    division: "Special Investigations & Admissibility",
    clearance: "RESTRICTED // LEGAL OVERSIGHT PRIVILEGED",
    email: "r.stern@metro-legal.gov",
    avatar: "RS"
  },
  {
    id: "senior_investigator",
    title: "Senior Investigator",
    name: "Cmdr. Samuel Hayes",
    badge: "Command #0019",
    agency: "Inter-Agency Joint Emergency Oversight",
    division: "Incident Command Staff",
    clearance: "TOP SECRET // INTER-AGENCY MULTI-SOURCE",
    email: "s.hayes@joint-authority.gov",
    avatar: "SH"
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(ROLES[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [mfaVerified, setMfaVerified] = useState(true);

  const login = (email, password, roleId, mfaToken) => {
    const selectedRole = ROLES.find(r => r.id === roleId) || ROLES[0];
    setCurrentUser({
      ...selectedRole,
      email: email || selectedRole.email
    });
    setIsAuthenticated(true);
    setMfaVerified(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setMfaVerified(false);
  };

  const switchRole = (roleId) => {
    const found = ROLES.find(r => r.id === roleId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        mfaVerified,
        login,
        logout,
        switchRole,
        availableRoles: ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
