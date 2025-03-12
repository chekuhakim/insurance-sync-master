
import { format, addDays } from "date-fns";

// Current date - using March 11, 2025 as specified in the requirements
export const CURRENT_DATE = new Date("2025-03-11");

// Type definitions
export type Site = {
  id: number;
  name: string;
  address: string;
  insuranceGroupId: number;
};

export type InsuranceGroup = {
  id: number;
  provider: string;
  endDate: Date;
};

export type InsuranceRequest = {
  id: number;
  siteName: string;
  address: string;
  insuranceType: "Normal" | "Special";
  specialDetails?: string;
  requestDate: Date;
  status: "Pending" | "Approved" | "Denied";
};

// Helper functions
export const formatDate = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

export const getDaysUntil = (date: Date) => {
  const timeDiff = date.getTime() - CURRENT_DATE.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isExpiringSoon = (date: Date) => {
  return getDaysUntil(date) <= 30;
};

// Mock data
export const mockInsuranceGroups: InsuranceGroup[] = [
  {
    id: 1,
    provider: "Allianz",
    endDate: new Date("2025-12-31"),
  },
  {
    id: 2,
    provider: "State Farm",
    endDate: new Date("2025-04-15"),
  },
  {
    id: 3,
    provider: "AIG",
    endDate: new Date("2025-03-25"),
  },
  {
    id: 4,
    provider: "Zurich",
    endDate: new Date("2026-03-11"),
  },
  {
    id: 5,
    provider: "Prudential",
    endDate: new Date("2025-05-20"),
  },
];

export const mockSites: Site[] = [
  {
    id: 1,
    name: "Downtown Warehouse",
    address: "123 Main St, New York, NY",
    insuranceGroupId: 1,
  },
  {
    id: 2,
    name: "East Coast Distribution Center",
    address: "456 Commerce Ave, Boston, MA",
    insuranceGroupId: 2,
  },
  {
    id: 3,
    name: "West Side Factory",
    address: "789 Industrial Blvd, Chicago, IL",
    insuranceGroupId: 3,
  },
  {
    id: 4,
    name: "New Factory",
    address: "456 Oak Rd, Seattle, WA",
    insuranceGroupId: 4,
  },
  {
    id: 5,
    name: "Storage Facility",
    address: "101 Container Way, Miami, FL",
    insuranceGroupId: 5,
  },
];

export const mockRequests: InsuranceRequest[] = [
  {
    id: 1,
    siteName: "South Campus Office",
    address: "222 University Blvd, Austin, TX",
    insuranceType: "Normal",
    requestDate: addDays(CURRENT_DATE, -5),
    status: "Approved",
  },
  {
    id: 2,
    siteName: "Research Lab",
    address: "333 Science Park, San Francisco, CA",
    insuranceType: "Special",
    specialDetails: "Contains high-value laboratory equipment",
    requestDate: addDays(CURRENT_DATE, -3),
    status: "Pending",
  },
  {
    id: 3,
    siteName: "Data Center",
    address: "444 Server Lane, Dallas, TX",
    insuranceType: "Special",
    specialDetails: "Fire suppression system and power backup requirements",
    requestDate: addDays(CURRENT_DATE, -1),
    status: "Pending",
  },
  {
    id: 4,
    siteName: "Downtown Retail Store",
    address: "555 Market St, Philadelphia, PA",
    insuranceType: "Normal",
    requestDate: addDays(CURRENT_DATE, -10),
    status: "Denied",
  },
];

// Helper function to get linked data
export const getSiteInsuranceGroup = (siteId: number) => {
  const site = mockSites.find((site) => site.id === siteId);
  if (!site) return null;
  
  return mockInsuranceGroups.find((group) => group.id === site.insuranceGroupId);
};

export const getInsuranceGroupSites = (groupId: number) => {
  return mockSites.filter((site) => site.insuranceGroupId === groupId);
};
