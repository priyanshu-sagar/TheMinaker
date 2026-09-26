/**
 * Classic, high-contrast theme for the authentication module.
 * Kept local to the mobile app (no new workspace dependency) so it does not
 * touch package.json while another session is installing packages there.
 */
export const colors = {
  background: '#f4f6f8',
  surface: '#ffffff',
  border: '#d7dce2',
  borderStrong: '#b9c2cc',
  textPrimary: '#111827',
  textSecondary: '#5b6572',
  textMuted: '#8a939e',
  primary: '#1a4f8b',
  primaryPressed: '#123a68',
  danger: '#9b2c2c',
  dangerBg: '#fdecec',
  dangerBorder: '#f3c6c6',
  info: '#1f5c8b',
  infoBg: '#eaf3fb',
  infoBorder: '#c9e0f2',
  warning: '#8a5a00',
  warningBg: '#fdf3df',
  warningBorder: '#f0dba9',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
} as const;

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.textSecondary },
  label: { fontSize: 14, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 15, color: colors.textPrimary },
  caption: { fontSize: 13, color: colors.textMuted },
};
