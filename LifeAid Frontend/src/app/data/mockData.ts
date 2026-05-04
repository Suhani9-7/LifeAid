export interface MedicalCase {
  id: string;
  patientName: string;
  patientAge: number;
  diagnosis: string;
  story: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'pending' | 'verified' | 'rejected' | 'completed';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  doctorVerified: boolean;
  doctorComment?: string;
  doctorName?: string;
  dateCreated: string;
  category: string;
  location: string;
  imageUrl?: string;
}

export interface Donation {
  id: string;
  caseId: string;
  donorName: string;
  amount: number;
  date: string;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'donor' | 'organization';
  phone?: string;
}

export const mockCases: MedicalCase[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    patientAge: 34,
    diagnosis: 'Cardiac Surgery - Valve Replacement',
    story: 'Sarah is a single mother of two who needs urgent cardiac valve replacement surgery. She has been diagnosed with severe mitral valve regurgitation and requires immediate medical intervention.',
    targetAmount: 50000,
    raisedAmount: 32000,
    status: 'verified',
    urgency: 'critical',
    doctorVerified: true,
    doctorComment: 'Patient requires immediate surgical intervention. The valve replacement is critical and time-sensitive.',
    doctorName: 'Dr. Michael Chen',
    dateCreated: '2026-03-05',
    category: 'Cardiac Surgery',
    location: 'Boston, MA',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800'
  },
  {
    id: '2',
    patientName: 'James Williams',
    patientAge: 58,
    diagnosis: 'Cancer Treatment - Chemotherapy',
    story: 'James was recently diagnosed with stage 3 colon cancer. He needs to start chemotherapy treatment immediately but cannot afford the medical expenses.',
    targetAmount: 75000,
    raisedAmount: 45000,
    status: 'verified',
    urgency: 'high',
    doctorVerified: true,
    doctorComment: 'Patient diagnosed with stage 3 colon cancer. Chemotherapy treatment plan has been prepared and should begin within 2 weeks.',
    doctorName: 'Dr. Emily Rodriguez',
    dateCreated: '2026-03-01',
    category: 'Cancer Treatment',
    location: 'Los Angeles, CA',
    imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800'
  },
  {
    id: '3',
    patientName: 'Maria Garcia',
    patientAge: 7,
    diagnosis: 'Pediatric Surgery - Cleft Palate Repair',
    story: 'Maria is a 7-year-old girl who needs corrective surgery for cleft palate. This surgery will help her speak and eat normally.',
    targetAmount: 25000,
    raisedAmount: 18000,
    status: 'verified',
    urgency: 'medium',
    doctorVerified: true,
    doctorComment: 'Scheduled for cleft palate repair surgery. The procedure will significantly improve quality of life.',
    doctorName: 'Dr. Susan Park',
    dateCreated: '2026-02-28',
    category: 'Pediatric Surgery',
    location: 'Houston, TX',
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800'
  },
  {
    id: '4',
    patientName: 'Robert Brown',
    patientAge: 45,
    diagnosis: 'Kidney Transplant',
    story: 'Robert has been on dialysis for 3 years and urgently needs a kidney transplant. A matching donor has been found but he needs financial support for the surgery.',
    targetAmount: 120000,
    raisedAmount: 85000,
    status: 'verified',
    urgency: 'critical',
    doctorVerified: true,
    doctorComment: 'Donor match found. Transplant surgery scheduled pending financial clearance. This is a life-saving procedure.',
    doctorName: 'Dr. Michael Chen',
    dateCreated: '2026-03-08',
    category: 'Organ Transplant',
    location: 'New York, NY',
    imageUrl: 'https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800'
  },
  {
    id: '5',
    patientName: 'Lisa Thompson',
    patientAge: 29,
    diagnosis: 'Spinal Cord Surgery',
    story: 'Lisa suffered a severe spinal injury in a car accident. She needs urgent spinal surgery to prevent permanent paralysis.',
    targetAmount: 95000,
    raisedAmount: 12000,
    status: 'pending',
    urgency: 'critical',
    doctorVerified: false,
    dateCreated: '2026-03-10',
    category: 'Neurosurgery',
    location: 'Chicago, IL',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
  },
  {
    id: '6',
    patientName: 'David Lee',
    patientAge: 52,
    diagnosis: 'Diabetes Management & Treatment',
    story: 'David needs ongoing diabetes treatment and insulin therapy. His condition has worsened and requires intensive medical management.',
    targetAmount: 30000,
    raisedAmount: 22000,
    status: 'verified',
    urgency: 'medium',
    doctorVerified: true,
    doctorComment: 'Patient requires continuous glucose monitoring and insulin pump therapy for better diabetes management.',
    doctorName: 'Dr. Emily Rodriguez',
    dateCreated: '2026-02-25',
    category: 'Chronic Disease',
    location: 'Phoenix, AZ',
    imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800'
  }
];

export const mockDonations: Donation[] = [
  { id: '1', caseId: '1', donorName: 'Anonymous', amount: 5000, date: '2026-03-10', message: 'Praying for your recovery!' },
  { id: '2', caseId: '1', donorName: 'John Smith', amount: 2000, date: '2026-03-09', message: 'Stay strong!' },
  { id: '3', caseId: '1', donorName: 'Healthcare Foundation', amount: 10000, date: '2026-03-08' },
  { id: '4', caseId: '2', donorName: 'Anonymous', amount: 3000, date: '2026-03-11' },
  { id: '5', caseId: '2', donorName: 'Community Trust', amount: 15000, date: '2026-03-07', message: 'Supporting your fight!' },
  { id: '6', caseId: '3', donorName: 'Children\'s Fund', amount: 8000, date: '2026-03-09', message: 'For Maria\'s bright future' },
  { id: '7', caseId: '4', donorName: 'Kidney Foundation', amount: 25000, date: '2026-03-10' },
  { id: '8', caseId: '4', donorName: 'Anonymous', amount: 10000, date: '2026-03-09' },
];

export const mockStats = {
  patientsHelped: 2847,
  donationsCollected: 4250000,
  activeCases: 156,
  verifiedDoctors: 342
};
