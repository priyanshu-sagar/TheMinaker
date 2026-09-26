/**
 * Shared "Premium 3D Glassmorphism" tokens — used by the portal selector and
 * the Gateman portal. Kept separate from the plain auth theme so the auth
 * module's classic look is untouched.
 */
export const glass = {
  cardBg: 'rgba(255, 255, 255, 0.75)',
  cardBgStrong: 'rgba(255, 255, 255, 0.88)',
  border: 'rgba(255, 255, 255, 0.4)',
  overlayBg: 'rgba(15, 23, 42, 0.45)',
  shadow: '#0f172a',
} as const;

/** Layered, softly-angled gradients approximate a mesh gradient without a shader. */
export const meshLayers = [
  { colors: ['#eef2ff', '#f5f3ff'] as const, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  { colors: ['#fff7ed00', '#fff7ed'] as const, start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
] as const;

export const portalAccents = {
  parent: { from: '#3B82F6', to: '#60A5FA', icon: '👨‍👩‍👧' },
  teacher: { from: '#8B5CF6', to: '#A78BFA', icon: '🎓' },
  gateman: { from: '#F97316', to: '#FB923C', icon: '🚪' },
  conductor: { from: '#10B981', to: '#34D399', icon: '🚌' },
  schoolAdmin: { from: '#334155', to: '#64748B', icon: '🏫' },
} as const;

/** Extended action palette — moves off uniform green per the V2 spec. */
export const actionColors = {
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.14)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.12)',
  boarded: '#3B82F6',
  boardedBg: 'rgba(59, 130, 246, 0.12)',
  dropped: '#F97316',
  droppedBg: 'rgba(249, 115, 22, 0.12)',
  checkedOut: '#8B5CF6',
  checkedOutBg: 'rgba(139, 92, 246, 0.12)',
  neutral: '#8a939e',
  neutralBg: 'rgba(148, 163, 184, 0.15)',
} as const;
