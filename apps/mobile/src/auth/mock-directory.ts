export type MockSchool = {
  id: string;
  name: string;
};

export const MOCK_SCHOOLS: MockSchool[] = [
  { id: 'DPS-NORTH', name: 'Delhi Public School, North' },
  { id: 'DPS-SOUTH', name: 'Delhi Public School, South' },
  { id: 'SVM-001', name: 'Saraswati Vidya Mandir' },
  { id: 'KVS-MH', name: 'Kendriya Vidyalaya, Mumbai' },
  { id: 'RYAN-AND', name: 'Ryan International, Andheri' },
  { id: 'BILLABONG', name: 'Billabong High, Juhu' },
  { id: 'PODAR-01', name: 'Podar International' },
  { id: 'CMS-LKO', name: 'City Montessori School' },
];

const UNVERIFIED_PHONE_DIGITS = '919800000000';

/** Mock of a backend `isPhoneVerified` check — one fixed demo number is unverified. */
export function isUnverifiedPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits === UNVERIFIED_PHONE_DIGITS || digits === UNVERIFIED_PHONE_DIGITS.slice(2);
}

export const PHONE_NOT_VERIFIED_MESSAGE =
  'Phone number is not verified. Please login using your email to verify your phone number, or contact your school admin.';

/** Mock of a backend `isFirstLogin` check — any provisioned ID ending in "1" is first login. */
export function isFirstLoginId(id: string): boolean {
  return /1$/.test(id.trim());
}

export function searchSchools(query: string): { refine: boolean; matches: MockSchool[] } {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { refine: false, matches: [] };
  const matches = MOCK_SCHOOLS.filter(
    (school) => school.name.toLowerCase().includes(q) || school.id.toLowerCase().includes(q),
  );
  if (matches.length > 3) return { refine: true, matches: [] };
  return { refine: false, matches: matches.slice(0, 3) };
}

export function findSchool(id: string): MockSchool | undefined {
  return MOCK_SCHOOLS.find((school) => school.id === id);
}

export function generateMockOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
