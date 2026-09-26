import { create } from 'zustand';
import { MockSchool } from './mock-directory';
import { ProvisionedRole } from './mock-auth-api';

type ParentDraft = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentName: string;
  rollNumber: string;
  schoolCode: string;
  grade: string;
};

export const EMPTY_PARENT_DRAFT: ParentDraft = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  studentName: '',
  rollNumber: '',
  schoolCode: '',
  grade: '',
};

/** Pending provisioned login carried from a login screen into set-new-password. */
type PendingProvisioned = {
  role: ProvisionedRole;
  id: string;
  fullName: string;
};

type AuthFlowState = {
  parentDraft: ParentDraft;
  setParentDraft: (patch: Partial<ParentDraft>) => void;
  resetParentDraft: () => void;

  signupOtp: string | null;
  setSignupOtp: (otp: string | null) => void;

  selectedSchool: MockSchool | null;
  setSelectedSchool: (school: MockSchool | null) => void;

  pendingProvisioned: PendingProvisioned | null;
  setPendingProvisioned: (value: PendingProvisioned | null) => void;

  resetPasswordOtp: string | null;
  setResetPasswordOtp: (otp: string | null) => void;
};

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  parentDraft: EMPTY_PARENT_DRAFT,
  setParentDraft: (patch) => set((state) => ({ parentDraft: { ...state.parentDraft, ...patch } })),
  resetParentDraft: () => set({ parentDraft: EMPTY_PARENT_DRAFT, signupOtp: null }),

  signupOtp: null,
  setSignupOtp: (otp) => set({ signupOtp: otp }),

  selectedSchool: null,
  setSelectedSchool: (school) => set({ selectedSchool: school }),

  pendingProvisioned: null,
  setPendingProvisioned: (value) => set({ pendingProvisioned: value }),

  resetPasswordOtp: null,
  setResetPasswordOtp: (otp) => set({ resetPasswordOtp: otp }),
}));
