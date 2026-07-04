/**
 * Sample leads database for seeding.
 * Contains 6 realistic opportunities representing Indian companies and contact people,
 * distributed across various pipeline stages.
 * Conforms to the Lead object type definition and includes compatibility mappings.
 * 
 * Shape of the Lead object:
 * {
 *   id: string,
 *   name: string,
 *   company: string,
 *   email: string,
 *   phone: string,
 *   status: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost',
 *   source: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other',
 *   createdAt: string (ISO date)
 * }
 */
export const sampleLeads = [
  {
    id: "lead-1",
    name: "Aarav Sharma",
    company: "Apex Tech Labs",
    email: "aarav@apexlabs.in",
    phone: "+91 98765 43210",
    status: "New",
    stage: "New", // Compatibility field
    source: "Website",
    value: 12000,
    createdAt: "2026-06-20T09:00:00.000Z",
    date: "2026-06-20" // Compatibility field
  },
  {
    id: "lead-2",
    name: "Aditi Rao",
    company: "Design Horizon",
    email: "aditi@designhorizon.com",
    phone: "+91 87654 32109",
    status: "New",
    stage: "New", // Compatibility field
    source: "LinkedIn",
    value: 8500,
    createdAt: "2026-06-23T14:30:00.000Z",
    date: "2026-06-23" // Compatibility field
  },
  {
    id: "lead-3",
    name: "Rohan Verma",
    company: "Vedic Foods",
    email: "rohan@vedicfoods.co.in",
    phone: "+91 76543 21098",
    status: "Contacted",
    stage: "Contacted", // Compatibility field
    source: "Cold Call",
    value: 15000,
    createdAt: "2026-06-18T11:15:00.000Z",
    date: "2026-06-18" // Compatibility field
  },
  {
    id: "lead-4",
    name: "Priya Patel",
    company: "Zeta Consulting",
    email: "priya@zetaconsulting.com",
    phone: "+91 65432 10987",
    status: "Won",
    stage: "Won", // Compatibility field
    source: "Referral",
    value: 45000,
    createdAt: "2026-06-12T16:45:00.000Z",
    date: "2026-06-12" // Compatibility field
  },
  {
    id: "lead-5",
    name: "Vikram Malhotra",
    company: "Stellar Logistics",
    email: "vikram@stellarlogistics.in",
    phone: "+91 54321 09876",
    status: "Lost",
    stage: "Lost", // Compatibility field
    source: "Email Campaign",
    value: 23000,
    createdAt: "2026-06-08T10:00:00.000Z",
    date: "2026-06-08" // Compatibility field
  },
  {
    id: "lead-6",
    name: "Ananya Iyer",
    company: "Blueberry Creative",
    email: "ananya@blueberry.io",
    phone: "+91 43210 98765",
    status: "Meeting Scheduled",
    stage: "Meeting Scheduled", // Compatibility field
    source: "Website",
    value: 31000,
    createdAt: "2026-06-21T13:00:00.000Z",
    date: "2026-06-21" // Compatibility field
  }
];
