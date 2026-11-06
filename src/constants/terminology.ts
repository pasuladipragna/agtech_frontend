/**
 * Global Terminology Dictionary
 * 
 * As per Rule 68: Every user-facing word or phrase must come from this 
 * approved terminology system wherever practical. Do not use different 
 * names for the same feature on different pages.
 */

export const TERMS = {
  // Roles and Entities
  farmer: "Farmer",
  farm: "Farm",
  field: "Field",
  crop: "Crop",
  rover: "Rover",
  
  // Monitoring & Analysis
  cropHealth: "Crop Health",
  detectedProblem: "Detected Problem",
  liveCamera: "Live Camera",
  
  // Operations
  spraying: "Spraying",
  sprayTank: "Spray Tank",
  roverStatus: "Rover Status",
  fieldTask: "Field Task",
  
  // Generic Navigation/Modules
  reports: "Reports",
  notifications: "Notifications",
  support: "Support",
  community: "Community",
  
  // Registration & Auth
  registrationRequest: "Registration Request",
  accountActivation: "Account Activation",
  approve: "Approve",
  reject: "Reject",
} as const;

export type TerminologyKey = keyof typeof TERMS;
